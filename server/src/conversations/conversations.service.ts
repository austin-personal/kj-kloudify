import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConversationsService {
    async askBedrockModel(user_question: string): Promise<any> {
        const client = new AWS.BedrockRuntime({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        // 프롬프트 메시지 구성
        const prompt_content = `
            당신은 사용자의 요구에 맞는 AWS 서비스 아키텍처를 단계별로 구성하는 안내자 역할을 합니다.
            대화를 주도하며 필요한 경우 추가 질문을 통해 사용자의 요구사항을 명확히 하세요.
            질문에 대해 뭔가 만들고싶다고 요청할 시 필요한 서비스를 목록화 해서 짧게 대답해줘. 문장을 완성하지말고 키워드만 언급하면서
            예시) [짧은 설명 텍스트] \n 1. EC2 - [인스턴스 이름 ex)t2.micro] : [선정한 이유] \n
            예시 텍스트에서 [짧은 설명 텍스트]에는 짧게 전체적인 설명을 해주고 [선정한 이유]에는 해당 인스턴스에 대한 짧은 설명 부탁해. 중괄호는 출력하지 않아도 돼.
            만약 사용자가 특정 서비스를 선택하는 메세지를 전송 시 긍정해주는 메세지를 보내줘.

            Question: ${user_question}
        `;

        // 요청 바디 구성
        const requestBody = {
            max_tokens: 1000,
            anthropic_version: "bedrock-2023-05-31",
            messages: [
                {
                    role: "user",
                    content: prompt_content
                }
            ]
        };

        try {
            const response = await client.invokeModel({
                body: JSON.stringify(requestBody),
                contentType: 'application/json',
                modelId: 'anthropic.claude-3-haiku-20240307-v1:0'
            }).promise();

            const responseBody = response.body.toString();
            const parsedResponse = JSON.parse(responseBody);

            return parsedResponse;

        } catch (error) {
            throw new Error(`Bedrock 모델 호출 실패: ${error.message}`);
        }
    }
}
