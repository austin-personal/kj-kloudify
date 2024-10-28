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
import { S3 } from '@aws-sdk/client-s3';
import { Lambda } from '@aws-sdk/client-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

import * as fs from 'fs'; // 파일시스템 라이브러리. 동기적으로 폴더를 생성해주고 그 폴더를 사용할수 있다.
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TerraformService {
  private s3: S3;
  private lambda: Lambda;
  private dynamoDBClient: DynamoDBClient; 
  private dynamoDbDocClient: DynamoDBDocumentClient;

  constructor(
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
  private async generateTerraformCode(keywords: string[]): Promise<string> {
    const prompt_content = `
      Convert the following keywords into Terraform code:
      ${JSON.stringify(keywords)}
      Terraform 코드에서는 자격 증명을 변수로 정의하지 않고, 환경 변수에서 자동으로 가져오도록 합니다 provider.
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
      return { // ... = 스프레드 연산자: 객체 안에 있는 모든 속성을 복사하여 새로운 객체에 포함
          ...parsedResponse,
          content: [
              {
                  type: "text",
                  text: parsedResponse  // 업데이트된 텍스트 (키워드 리스트 포함)
              }
          ]
      };
  } catch (error) {
      throw new Error(`Bedrock 모델 호출 실패: ${error.message}`);
    }
  }

  /**
     * 리뷰: Terraform 코드 생성 및 S3에 저장
     */
  async reviewInfrastructure(reviewDto: ReviewDto): Promise<any> {
    const { CID } = reviewDto;

    // 1. DynamoDB에서 keyword 조회
    const dynamoParams = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: { CID }, // CID를 기준으로 keyword 조회
    };
    const command = new GetCommand(dynamoParams);
    const dynamoResult = await this.dynamoDbDocClient.send(command);
    const keyword = dynamoResult.Item?.keyword?.S;
    if (!keyword) {
        throw new Error('Keyword not found in DynamoDB');
    }

    // 2. Terraform 코드 생성
    const terraformCode = await this.generateTerraformCode([keyword]);

    // 3. Terraform 코드를 S3에 저장
    const tmpDir = `/tmp/${CID}`; // CID를 임시 디렉토리 이름으로 사용
    fs.mkdirSync(tmpDir);
    const terraformFilePath = path.join(tmpDir, 'main.tf');
    fs.writeFileSync(terraformFilePath, terraformCode);

    const s3Bucket = process.env.TERRAFORM_BUCKET;
    const s3Key = `${CID}/main.tf`; // CID를 S3 키 값으로 사용

    const fileContent = fs.readFileSync(terraformFilePath);

    await this.s3.putObject({
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'application/octet-stream',
    });

    // 4. 생성된 Terraform 코드를 반환
    return {
      status: 'Terraform code generated',
      terraformCode,
    };
  }


  /**
   * S3에 저장된 Terraform 코드를 실행하여 인프라를 배포하는 메서드
   */
  async deployInfrastructure(deployDto: DeployDto): Promise<any> {
    const { userId, CID } = deployDto;

    // S3에서 Terraform 파일 경로 설정
    const s3Bucket = process.env.TERRAFORM_BUCKET;
    const s3Key = `${CID}/main.tf`;

    // Lambda 함수 트리거
    const lambdaFunctionName = process.env.TERRAFORM_LAMBDA_FUNCTION;
    const payload = {
      userId,
      CID,
      s3Bucket,
      s3Key,
    };

    try {
      const lambdaResponse = this.lambda.invoke({
        FunctionName: lambdaFunctionName,
        InvocationType: 'Event', // 비동기 호출
        Payload: JSON.stringify(payload),
      });
      // 프로젝트가 배포 됬으면, Postgres Project entity에도 isDeployed True로 바꾸기
      await this.projectRepository.update({ CID }, { isDeployed: true });

      return {
        status: 'Deployment initiated',
        lambdaResponse,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to trigger Lambda function', error);
    }
  }
  /**
   * S3에 저장된 Terraform 코드를 다운로드하는 메서드
   */
  async downloadInfrastructure(downloadDto: DownloadDto): Promise<any> {
    const { CID } = downloadDto;

    const s3Bucket = process.env.TERRAFORM_BUCKET;
    const s3Key = `${CID}/main.tf`;

    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
    };

    try {
      const fileStream = await this.s3.getObject(params);
      return fileStream.Body;
    } catch (error) {
      throw new InternalServerErrorException('Failed to download Terraform file', error);
      }
    }
  }
}