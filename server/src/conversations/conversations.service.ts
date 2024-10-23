import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConversationsService {
    private dynamoDB: AWS.DynamoDB.DocumentClient;

    static modelSwitchCounter = 0;

    constructor() {
        this.dynamoDB = new AWS.DynamoDB.DocumentClient({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    // 전역 변수를 1씩 증가시키는 함수
    static incrementModelCounter(): void {
        ConversationsService.modelSwitchCounter++;
    }

    // ID 증가를 위해 테이블의 가장 큰 ID를 조회하는 함수
    async getLastID(): Promise<number> {
        let lastEvaluatedKey: AWS.DynamoDB.Key | undefined = undefined; // null 대신 undefined 사용
        let maxID = 0;
    
        do {
            const params = {
                TableName: 'Conversations',
                ProjectionExpression: 'ID', // ID 값만 가져옴
                ExclusiveStartKey: lastEvaluatedKey, // 페이지네이션을 위해 마지막 키 설정
            };
    
            try {
                const result = await this.dynamoDB.scan(params).promise();
                if (result.Items && result.Items.length > 0) {
                    // 각 페이지에서 최대 ID 찾기
                    result.Items.forEach(item => {
                        if (item.ID > maxID) {
                            maxID = item.ID; // 가장 큰 ID를 찾음
                        }
                    });
                }
                // 다음 페이지가 있으면 lastEvaluatedKey 설정
                lastEvaluatedKey = result.LastEvaluatedKey;
            } catch (error) {
                console.error('마지막 ID 조회 실패:', error.message);
                throw new Error('마지막 ID 조회 실패');
            }
        } while (lastEvaluatedKey); // 마지막 페이지까지 탐색
    
        return maxID; // 최종적으로 가장 큰 ID 반환
    }
    

    // 전역 변수에 따라 다른 프롬프트 메시지를 생성하는 함수
    getCustomMessage(): string {
        switch (ConversationsService.modelSwitchCounter % 4) {
            case 0:
                return "당신은 사용자의 요구에 맞는 AWS 서비스 아키텍처를 단계별로 구성하는 안내자 역할을 합니다. "
                    + "대화를 주도하며 필요한 경우 추가 질문을 통해 사용자의 요구사항을 명확히 하세요. "
                    + "질문에 대해 뭔가 만들고싶다고 요청할 시 필요한 서비스를 목록화 해서 짧게 대답해줘. 문장을 완성하지말고 키워드만 언급하면서"
                    + "예시) [짧은 설명 텍스트] \n 1. EC2 - [인스턴스 이름 ex)t2.micro] : [선정한 이유] \n"
                    + "예시 텍스트에서 [짧은 설명 텍스트]에는 짧게 전체적인 설명을 해주고 [선정한 이유]에는 해당 인스턴스에 대한 짧은 설명 부탁해. 중괄호는 출력하지 않아도 돼"
                    + "만약 사용자가 특정 서비스를 선택하는 메세지를 전송 시 긍정해주는 메세지를 보내줘.";
            case 1:
                return "1번 케이스의 프롬프트 메시지입니다.";
            case 2:
                return "2번 케이스의 프롬프트 메시지입니다.";
            case 3:
                return "3번 케이스의 프롬프트 메시지입니다.";
            default:
                return "기본 프롬프트 메시지입니다.";
        }
    }

    async askBedrockModel(user_question: string, CID: string): Promise<any> {
        console.log(`CID received in askBedrockModel: ${CID}`);

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

        // 전역 변수에 따라 프롬프트 메시지 변경
        const customMessage = this.getCustomMessage();

        // 프롬프트 메시지 구성
        const prompt_content = `
            대화 내역:
            ${conversationHistory}

            추가 메시지: 
            ${customMessage}

            새로운 질문: 
            ${user_question}
            
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
        console.log(lastID);
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
            console.log('DynamoDB에 저장할 데이터:', params); // 디버깅을 위한 로그
            await this.dynamoDB.put(params).promise();
            console.log('대화 기록이 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('대화 기록 저장 실패:', error.message);
            console.error('DynamoDB 요청 실패 params:', params); // 추가 디버깅 로그
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

            if (!result.Items) {
                return [];  // 항목이 없으면 빈 배열 반환
            }

            return result.Items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } catch (error) {
            console.error('대화 기록 불러오기 실패:', error.message);
            throw new Error('대화 기록 불러오기 실패');
        }
    }
}
