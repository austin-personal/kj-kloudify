import { CIDR } from './../../node_modules/aws-sdk/clients/directconnect.d';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReviewDto } from './dto/review.dto';
import { DeployDto } from './dto/deploy.dto';
import { DownloadDto } from './dto/download.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Projects } from '../projects/entity/projects.entity';

import { SecretsService } from '../secrets/secrets.service';

// AWS 라이브러리
import * as AWS from 'aws-sdk';
import { S3 , GetObjectCommand , GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Lambda } from '@aws-sdk/client-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

import * as fs from 'fs'; // 파일시스템 라이브러리. 동기적으로 폴더를 생성해주고 그 폴더를 사용할수 있다.
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { Readable } from 'stream';

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile , mkdir } from 'fs/promises';
import { ProjectsService } from '../projects/projects.service';
import { execSync } from 'child_process';


@Injectable()
export class TerraformService {
  private s3: S3;
  private lambda: Lambda;
  private dynamoDBClient: DynamoDBClient; 
  private dynamoDbDocClient: DynamoDBDocumentClient;

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly secretsService: SecretsService,
    @InjectRepository(Projects)
    private readonly projectRepository: Repository<Projects>,
  ) {
    this.s3 = new S3({ region: process.env.AWS_REGION });
    this.lambda = new Lambda({ region: process.env.AWS_REGION });
    this.dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

    this.dynamoDbDocClient = DynamoDBDocumentClient.from(this.dynamoDBClient);
  }
  /**
   * AWS Bedrock Claude 3.5 Sonnet을 사용하여 Terraform 코드 생성
   */
  private async generateTerraformCode(keywords: string[], projectName: string, PID: number): Promise<string> {


    const uid = await this.projectsService.getUIDByPID(PID);
    if (uid === null) {
      throw new Error('UID cannot be null');
    }
    const { accessKey, secretAccessKey , region} = await this.secretsService.getUserCredentials(uid);

    const randomInt = Math.floor(Math.random() * (999999999 - 0 + 1)) + 0;
    const randomName = "AWS - " + projectName + randomInt.toString();

    const prompt_content = `
      Generate Terraform code based on the following keywords:
      ${JSON.stringify(keywords)}

      The generated Terraform code should:
      1. You must produce Output only the complete Terraform code without additional explanations, ensuring it is fully deployable with just the AWS credentials and other essential variables specified.
      2. Use variables only for essential credentials or dynamic values that must be configurable at runtime. Specifically, define variables for:
        - \`aws_access_key\` and \`aws_secret_key\` and \`aws_region\` to allow secure credential configuration
        - Any other critical dynamic values specified in the keywords list that must be adjustable.
        - ${randomName} to specify the name of resources created by this Terraform code

      3. Other configurations, such as instance types, AMIs, and static setup values, can be hardcoded directly into the Terraform code to simplify deployment.

      4. Avoid including AWS credentials directly in the code; assume credentials will be provided through environment variables, such as process.env.AWS_ACCESS_KEY_ID and process.env.AWS_SECRET_ACCESS_KEY, or set up securely through Lambda configuration.

      5. Only produces one code snippet. Be enclosed within triple backticks with 'hcl' specified for syntax highlighting, like:
     \`\`\`hcl
     <Terraform Code>
     \`\`\`
      6. please make s3 privately.
      7. region is ${region}. Please create the AMI to match the region.
      `;

    // 베드락 설정
    const client = new AWS.BedrockRuntime({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const requestBody = {
      max_tokens: 1000,
      anthropic_version: 'bedrock-2023-05-31',
      messages: [
          {
              role: 'user',
              content: prompt_content,
          },
      ],
    };

    try {
      // Bedrock 모델 호출
      const response = await client
          .invokeModel({
              body: JSON.stringify(requestBody),
              contentType: 'application/json',
              modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
          })
          .promise();

      const responseBody = response.body.toString();
      const parsedResponse = JSON.parse(responseBody);
      console.log("parsedResponse: ",parsedResponse);
      return parsedResponse;
  } catch (error) {
      throw new Error(`Bedrock 모델 호출 실패: ${error.message}`);
    }
  }

    /**
   * 리뷰: Terraform 코드 생성 및 S3에 저장
   */
  async reviewInfrastructure(reviewDto: ReviewDto): Promise<any> {
    const { CID , PID } = reviewDto;

    // 1. DynamoDB에서 keyword 조회
    const dynamoParams = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: { CID: CID }, // CID를 기준으로 keyword 조회
    };
    const command = new GetCommand(dynamoParams);
    const dynamoResult = await this.dynamoDbDocClient.send(command);
    const keyword = dynamoResult.Item?.keyword;
    if (!keyword) {
        throw new Error('Keyword not found in DynamoDB');
    }

    const projectName = await this.getProjectName(PID);
    let terraformCode: any;
    // 2. Terraform 코드 생성

    if (projectName) {
      terraformCode = await this.generateTerraformCode([keyword], projectName, PID);
    } else {
        throw new Error('Project name not found');
    }
    const codeContent = terraformCode["content"][0].text;

    // 3. ``` ``` 사이의 Terraform 코드만 추출
    // const codeBlock = codeContent.match(/```(?:hcl)?\n([\s\S]*?)\n```/);

    // if (!codeBlock) {
    //     throw new Error('Terraform code block not found');
    // }
    
    // const extractedCode = codeBlock[1];
    let codeBlock = codeContent.match(/```(?:hcl)?\s*\n([\s\S]*?)\n```/i);

    // If the first regex doesn't match, try without specifying 'hcl'
    if (!codeBlock) {
        codeBlock = codeContent.match(/```\s*\n([\s\S]*?)\n```/i);
    }
    
    if (!codeBlock) {
        // As a last resort, assume the entire content is Terraform code
        console.warn('Terraform code block not found using regex. Assuming entire content is code.');
        return {
          status: 'Terraform code generated',
          terraformCode: codeContent,
          bool : true
        };
    }
    
    const extractedCode = codeBlock[1];

    /////

    // 4. Terraform 코드를 임시 디렉토리에 저장
    const tmpDir = `/tmp/${CID}`;
    if (!fs.existsSync(tmpDir)) {  // 디렉토리 존재 확인
      fs.mkdirSync(tmpDir);
    }
    const terraformFilePath = path.join(tmpDir, 'main.tf');
    fs.writeFileSync(terraformFilePath, extractedCode);


    const execAsync = promisify(exec);
    // const credentials = await this.secretsService.getUserCredentials(userId);

    // console.log('Retrieved credentials:', credentials);
    // if (!credentials) {
    //   throw new Error(`User credentials not found for user ID: ${userId}`);
    // }

    try {
    const uid = await this.projectsService.getUIDByPID(PID);
    if (uid === null) {
      throw new Error('UID not found'); // UID가 null일 경우에 대한 예외 처리
    }
  
  const { accessKey, secretAccessKey } = await this.secretsService.getUserCredentials(uid);

    // Terraform plan 명령어 실행 (async/await 사용)
    const { stdout, stderr } = await execAsync(
      `terraform -chdir=${tmpDir} plan -var "aws_access_key=${accessKey}" -var "aws_secret_key=${secretAccessKey}"`
    );

    console.log('Terraform plan 결과:', stdout);
    if (stderr) {
      console.error('Terraform plan 중 오류:', stderr);
      return {message :stderr,
              bool : false}
    }
  } catch (error) {
    console.error('Terraform plan 실행 중 오류가 발생했습니다:', error.message);
  }


    // 5. S3에 Terraform 파일 업로드
    const s3Bucket = process.env.TERRAFORM_BUCKET;
    const s3Key = `${CID}/main.tf`;
    const fileContent = fs.readFileSync(terraformFilePath);

    await this.s3.putObject({
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'application/octet-stream',
    });

    // 6. 생성된 Terraform 코드를 반환
    return {
      status: 'Terraform code generated',
      terraformCode: extractedCode,
      bool : true
    };
  }


  /**
   * S3에 저장된 Terraform 코드를 실행하여 인프라를 배포하는 메서드
   */
  // async deployInfrastructure(deployDto: DeployDto): Promise<any> {
  //   const { userId, CID } = deployDto;

  //   // S3에서 Terraform 파일 경로 설정
  //   const s3Bucket = process.env.TERRAFORM_BUCKET;
  //   const s3Key = `${CID}/main.tf`;

  //   // Lambda 함수 트리거
  //   const lambdaFunctionName = process.env.TERRAFORM_LAMBDA_FUNCTION;
  //   const payload = {
  //     userId,
  //     CID,
  //     s3Bucket,
  //     s3Key,
  //   };

  //   try {
  //     const lambdaResponse = this.lambda.invoke({
  //       FunctionName: lambdaFunctionName,
  //       InvocationType: 'Event', // 비동기 호출
  //       Payload: JSON.stringify(payload),
  //     });
  //     // 프로젝트가 배포 됬으면, Postgres Project entity에도 isDeployed True로 바꾸기
  //     await this.projectRepository.update({ CID }, { isDeployed: true });

  //     return {
  //       status: 'Deployment initiated',
  //       lambdaResponse,
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to trigger Lambda function', error);
  //   }
  // }

  async deployInfrastructure(deployDto: DeployDto): Promise<any> {
    const { CID, userId } = deployDto;
    const execAsync = promisify(exec);
  
    const s3Bucket = process.env.TERRAFORM_BUCKET;
    const s3Key = `${CID}/main.tf`;
    const localTerraformPath = `/temp/${CID}`;  // CID별 디렉토리 생성
    const mainTfFilePath = `${localTerraformPath}/main.tf`;
  
    try {
      console.log(`Starting deployment for CID: ${CID}`);
  
      // 사용자별 AWS 자격 증명 조회
      const credentials = await this.secretsService.getUserCredentials(userId);
      console.log('Retrieved credentials:', credentials);
      if (!credentials) {
        throw new Error(`User credentials not found for user ID: ${userId}`);
      }
  
      const { accessKey, secretAccessKey , region} = credentials;
      console.log("뜨냐?",region);
  
      // AWS S3 클라이언트 설정
      const s3 = new S3({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
  
      // S3에서 Terraform 파일 다운로드
      const command = new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key });
      const fileData: GetObjectCommandOutput = await s3.send(command);
      if (!fileData.Body) throw new Error('S3 파일 데이터가 없습니다.');
      console.log('S3 파일 다운로드 성공');
  
      // CID별 디렉토리 생성
      await fs.promises.mkdir(localTerraformPath, { recursive: true });
      console.log(`Directory created or already exists: ${localTerraformPath}`);
  
      // 파일 내용 읽기 및 저장
      const bodyContent = await this.streamToString(fileData.Body as Readable);
      await fs.promises.writeFile(mainTfFilePath, bodyContent);
      console.log(`Terraform file saved at ${mainTfFilePath}`);
  
      // Terraform 초기화 및 적용
      await execAsync(`terraform -chdir=${localTerraformPath} init`);
      console.log('Terraform 초기화 완료');
  
      const { stdout, stderr } = await execAsync(
        `terraform -chdir=${localTerraformPath} apply -auto-approve -var "aws_access_key=${accessKey}" -var "aws_secret_key=${secretAccessKey}" -var "aws_region=${region}"`
      );
      console.log('Terraform 적용 완료:', stdout);
  
      if (stderr) {
        console.warn('Terraform Warning:', stderr);
      }
  
      // 성공적으로 배포된 경우 프로젝트 엔티티 상태 업데이트
      await this.projectRepository.update({ CID }, { isDeployed: true });
      console.log(`Project deployment status updated for CID: ${CID}`);
  
      return {
        status: 'Deployment successful',
        terraformOutput: stdout,
      };
    } catch (error) {
      console.error('Deployment error:', error);
      throw new InternalServerErrorException(`Failed to deploy infrastructure: ${error.message}`);
    }
  }
  

    // Helper function to convert stream to string
  async streamToString(stream: Readable): Promise<string> {
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
  }
  

  /**
   * S3에 저장된 Terraform 코드를 다운로드하는 메서드
   */
  async downloadInfrastructure(downloadDto: DownloadDto, res: Response): Promise<void> {
    const { CID } = downloadDto;

    const s3Bucket = process.env.TERRAFORM_BUCKET;
    const s3Key = `${CID}/main.tf`;

    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
    };

    try {
      const fileStream = await this.s3.getObject(params);

      // 파일을 다운로드로 전송하기 위해 응답 헤더 설정
      res.setHeader('Content-Disposition', `attachment; filename="${CID}_main.tf"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      if (fileStream.Body instanceof Readable) {
        // Body를 Buffer로 변환하여 전송
        fileStream.Body.pipe(res);
      } else {
        throw new Error("File content is empty");
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to download Terraform file', error);
    }
  }

  async destroyInfrastructure(CID: number, userId: number): Promise<any> {
    const execAsync = promisify(exec);
    const localTerraformPath = `/temp/${CID}`;  // CID별 디렉토리 경로
    const mainTfFilePath = `${localTerraformPath}/main.tf`;
  
    try {
      console.log(`Starting destruction for CID: ${CID}`);
  
      // 사용자별 AWS 자격 증명 조회
      const credentials = await this.secretsService.getUserCredentials(userId);
      console.log('Retrieved credentials:', credentials);
      if (!credentials) {
        throw new Error(`User credentials not found for user ID: ${userId}`);
      }
  
      const { accessKey, secretAccessKey , region} = credentials;
  
      // 해당 경로에 Terraform 파일이 존재하는지 확인
      if (!fs.existsSync(mainTfFilePath)) {
        console.log(`there is no ${CID}`);
        return `there is no ${CID}`;
      }
  
      // Terraform 초기화 (init) - 이미 적용된 상태에서도 destroy를 위해 필요
      await execAsync(`terraform -chdir=${localTerraformPath} init`);
      console.log('Terraform 초기화 완료');
  
      // Terraform destroy 명령 실행 (자격 증명 전달)
      const { stdout, stderr } = await execAsync(
        `terraform -chdir=${localTerraformPath} destroy -auto-approve -var "aws_access_key=${accessKey}" -var "aws_secret_key=${secretAccessKey}" -var "aws_region=${region}"`
      );
      console.log('Terraform 삭제 완료:', stdout);
  
      if (stderr) {
        console.warn('Terraform Warning:', stderr);
      }
  
      // CID 디렉토리 전체 삭제
      await fs.promises.rmdir(localTerraformPath, { recursive: true });
      console.log(`Terraform directory deleted: ${localTerraformPath}`);
  
      return {
        status: 'Destruction successful',
        terraformOutput: stdout,
      };
    } catch (error) {
      console.error('Destruction error:', error);
      throw new InternalServerErrorException(`Failed to destroy infrastructure: ${error.message}`);
    }
  }

  async getProjectName(pid: number): Promise<string | null> {
    const projectName = await this.projectsService.getProjectNameByPID(pid);
    console.log('Project Name:', projectName);
    return projectName;
  }

///////////////////////////////////////////////////////////////////////////////////

  async getInfrastructureState(CID: number, userId: number): Promise<any> {
    const localTerraformPath = `/temp/${CID}`;
    const stateFilePath = `${localTerraformPath}/terraform.tfstate`;
  
    // awsCliPath를 함수 상단으로 이동
    const awsCliPath = "C:/Program Files/Amazon/AWSCLIV2/aws";
  
    try {
      // 상태 파일이 존재하는지 확인
      if (!fs.existsSync(stateFilePath)) {
        throw new Error(`State file not found for CID: ${CID}`);
      }
  
      // AWS 자격 증명 및 옵션 설정
      const { accessKey, secretAccessKey , region} = await this.secretsService.getUserCredentials(userId);
      const options = {
        env: {
          AWS_ACCESS_KEY_ID: accessKey,
          AWS_SECRET_ACCESS_KEY: secretAccessKey,
        },
      };
  
      // Terraform state list 명령어 실행
      console.log(`Executing: terraform -chdir=${localTerraformPath} state list`);
      const listOutputBuffer = execSync(`terraform -chdir=${localTerraformPath} state list`);
      const stateList = listOutputBuffer.toString().split('\n').filter(line => line.trim() !== '');
  
      // 리소스 타입 추출 함수
      function getResourceType(resourceAddress: string): string | null {
        const parts = resourceAddress.split('.');
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].startsWith('aws_')) {
            return parts[i];
          }
        }
        return null;
      }
  
      // 각 리소스에 대해 비동기적으로 state show 명령어 실행
      const detailedStates = await Promise.all(stateList.map(async resource => {
        console.log(`Retrieving details for: ${resource}`);
        const detailOutputBuffer = execSync(`terraform -chdir=${localTerraformPath} state show ${resource}`);
        const details = detailOutputBuffer.toString();
  
        const resourceType = getResourceType(resource);
  
        let instanceState: any = {}; // 여기서 instanceState를 빈 객체로 초기화
  
        let resourceId: string | null = null;
  
        if (resourceType === "aws_instance") {
          // EC2 인스턴스 ID 추출
          const instanceIdMatch = details.match(/id\s+=\s+"(i-[a-zA-Z0-9]+)"/);
          if (instanceIdMatch) {
            resourceId = instanceIdMatch[1];
            console.log(`Extracted Instance ID: ${resourceId}`);
  
            // EC2 인스턴스 상태 정보 가져오기
            console.log(`Executing: aws ec2 describe-instances --instance-ids ${resourceId}`);
            try {
              const stateOutputBuffer = execSync(`"${awsCliPath}" ec2 describe-instances --instance-ids ${resourceId} --region ap-northeast-2`, options);
              instanceState = JSON.parse(stateOutputBuffer.toString());
              console.log('Instance state:', instanceState);
            } catch (awsError) {
              console.error(`Error retrieving EC2 instance state for ${resourceId}:`, awsError);
            }
  
            // 추가: EC2 인스턴스의 CPU 사용률 가져오기
            console.log(`Retrieving CPU utilization for instance ${resourceId}`);
            try {
              const cpuUtilization = getEC2CPUUtilization(resourceId, options);
              instanceState.cpuUtilization = cpuUtilization; // 오류 해결됨
              console.log('CPU Utilization:', cpuUtilization);
            } catch (error) {
              console.error(`Error retrieving CPU utilization for ${resourceId}:`, error);
            }
  
            // 추가: EC2 인스턴스의 네트워크 트래픽 가져오기
            console.log(`Retrieving network traffic for instance ${resourceId}`);
            try {
              const networkTraffic = getEC2NetworkTraffic(resourceId, options);
              instanceState.networkTraffic = networkTraffic; // 오류 해결됨
              console.log('Network Traffic:', networkTraffic);
            } catch (error) {
              console.error(`Error retrieving network traffic for ${resourceId}:`, error);
            }
  
          }
        } else if (resourceType === "aws_s3_bucket") {
          // S3 버킷 이름 추출
          const bucketNameMatch = details.match(/bucket\s+=\s+"([^"]+)"/);
          if (bucketNameMatch) {
            resourceId = bucketNameMatch[1];
            console.log(`Extracted Bucket Name: ${resourceId}`);
  
            // S3 버킷 위치 가져오기
            console.log(`Executing: aws s3api get-bucket-location --bucket ${resourceId}`);
            try {
              const stateOutputBuffer = execSync(`"${awsCliPath}" s3api get-bucket-location --bucket ${resourceId}`, options);
              instanceState = JSON.parse(stateOutputBuffer.toString());
              console.log('Bucket state:', instanceState);
            } catch (awsError) {
              console.error(`Error retrieving S3 bucket state for ${resourceId}:`, awsError);
            }
  
            // 추가: S3 버킷의 사용 용량 가져오기
            console.log(`Retrieving bucket size for ${resourceId}`);
            try {
              const bucketSize = getS3BucketSize(resourceId, options);
              instanceState.bucketSize = bucketSize; // 오류 해결됨
              console.log('Bucket Size:', bucketSize);
            } catch (error) {
              console.error(`Error retrieving bucket size for ${resourceId}:`, error);
            }
  
            // 추가: S3 버킷의 요청 수 가져오기
            console.log(`Retrieving request count for bucket ${resourceId}`);
            try {
              const requestCount = getS3BucketRequestCount(resourceId, options);
              instanceState.requestCount = requestCount; // 오류 해결됨
              console.log('Request Count:', requestCount);
            } catch (error) {
              console.error(`Error retrieving request count for ${resourceId}:`, error);
            }
  
          }
        } else if (resourceType === "aws_security_group") {
          // 보안 그룹 ID 추출
          const groupIdMatch = details.match(/id\s+=\s+"(sg-[a-zA-Z0-9]+)"/);
          if (groupIdMatch) {
            resourceId = groupIdMatch[1];
            console.log(`Extracted Security Group ID: ${resourceId}`);
  
            // 보안 그룹 정보 가져오기
            console.log(`Executing: aws ec2 describe-security-groups --group-ids ${resourceId}`);
            try {
              const stateOutputBuffer = execSync(`"${awsCliPath}" ec2 describe-security-groups --group-ids ${resourceId} --region ap-northeast-2`, options);
              instanceState = JSON.parse(stateOutputBuffer.toString());
              console.log('Security Group state:', instanceState);
            } catch (awsError) {
              console.error(`Error retrieving Security Group state for ${resourceId}:`, awsError);
            }
          }
        } else {
          // 다른 리소스 타입에 대해서는 필요에 따라 처리 추가
          console.log(`Resource type ${resourceType} is not specifically handled.`);
        }
  
        return { details, instanceState };
      }));
  
      console.log('Detailed Terraform state output:', detailedStates);
  
      return {
        status: 'State retrieved successfully',
        resources: stateList,
        detailedStates: detailedStates,
      };
    } catch (error) {
      console.error('State retrieval error:', error);
      throw new Error(`Failed to retrieve state for CID: ${CID}`);
    }
  
    // 헬퍼 함수들은 이제 awsCliPath를 인식할 수 있습니다.
    function getEC2CPUUtilization(instanceId: string, options: any): any {
      const startTime = new Date(Date.now() - 3600 * 1000).toISOString(); // 1시간 전
      const endTime = new Date().toISOString();
  
      const command = `"${awsCliPath}" cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=${instanceId} --start-time ${startTime} --end-time ${endTime} --period 300 --statistics Average --region ap-northeast-2`;
  
      const output = execSync(command, options);
      return JSON.parse(output.toString());
    }
  
    function getEC2NetworkTraffic(instanceId: string, options: any): any {
      const startTime = new Date(Date.now() - 3600 * 1000).toISOString(); // 1시간 전
      const endTime = new Date().toISOString();
  
      const metrics = ['NetworkIn', 'NetworkOut'];
      const networkData: any = {};
  
      for (const metric of metrics) {
        const command = `"${awsCliPath}" cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name ${metric} --dimensions Name=InstanceId,Value=${instanceId} --start-time ${startTime} --end-time ${endTime} --period 300 --statistics Sum --region ap-northeast-2`;
  
        const output = execSync(command, options);
        networkData[metric] = JSON.parse(output.toString());
      }
  
      return networkData;
    }
  
    function getS3BucketSize(bucketName: string, options: any): any {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 3600 * 1000); // 24시간 전
  
      const command = `"${awsCliPath}" cloudwatch get-metric-statistics --namespace AWS/S3 --metric-name BucketSizeBytes --dimensions Name=BucketName,Value=${bucketName} Name=StorageType,Value=StandardStorage --start-time ${startTime.toISOString()} --end-time ${endTime.toISOString()} --period 86400 --statistics Average --region ap-northeast-2`;
  
      const output = execSync(command, options);
      return JSON.parse(output.toString());
    }
  
    function getS3BucketRequestCount(bucketName: string, options: any): any {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 3600 * 1000); // 24시간 전
  
      const command = `"${awsCliPath}" cloudwatch get-metric-statistics --namespace AWS/S3 --metric-name NumberOfObjects --dimensions Name=BucketName,Value=${bucketName} Name=StorageType,Value=AllStorageTypes --start-time ${startTime.toISOString()} --end-time ${endTime.toISOString()} --period 86400 --statistics Average --region ap-northeast-2`;
  
      const output = execSync(command, options);
      return JSON.parse(output.toString());
    }
  }
  
  
  


}