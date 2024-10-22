import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConversationsService {
    private dynamoDB: AWS.DynamoDB.DocumentClient;

    constructor() {
        this.dynamoDB = new AWS.DynamoDB.DocumentClient({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    // ID 증가를 위해 테이블의 가장 큰 ID를 조회하는 함수
    async getLastID(): Promise<number> {
        const params = {
            TableName: 'Conversations',
            ProjectionExpression: 'ID', // ID 값만 가져옴
            ScanIndexForward: false, // 내림차순 정렬 (가장 큰 값부터)
            Limit: 1 // 마지막 항목 하나만 조회
        };

        try {
            const result = await this.dynamoDB.scan(params).promise(); // scan으로 테이블 전체 검색
            if (result.Items && result.Items.length > 0) {
                return result.Items[0].ID; // 가장 큰 ID 반환
            }
            return 0; // 항목이 없으면 0부터 시작
        } catch (error) {
            console.error('마지막 ID 조회 실패:', error.message);
            throw new Error('마지막 ID 조회 실패');
        }
    }

    async askBedrockModel(user_question: string, CID: string): Promise<any> {
        const client = new AWS.BedrockRuntime({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        // 기존 대화 내역 불러오기
        const previousConversations = await this.getConversationsByCID(CID);
        const conversationHistory = previousConversations
            .map((item) => `User: ${item.userMessage}\nBot: ${item.botResponse}`)
            .join('\n');

        // 프롬프트 메시지 구성
        const prompt_content = `
            대화 내역:
            ${conversationHistory}

            새로운 질문: ${user_question}
        `;

        // 요청 바디 구성
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
                    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
                })
                .promise();

            const responseBody = response.body.toString();
            const parsedResponse = JSON.parse(responseBody);

            // 응답에서 'content' 필드의 'text' 값을 추출하여 botResponse로 사용
            const botResponse = parsedResponse.content?.[0]?.text;

            // 대화 내용을 DynamoDB에 저장
            await this.saveConversation(CID, user_question, botResponse);

            // 원본 JSON 형태로 반환
            return parsedResponse;
        } catch (error) {
            throw new Error(`Bedrock 모델 호출 실패: ${error.message}`);
        }
    }

    // 대화 기록을 DynamoDB에 저장하는 함수
    async saveConversation(CID: string, userMessage: string, botResponse: string): Promise<void> {
        const lastID = await this.getLastID(); // 마지막 ID 조회
        const newID = lastID + 1; // 마지막 ID에 1을 더해 새로운 ID 생성

        const params = {
            TableName: 'Conversations',
            Item: {
                ID: newID,  // ID는 마지막 값 + 1
                CID, // 새로운 CID 사용
                userMessage,
                botResponse,
                timestamp: new Date().toISOString(),  // 현재 시간을 timestamp로 저장
            }
        };

        try {
            await this.dynamoDB.put(params).promise();
            console.log('대화 기록이 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('대화 기록 저장 실패:', error.message);
            throw new Error('대화 기록 저장 실패');
        }
    }

    // DynamoDB에서 특정 CID의 대화 기록을 불러오는 함수
    async getConversationsByCID(CID: string): Promise<any> {
        const params = {
            TableName: 'Conversations',
            FilterExpression: 'CID = :cid',
            ExpressionAttributeValues: {
                ':cid': CID,
            }
        };

        try {
            console.log('쿼리 파라미터:', params);
            const result = await this.dynamoDB.scan(params).promise(); // scan을 사용하여 CID 필터링

            // Items가 undefined일 가능성 처리
            if (!result.Items) {
                return [];  // 항목이 없으면 빈 배열 반환
            }

            // timestamp 기준으로 시간순 정렬
            return result.Items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } catch (error) {
            console.error('대화 기록 불러오기 실패:', error.message);
            throw new Error('대화 기록 불러오기 실패');
        }
    }
}
