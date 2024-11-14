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
import * as crypto from 'crypto';

const async = require('async');
const readFileAsync = promisify(fs.readFile);

@Injectable()
export class TerraformService {
  private s3: S3;
  private lambda: Lambda;
  private dynamoDBClient: DynamoDBClient; 
  private dynamoDbDocClient: DynamoDBDocumentClient;
  private dynamoDB: AWS.DynamoDB.DocumentClient;
  private privateKey: string;
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly secretsService: SecretsService,
    @InjectRepository(Projects)
    private readonly projectRepository: Repository<Projects>,
    
  ) {
    this.s3 = new S3({ region: process.env.AWS_REGION });
    this.lambda = new Lambda({ region: process.env.AWS_REGION });
    this.dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
    this.dynamoDbDocClient = DynamoDBDocumentClient.from(this.dynamoDBClient);
    this.privateKey = fs.readFileSync('private_key.pem', 'utf-8');
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

    const region1 = this.decryptData(region);

    const randomInt = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
    const randomName = projectName + " " + randomInt.toString();

    let errorMessage = await this.getErrorMessageByCID(PID);

    if (errorMessage) {
  // `stderr`에서 에러 메시지 추출
  try {
    const errorData = JSON.parse(errorMessage);
    if (errorData.stderr && typeof errorData.stderr.S === 'string') {
      const stderrContent = errorData.stderr.S;
      const extractedErrors = stderrContent.match(/Error: (.*?)(\\n|$)/g);
      if (extractedErrors) {
        errorMessage = extractedErrors.map(err => err.replace(/Error: /, '').trim()).join('\n');
      } else {
        errorMessage = 'None';
      }
    } else {
      errorMessage = 'None';
    }
  } catch (e) {
    errorMessage = 'None';
  }
} else {
  errorMessage = 'None';
}

    const prompt_content = `
      Recent error - Please generate code that resolves the error. Prioritize fixing the error over the keywords.:
      
      ${errorMessage}

      Generate Terraform code based on the following keywords:
      ${JSON.stringify(keywords)}

      The generated Terraform code should:
      1. You must produce Output only the complete Terraform code without additional explanations, ensuring it is fully deployable with just the AWS credentials and other essential variables specified.
      2. Use variables only for essential credentials or dynamic values that must be configurable at runtime. Specifically, define variables for:
        - \`aws_access_key\` and \`aws_secret_key\` and \`aws_region\` to allow secure credential configuration
        - Any other critical dynamic values specified in the keywords list that must be adjustable.
        - ${randomName} to specify the name of resources created by this Terraform code
        - object names must start with a letter, not a number or special character.
      3. Other configurations, such as instance types, AMIs, and static setup values, can be hardcoded directly into the Terraform code to simplify deployment.

      4. Avoid including AWS credentials directly in the code; assume credentials will be provided through environment variables, such as process.env.AWS_ACCESS_KEY_ID and process.env.AWS_SECRET_ACCESS_KEY, or set up securely through Lambda configuration.

      5. Only produces one code snippet. Be enclosed within triple backticks with 'hcl' specified for syntax highlighting, like:
     \`\`\`hcl
     <Terraform Code>
     \`\`\`
      6. please make s3 acl default(don't mention it).
      7. region is ${region1}. Please create the AMI to match the region.
      8. "Create it without a key pair."
      9. Replace aws_launch_configuration with aws_launch_template in Terraform code, as Launch Configurations are deprecated and Launch Templates are recommended for creating Auto Scaling groups.
      `;

    // 베드락 설정
    const client = new AWS.BedrockRuntime({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const requestBody = {
      max_tokens: 5000,
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

  //   try {
  //   const uid = await this.projectsService.getUIDByPID(PID);
  //   if (uid === null) {
  //     throw new Error('UID not found'); // UID가 null일 경우에 대한 예외 처리
  //   }
  
  //   const { accessKey, secretAccessKey } = await this.secretsService.getUserCredentials(uid);

  //   const { stdout: initStdout, stderr: initStderr } = await execAsync(
  //     `terraform -chdir=${tmpDir} init`
  //   );
  //   if (initStderr) {
  //     console.error(`Terraform init 에러: ${initStderr}`);
  //   } else {
  //     console.log(`Terraform init 성공: ${initStdout}`);
  //   }

  //   // Terraform plan 명령어 실행 (async/await 사용)
  //   const { stdout, stderr } = await execAsync(
  //     `terraform -chdir=${tmpDir} plan -var "aws_access_key=${accessKey}" -var "aws_secret_key=${secretAccessKey}"`
  //   );

  //   console.log('Terraform plan 결과:', stdout);
  //   if (stderr) {
  //     console.error('Terraform plan 중 오류:', stderr);
  //     return {message :stderr,
  //             bool : false}
  //   }
  // } catch (error) {
  //   console.error('Terraform plan 실행 중 오류가 발생했습니다:', error.message);
  // }

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

      let accessKey1 = this.decryptData(accessKey);
      let secretAccessKey1 = this.decryptData(secretAccessKey);
      let region1 = this.decryptData(region);
  
      const { stdout, stderr } = await execAsync(
        `terraform -chdir=${localTerraformPath} apply -auto-approve -var "aws_access_key=${accessKey1}" -var "aws_secret_key=${secretAccessKey1}" -var "aws_region=${region1}"`
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

      this.saveError(error, CID);
      console.error('Deployment error:', error);
      throw new InternalServerErrorException(`Failed to deploy infrastructure: ${error.message}`);
    }
  }

  decryptData(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    console.log("복호화 함수 - 암호화된 데이터 (Base64):", encryptedData);
    console.log("복호화 함수 - 암호화된 데이터 (Buffer):", buffer);
    console.log("복호화 함수 - 사용할 개인 키:\n", this.privateKey);
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    console.log("복호화 함수 - 복호화된 데이터:", decrypted.toString('utf-8'));

    return decrypted.toString('utf-8');
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

      let accessKey1 = this.decryptData(accessKey);
      let secretAccessKey1 = this.decryptData(secretAccessKey);
      let region1 = this.decryptData(region);
  
      // Terraform destroy 명령 실행 (자격 증명 전달)
      const { stdout, stderr } = await execAsync(
        `terraform -chdir=${localTerraformPath} destroy -auto-approve -var "aws_access_key=${accessKey1}" -var "aws_secret_key=${secretAccessKey1}" -var "aws_region=${region1}"`
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

  async getInfrastructureState(CID: number, userId: number, signal: AbortSignal): Promise<any> {
    const localTerraformPath = `/temp/${CID}`;
    const stateFilePath = `${localTerraformPath}/terraform.tfstate`;
    const execAsync = promisify(exec);
    const awsCliPath = `"aws"`;

    try {
      if (signal.aborted) {
        throw new Error('Request was aborted by the client');
      }

      if (!fs.existsSync(stateFilePath)) {
        throw new Error(`State file not found for CID: ${CID}`);
      }

      const { accessKey, secretAccessKey, region } = await this.secretsService.getUserCredentials(userId);

      let accessKey1 = this.decryptData(accessKey);
      let secretAccessKey1 = this.decryptData(secretAccessKey);
      let region1 = this.decryptData(region);

      const options = {
        env: {
          AWS_ACCESS_KEY_ID: accessKey1,
          AWS_SECRET_ACCESS_KEY: secretAccessKey1,
        },
        signal,
      };

      console.log(`Executing: terraform -chdir=${localTerraformPath} state list`);
      const { stdout: listOutput } = await execAsync(`terraform -chdir=${localTerraformPath} state list`, { signal });
      const stateList = listOutput.split('\n').filter(line => line.trim() !== '');

      const serviceStates: any = {};

      function getResourceType(resourceAddress: string): string | null {
        const parts = resourceAddress.split('.');
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].startsWith('aws_')) {
            return parts[i];
          }
        }
        return null;
      }

      // async.eachLimit을 사용하여 동시 실행 제한 적용
      await async.eachLimit(stateList, 4, async (resource) => {
        if (signal.aborted) {
          throw new Error('Request was aborted by the client');
        }

        console.log(`Retrieving details for: ${resource}`);
        const { stdout: detailOutput } = await execAsync(`terraform -chdir=${localTerraformPath} state show ${resource}`, { signal });
        const details = detailOutput;
        const resourceType = getResourceType(resource);

        let resourceId: string | null = null;
        let isRunning = false;

        if (resourceType === "aws_instance") {
          const instanceIdMatch = details.match(/id\s+=\s+"(i-[a-zA-Z0-9]+)"/);
          if (instanceIdMatch) {
            resourceId = instanceIdMatch[1];
            console.log(`Checking running status for EC2 instance: ${resourceId}`);
            try {
              const { stdout: statusOutput } = await execAsync(
                `${awsCliPath} ec2 describe-instance-status --instance-ids ${resourceId} --region ${region1}`,
                options
              );
              const statusData = JSON.parse(statusOutput);
              isRunning = statusData.InstanceStatuses?.some((status: any) => status.InstanceState.Name === "running");
            } catch (awsError) {
              console.error(`Error retrieving EC2 instance status for ${resourceId}:`, awsError);
            }
          }
        } else if (resourceType === "aws_rds_instance") {
          const dbInstanceIdMatch = details.match(/id\s+=\s+"(db-[a-zA-Z0-9]+)"/);
          if (dbInstanceIdMatch) {
            resourceId = dbInstanceIdMatch[1];
            console.log(`Checking running status for RDS instance: ${resourceId}`);
            try {
              const { stdout: statusOutput } = await execAsync(
                `${awsCliPath} rds describe-db-instances --db-instance-identifier ${resourceId} --region ${region1}`,
                options
              );
              const statusData = JSON.parse(statusOutput);
              isRunning = statusData.DBInstances?.some((dbInstance: any) => dbInstance.DBInstanceStatus === "available");
            } catch (awsError) {
              console.error(`Error retrieving RDS instance status for ${resourceId}:`, awsError);
            }
          }
        } else if (resourceType === "aws_s3_bucket") {
          const bucketNameMatch = details.match(/bucket\s+=\s+"([^"]+)"/);
          if (bucketNameMatch) {
            resourceId = bucketNameMatch[1];
            console.log(`S3 버킷 ${resourceId}는 접근 가능한 것으로 간주됩니다`);
            isRunning = true;
          }
        } else if (resourceType === "aws_vpc" || resourceType === "aws_subnet" || resourceType === "aws_security_group") {
          const idMatch = details.match(/id\s+=\s+"([^"]+)"/);
          if (idMatch) {
            resourceId = idMatch[1];
            console.log(`네트워크 리소스 ${resourceId}의 상태를 확인합니다`);
            // 네트워크 리소스는 상태가 실행 여부와 무관하므로 접근 가능한 것으로 간주
            isRunning = true;
          }
        }

        if (resourceId) {
          serviceStates[resourceId] = { resourceType, isRunning };
        }
      });

      console.log('Service states:', serviceStates);

      return {
        status: 'State retrieved successfully',
        serviceStates,
      };
    } catch (error) {
      if (signal.aborted) {
        console.error('Request was aborted by the client');
        throw new Error('Request was aborted by the client');
      }
      console.error('State retrieval error:', error);
      throw new Error(`Failed to retrieve state for CID: ${CID}`);
    }
  }


// 에러 메시지 저장 메서드
async saveError(errorMessage: string, CID: number): Promise<void> {
  const params = {
    TableName: 'Archboard_keyword',
    Key: { CID: CID },
    UpdateExpression: 'SET #errorMessage = :errorMessage, #timestamp = :timestamp',
    ExpressionAttributeNames: {
      '#errorMessage': 'errorMessage',
      '#timestamp': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':errorMessage': errorMessage,
      ':timestamp': new Date().toISOString(),
    },
  };

  try {
    // update 메서드와 .promise() 사용
      await this.dynamoDB.update(params).promise();
      console.log(`에러 메시지 저장 성공: ${errorMessage}`);
    } catch (error) {
      console.error(`에러 메시지 저장 실패: ${error.message}`);
      throw new Error('stateData 저장 실패');
    }
  }

  // CID로 에러 메시지 가져오기 메서드
  async getErrorMessageByCID(CID: number): Promise<string | null> {
    const params = {
      TableName: 'Archboard_keyword',
      Key: { CID: CID },
      ProjectionExpression: 'errorMessage', // errorMessage 필드만 가져오기
    };

    try {
      const result = await this.dynamoDB.get(params).promise();
      if (result.Item && result.Item.errorMessage) {
        console.log(`에러 메시지 불러오기 성공: ${result.Item.errorMessage}`);
        return result.Item.errorMessage;
      } else {
        console.log(`CID ${CID}에 대한 에러 메시지를 찾을 수 없습니다.`);
        return null;
      }
    } catch (error) {
      console.error(`에러 메시지 불러오기 실패: ${error.message}`);
      throw new Error(`Failed to retrieve error message for CID: ${CID}`);
    }
  }

  async getLocalFileContent(filePath: string): Promise<string> {
    try {
      // utf-8 인코딩으로 파일을 비동기적으로 읽기
      const content = await readFileAsync(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }

}