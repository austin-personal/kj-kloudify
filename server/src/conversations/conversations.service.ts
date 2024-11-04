import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

dotenv.config();

@Injectable()
export class ConversationsService {
    private dynamoDB: AWS.DynamoDB.DocumentClient;
    private dynamoDbDocClient: DynamoDBDocumentClient;

    // static modelSwitchCounter = 1;

    constructor() {
        this.dynamoDB = new AWS.DynamoDB.DocumentClient({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    // 전역 변수를 1씩 증가시키는 함수
    async incrementModelCounter(CID: number): Promise<void> {
        console.log(`incrementModelCounter 호출됨 - CID: ${CID}`);
        let modelSwitchCounter = await this.getModelSwitchCounter(CID);
        console.log(`현재 modelSwitchCounter 값: ${modelSwitchCounter}`);
        modelSwitchCounter += 1;
    
        await this.saveModelSwitchCounter(CID, modelSwitchCounter);
        console.log(`증가된 modelSwitchCounter 값: ${modelSwitchCounter}`);
    }

    // 전역 변수를 특정 값으로 변경하는 함수
    async updateModelCounter(CID: number, action: string): Promise<void> {
        console.log(`updateModelCounter 호출됨 - CID: ${CID}, action: ${action}`);
        let modelSwitchCounter = await this.getModelSwitchCounter(CID);
        console.log(`현재 modelSwitchCounter 값: ${modelSwitchCounter}`);

        // action 값에 따라 modelSwitchCounter 설정
        if (action === '서버') {
            modelSwitchCounter = 1; // reset의 경우 0으로 설정
        } else if (action === '데이터베이스') {
            modelSwitchCounter = 2; // double의 경우 두 배로 설정
        } else if (action === '스토리지') {
            modelSwitchCounter = 3; 
        } else if (action === '네트워크') {
            modelSwitchCounter = 4; 
        } else {
            modelSwitchCounter = 6; 
            return;
        }

        await this.saveModelSwitchCounter(CID, modelSwitchCounter);
        console.log(`변경된 modelSwitchCounter 값: ${modelSwitchCounter}`);
    }


    // ID 증가를 위해 테이블의 가장 큰 ID를 조회하는 함수
    async getLastID(): Promise<number> {
        let lastEvaluatedKey: AWS.DynamoDB.Key | undefined = undefined;
        let maxID = 0;

        do {
            const params = {
                TableName: 'Conversations',
                ProjectionExpression: 'ID',
                ExclusiveStartKey: lastEvaluatedKey,
            };

            try {
                const result = await this.dynamoDB.scan(params).promise();
                if (result.Items && result.Items.length > 0) {
                    result.Items.forEach(item => {
                        if (item.ID > maxID) {
                            maxID = item.ID;
                        }
                    });
                }
                lastEvaluatedKey = result.LastEvaluatedKey;
            } catch (error) {
                console.error('마지막 ID 조회 실패:', error.message);
                throw new Error('마지막 ID 조회 실패');
            }
        } while (lastEvaluatedKey);

        return maxID;
    }

    // 전역 변수에 따라 다른 프롬프트 메시지를 생성하는 함수
    async getCustomMessage(CID: number): Promise<string> {
        const modelSwitchCounter = await this.getModelSwitchCounter(CID);
        console.log(`getCustomMessage 호출됨 - CID: ${CID}, modelSwitchCounter: ${modelSwitchCounter}`);

        switch (modelSwitchCounter % 6) {
            case 0: // 인트로 오식이
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 AWS 서비스의 종류와 개수를 결정하고 이를 mermaid 코드로 간략하게 나타내는 것입니다.
                        대화 내역 안내:
                        사용자의 목표와 요구 사항을 이해합니다.
                        필요한 AWS 서비스들을 식별합니다.
                        각 서비스 간의 관계를 파악합니다.
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 필요한 서비스를 어느정도 구성할 수 있다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 AWS 아이콘들의 실제 URL(예:https://icon.icepanel.io/AWS/svg/Compute/EC2.svg)을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 예쁘게 ** 양식을 붙여서 보내주세요. \n 없이 한 줄로 출력해주세요. 앞에 **을 꼭 넣어주세요.
                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 아무말 없이 mermaid코드만 \\n없이 한줄로 출력해주세요.`;

            case 1:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 서버담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 서버 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 간략하게 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.
                        
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 예쁘게 ** 양식을 붙여서 보내주세요. \n 없이 한 줄로 출력해주세요. 앞에 **을 꼭 넣어주세요.
                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 아무말 없이 mermaid코드만 한줄로 출력해주세요.`;
            case 2:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 데이터베이스 담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 데이터베이스 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 간략하게 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.

                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 예쁘게 ** 양식을 붙여서 보내주세요. \n 없이 한 줄로 출력해주세요. 앞에 **을 꼭 넣어주세요.
                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 아무말 없이 mermaid코드만 한줄로 출력해주세요.`;
            case 3:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 스토리지 담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 스토리지 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 간략하게 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.
                        
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 예쁘게 ** 양식을 붙여서 보내주세요. \n 없이 한 줄로 출력해주세요. 앞에 **을 꼭 넣어주세요.
                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 아무말 없이 mermaid코드만 한줄로 출력해주세요.`;
            case 4:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 네트워크 담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 네트워크 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 간략하게 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.
                        
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 예쁘게 ** 양식을 붙여서 보내주세요. \n 없이 한 줄로 출력해주세요. 앞에 **을 꼭 넣어주세요.
                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 아무말 없이 mermaid코드만 한줄로 출력해주세요.`;
            case 5: 
                return "당신은 사용자의 요구에 맞는 AWS 서비스 아키텍처를 단계별로 구성하는 안내자 역할을 합니다."
                    + "저비용을 원할 경우 프리 티어 등급의 서비스를 적극적으로 추천해줘"
                    + "답변에서 사용자가 특정 aws의 서비스를 단순히 언급하는게 아닌 '확실하게 사용하겠다고 확정 {ex)ec2를 사용할께 같은 경우}' 지은 경우에만 대답을 완료한 후 별도로 추출하기 쉽도록 텍스트 하단에 "
                    + `**[ { "service": "", "options": { "ami": "", "instance_type": "", "public": ""} } ]
                    이런 포맷으로 서비스 종류 하나씩 출력하세요. \\n 없이 한줄로 출력해줘. 앞에 **을 꼭 넣어줘`
                    + "혹시 사용자가 aws와 관련없는 주제로 대답할 경우 aws 선택을 할 수 있도록 주제를 계속해서 상기시켜줘"
                    + "aws 기본 지역은 서울 지역이야. 해당 지역에 맞는 ami로 작성해줘."
                    + "ec2의 ami와 subnet_id도 내가 구성한 내용을 바탕으로 실제로 사용할 수 있도록 구성해줘. subnet은 별도의 언급이 없다면 기본값으로 설정하고"
                    + "Mermaid로서 구성해줘"
                    + "S3은 특별한 목적이 없다면 private하게 해줘";

            case 6: // 아웃트로 육식이
                return `지금까지의 대화 내용을 종합하여 필요한 AWS 서비스 구성을 아래 양식으로 생성했습니다. 최종 구성은 Terraform 코드로 변환될 예정이며, 각 서비스와 옵션이 정확히 입력되어야 합니다.
                
                    생성된 서비스 양식:
                    !![ { "service": "ec2", "options": { "ami": "ami-xxxxxxxx", "instance_type": "t2.micro", "public": true } },{ "service": "rds", "options": { "engine": "postgres", "instance_class": "db.t2.small", "allocated_storage": 20 } },{ "service": "s3", "options": { "bucket_name": "my-bucket", "access": "public-read" } }]
                    지역은 서울지역을 기준으로 생성해줘.
                    위와 같이 필요한 서비스가 정확히 입력되었는지 확인해 주세요. 추가로 수정이 필요하거나 다른 설정이 있으면 알려주시기 바랍니다. 이대로 완료되면 최종적으로 Terraform 코드로 생성됩니다.`;

            default:
                return "이 출력값은 버그이므로 어떤 인풋이 들어오든 '에러. 새로고침 필요' 메세지를 출력해야 함";
        }
    }

    static async saveConversation(CID: number, user_question: string, response: string) {
        console.log(`Saving conversation: CID=${CID}, user_question=${user_question}, response=${response}`);
    }

    createResponse(text: string) {
        return {
            "id": "-",
            "type": "message",
            "role": "assistant",
            "model": "-",
            "content": [
                {
                    "type": "text",
                    "text": text
                }
            ],
            "stop_reason": "-",
            "stop_sequence": null,
            "usage": {
                "input_tokens": "-",
                "output_tokens": "-"
            }
        };
    }

    // CID별로 상태를 DynamoDB에 저장하고 관리
    async saveState(CID: number, stateData: string[]): Promise<void> {
        const params = {
            TableName: 'ConversationsState',
            Item: {
                CID: CID,
                stateData: stateData,

            },
        };

        try {
            await this.dynamoDB.put(params).promise();
            console.log(`CID ${CID}의 상태가 저장되었습니다.`);
        } catch (error) {
            console.error(`CID ${CID}의 상태 저장 실패:`, error);
            throw new Error('상태 저장 실패');
        }
    }

    async getState(CID: number): Promise<string[]> {
        const params = {
            TableName: 'ConversationsState',
            Key: { CID: CID },
        };

        try {
            const result = await this.dynamoDB.get(params).promise();
            if (result.Item) {
                const currentTime = Math.floor(Date.now() / 1000);
                if (result.Item.expiresAt < currentTime) {
                    // 데이터가 만료됨
                    return [];
                } else {
                    return result.Item.stateData as string[];
                }
            } else {
                return []; // 상태 데이터가 없으면 빈 배열 반환
            }
        } catch (error) {
            console.error(`CID ${CID}의 상태 조회 실패:`, error);
            throw new Error('상태 조회 실패');
        }
    }

    async deleteState(CID: number): Promise<void> {
        const params = {
            TableName: 'ConversationsState',
            Key: { CID: CID },
        };

        try {
            await this.dynamoDB.delete(params).promise();
            console.log(`CID ${CID}의 상태가 삭제되었습니다.`);
        } catch (error) {
            console.error(`CID ${CID}의 상태 삭제 실패:`, error);
            throw new Error('상태 삭제 실패');
        }
    }

    async askBedrockModel(user_question: string, CID: number): Promise<any> {
        console.log(`CID received in askBedrockModel: ${CID}`);

        // CID별 상태 조회
        let globalMatrix = await this.getStateData(CID);

        // 만료된 상태이거나 없으면 초기화
        if (!globalMatrix || globalMatrix.length === 0) {
            globalMatrix = [];
        }

        let modelSwitchCounter = await this.getModelSwitchCounter(CID);
        


        // 특정 입력에 대한 템플릿 응답 설정 - 여기선 해당 질문에 좌표 찍어주는 역할
        const templateResponses = {
            '먼저, 당신의 웹서비스에 대해 알고 싶어요': 'template1-2',
            '당신의 웹서비스 규모에 대해 알고 싶어요': 'template1-3',
            '당신의 예산과 비용 관리 계획은 어떻게 되나요': 'template1-4',
            '추가적인 무언가가 필요한가요': 'template1-5',
            // '당신의 웹서비스는 어떤 클라우드 기술이 필요한가요': '질문의 끝',

            '애플리케이션의 워크로드 특성이 있나요': 'template2-2',
            '어떠한 서버 타입이 필요하시나요': 'template2-3',
            // '가장 중요한 가치는 무엇인가요': '질문의 끝',

            '데이터베이스 유형이 어떻게 되나요': 'template3-2',
            // '추가적인 데이터베이스 정보를 알려주세요': '질문의 끝',

            '스토리지의 사용 패턴은 어떻게 되나요': 'template4-2',
            '스토리지의 사용 목적은 무엇인가요': 'template4-3',
            // '스토리지에서 가장 중요한 가치는 무엇인가요': '질문의 끝',

            // '애플리케이션의 네트워크 요구사항은 무엇인가요': '마지막 질문',
            '계활' : "컨텍스트 스위칭",
            '특정텍스트1': '컨텍스트 스위칭' // 여기서 답변 매칭해줌
        };

        // 이 질문의 역할은? - 아 메트릭스에서 나온 키워드에 따라 다음 질문을 매핑하는 역할. 즉, 각 스테이지의 첫 질문 트리거
        const level4Questions = {
            '디비': 'template3-1',
            '서버': 'template2-1',
            '스토리지': 'template3-1',
            '네트워크': 'template4-1',
        };

        // 템플릿 키를 확인하고 응답 생성
        const templateKey = Object.keys(templateResponses).find(key => user_question.includes(key));
        let templateResponse: string = templateKey ? templateResponses[templateKey] : 'default response';

        if (templateKey) {
            // 모델 카운터 증가 조건 확인 및 처리
            const triggerKeywords = ['특정텍스트1', '특정텍스트2', '계활'];
            const shouldIncrementCounter = triggerKeywords.some(keyword => user_question.includes(keyword));
            if (shouldIncrementCounter) {
                console.log(`키워드 조건 만족 - ${user_question}에 특정 키워드 포함됨, modelSwitchCounter 증가`);
                try {
                    await this.incrementModelCounter(CID);
                } catch (error) {
                    console.error('모델 카운터 증가 중 에러 발생:', error);
                }
            }

            const isNextQuestion = user_question.includes('다음문항');
            if ((templateKey === '그 외에 필요한 기능이 있나요' || isNextQuestion) && globalMatrix) {
                if (globalMatrix.length === 0) {
                    await this.deleteState(CID);
                    return this.createResponse("종료");
                }

                const nextItem = globalMatrix.shift();
                if (nextItem && level4Questions[nextItem]) {
                    // 상태 저장
                    try {
                        await this.saveStateData(CID, globalMatrix);
                    } catch (error) {
                        console.error('상태 저장 중 에러 발생:', error);
                    }
                    return this.createResponse(level4Questions[nextItem]);
                } else {
                    await this.deleteState(CID);
                    return this.createResponse("다음 질문이 없습니다.");
                }
            }

            // 템플릿 응답 반환
            try {
                await this.saveConversation(CID, user_question, templateResponse);
            } catch (error) {
                console.error('대화 내용 저장 중 에러 발생:', error);
            }
            return this.createResponse(templateResponse);
        }


        // 트리거 키워드 정의 (항상 동일한 키워드)
        const triggerKeyword = '당신의 웹서비스는 어떤 클라우드 기술이 필요한가요'; // 실제 트리거 키워드로 변경하세요.

        // 사용자 메시지에서 트리거 키워드가 포함되어 있는지 확인
        if (user_question.includes(triggerKeyword)) {
            // 트리거 키워드 이후의 텍스트를 파싱
            const triggerIndex = user_question.indexOf(triggerKeyword) + triggerKeyword.length;
            const remainingText = user_question.substring(triggerIndex).trim();

            // "-" 기호 뒤의 내용을 추출
            const dashIndex = remainingText.indexOf('-');
            if (dashIndex !== -1) {
                const textAfterDash = remainingText.substring(dashIndex + 1).trim();
                
                // "," 기준으로 행렬로 변환
                const extractedKeywords = textAfterDash.split(',').map(keyword => keyword.trim());

                // 상태 저장 또는 삭제
                if (extractedKeywords.length > 0 && extractedKeywords[0] !== '') {
                    // 추출된 키워드가 있으면 상태를 저장합니다.
                    await this.saveStateData(CID, extractedKeywords);
                    console.log(`키워드 저장: ${extractedKeywords.join(', ')}`);
                } else {
                    // 추출된 키워드가 없거나 빈 문자열일 경우 상태를 삭제합니다.
                    await this.deleteState(CID);
                    console.log('추출된 키워드가 없습니다. 상태를 삭제합니다.');
                }

                // 대화 내용 저장 (필요한 경우 다음 템플릿 지정)
                // await this.saveConversation(CID, user_question, '다음템플릿');

                // 응답 생성 및 반환
            } else {
                console.log('"-" 기호가 메시지에 없습니다. 상태를 삭제합니다.');
                await this.deleteState(CID);
            }
        }

        // 이 아래는 기존 Bedrock 모델 호출 로직 그대로 유지
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
        const customMessage = await this.getCustomMessage(CID);

        // 프롬프트 메시지 구성
        const prompt_content = `
            대화 내역:
            ${conversationHistory}

            현재 단계:
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
                    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
                })
                .promise();

            const responseBody = response.body.toString();
            const parsedResponse = JSON.parse(responseBody);

            // 응답에서 'content' 필드의 'text' 값을 추출하여 botResponse로 사용
            const botResponse = parsedResponse.content?.[0]?.text;

            console.log("bot response? ", responseBody);

            // 키워드 처리 및 저장 (botResponse, user_question을 사용)
            let updatedResponse = await this.processTextAndAddKeywords(botResponse, user_question, CID);

            if (botResponse.startsWith('**')) {

                let nextItem = globalMatrix.shift();
                this.saveStateData(CID, globalMatrix);
                if (!nextItem){
                    nextItem = "끝";
                }
                let nextTemplate = '';
            
                // nextItem에 따라 nextTemplate 설정
                if (nextItem === '서버') {
                    nextTemplate = 'template2-1';
                } else if (nextItem === '데이터베이스') {
                    nextTemplate = 'template3-1';
                } else if (nextItem === '스토리지') {
                    nextTemplate = 'template4-1';
                } else if (nextItem === '네트워크') {
                    nextTemplate = 'template5-1';
                } else {
                    nextTemplate = 'template6-1';
                }

                this.updateModelCounter(CID,nextItem);

                await this.saveConversation(CID, user_question, nextTemplate + updatedResponse);

                return {
                    ...parsedResponse,
                    content: [
                        {
                            type: "text",
                            text: nextTemplate + updatedResponse // 업데이트된 텍스트 (키워드 리스트 포함)
                        }
                    ]
                };
            }
            await this.saveConversation(CID, user_question, updatedResponse);
            // 최종적으로 업데이트된 텍스트와 함께 리턴 (키워드 리스트 포함)
            return {
                ...parsedResponse,
                content: [
                    {
                        type: "text",
                        text: updatedResponse  // 업데이트된 텍스트 (키워드 리스트 포함)
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Bedrock 모델 호출 실패: ${error.message}`);
        }
    }

    // 대화 기록을 DynamoDB에 저장하는 함수
    async saveConversation(CID: number, userMessage: string, botResponse: string): Promise<void> {
        const lastID = await this.getLastID(); // 마지막 ID 조회
        const newID = lastID + 1; // 마지막 ID에 1을 더해 새로운 ID 생성

        const params = {
            TableName: 'Conversations',
            Item: {
                ID: newID,
                CID,
                userMessage,
                botResponse,
                timestamp: new Date().toISOString(),
            }
        };

        try {
            console.log('DynamoDB에 저장할 데이터:', params);
            await this.dynamoDB.put(params).promise();
            console.log('대화 기록이 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('대화 기록 저장 실패:', error.message);
            console.error('DynamoDB 요청 실패 params:', params);
            throw new Error('대화 기록 저장 실패');
        }
    }

    // DynamoDB에서 특정 CID의 대화 기록을 불러오는 함수
    async getConversationsByCID(CID: number): Promise<any> {
        const params = {
            TableName: 'Conversations',
            FilterExpression: 'CID = :cid',
            ExpressionAttributeValues: {
                ':cid': CID,
            }
        };
        try {
            console.log('쿼리 파라미터:', params);
            const result = await this.dynamoDB.scan(params).promise();

            if (!result.Items) {
                return [];
            }

            return result.Items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } catch (error) {
            console.error('대화 기록 불러오기 실패:', error.message);
            throw new Error('대화 기록 불러오기 실패');
        }
    }

    // **로 감싸진 텍스트에서 키워드 추출
    extractKeywords(text: string): { keywords: string[], updatedText: string } {
        if (!text) {
            return { keywords: [], updatedText: text };
        }

        const regex = /\*\*(.*?)(\n|$)/g;
        const matches: string[] = [];
        let updatedText = text;

        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1].trim());
            updatedText = updatedText.replace(match[0], '');
        }

        return { keywords: matches, updatedText: updatedText.trim() };
    }

    // 기존 키워드를 누적하지 않고 새로운 키워드로 덮어쓰는 함수
    async saveKeywords(keywords: string[], CID: number): Promise<void> {
        // 새로운 키워드를 문자열로 결합
        const newKeywords = keywords.join(', ');

        const params = {
            TableName: 'Archboard_keyword',
            Item: {
                CID: CID,
                keyword: newKeywords,
                timestamp: new Date().toISOString(),
            }
        };

        try {
            await this.dynamoDB.put(params).promise();
            console.log(`키워드 저장 성공: ${newKeywords}`);
        } catch (error) {
            console.error(`키워드 저장 실패: ${error.message}`);
        }
    }
    

    async processTextAndAddKeywords(outputText: string, inputText: string, CID: number): Promise<string> {
        // console.log(`processTextAndAddKeywords 호출됨 - CID: ${CID}, insputText: ${inputText}`);
        // console.log(`processTextAndAddKeywords 호출됨 - CID: ${CID}, inputText: ${outputText}`);
        // 키워드 추출 및 텍스트 업데이트
        const result = this.extractKeywords(outputText);
        const { keywords, updatedText } = result;

        // 여기서 컨텍스트 스위칭
        // const triggerKeywords = ['특정텍스트1', '특정텍스트2', '특정텍스트3']; // 여기에 원하는 키워드
        // const shouldIncrementCounter = triggerKeywords.some(keyword => inputText.includes(keyword));
        // if (shouldIncrementCounter) {
        //     console.log(`키워드 조건 만족 - ${inputText}에 특정 키워드 포함됨, modelSwitchCounter 증가`);
        //     await this.incrementModelCounter(CID);
        // }

        if (keywords.length > 0) {
            await this.saveKeywords(keywords, CID);
        }

        // CID로 저장된 키워드 조회
        const fetchedKeywords = await this.fetchKeywordsByCID(CID);

        // 최종적으로 텍스트 끝에 키워드 리스트 추가
        const finalText = updatedText + `\n**[${fetchedKeywords.join(', ')}]`;

        // 인풋(사용자 입력)과 최종 텍스트 저장
        // await this.saveConversation(CID, inputText, finalText);

        return finalText;
    }

    async fetchKeywordsByCID(CID: number): Promise<string[]> {
        const params = {
            TableName: 'Archboard_keyword',
            KeyConditionExpression: 'CID = :cid',
            ExpressionAttributeValues: { ':cid': CID }
        };

        const result = await this.dynamoDB.query(params).promise();
        if (!result.Items || result.Items.length === 0) {
            return [];
        }

        return result.Items.map(item => item.keyword);
    }

    // CID로 기존에 저장된 키워드를 조회하는 함수
    async fetchExistingKeywords(CID: number): Promise<string | null> {
        const params = {
            TableName: 'Archboard_keyword',
            Key: {
                CID: CID
            }
        };

        const result = await this.dynamoDB.get(params).promise();
        return result.Item ? result.Item.keyword : null;
    }
    //이 밑으로 대화상태변수를 제어함, 컨텍스트 스위칭에 필요
    async saveStateData(CID: number, stateData: string[]): Promise<void> {
        const params = {
            TableName: 'ConversationsState',
            Key: { CID: CID },
            UpdateExpression: 'SET stateData = :stateData',
            ExpressionAttributeValues: {
                ':stateData': stateData,
            },
        };
    
        try {
            await this.dynamoDB.update(params).promise();
            console.log(`CID ${CID}의 stateData가 저장되었습니다.`);
        } catch (error) {
            console.error(`CID ${CID}의 stateData 저장 실패:`, error);
            throw new Error('stateData 저장 실패');
        }
    }

    async getStateData(CID: number): Promise<string[]> {
        const params = {
            TableName: 'ConversationsState',
            Key: { CID: CID },
            ProjectionExpression: 'stateData',
        };
    
        try {
            const result = await this.dynamoDB.get(params).promise();
            if (result.Item && result.Item.stateData) {
                return result.Item.stateData as string[];
            } else {
                return []; // 상태 데이터가 없으면 빈 배열 반환
            }
        } catch (error) {
            console.error(`CID ${CID}의 stateData 조회 실패:`, error);
            throw new Error('stateData 조회 실패');
        }
    }
    async getModelSwitchCounter(CID: number): Promise<number> {
        const params = {
            TableName: 'ConversationsState',
            Key: { CID: CID },
            ProjectionExpression: 'modelSwitchCounter',
        };
    
        try {
            const result = await this.dynamoDB.get(params).promise();
            if (result.Item && result.Item.modelSwitchCounter !== undefined) {
                return result.Item.modelSwitchCounter as number;
            } else {
                return 0; // 기본값으로 1 반환
            }
        } catch (error) {
            console.error(`CID ${CID}의 modelSwitchCounter 조회 실패:`, error);
            throw new Error('modelSwitchCounter 조회 실패');
        }
    }
    

    async saveModelSwitchCounter(CID: number, modelSwitchCounter: number): Promise<void> {

        console.log(`saveModelSwitchCounter 호출됨 - CID: ${CID}, modelSwitchCounter: ${modelSwitchCounter}`);
        const params = {
            TableName: 'ConversationsState',
            Key: { CID: CID },
            UpdateExpression: 'SET modelSwitchCounter = :modelSwitchCounter',
            ExpressionAttributeValues: {
                ':modelSwitchCounter': modelSwitchCounter,
            },
        };

        try {
            await this.dynamoDB.update(params).promise();
            console.log(`CID ${CID}의 modelSwitchCounter가 저장되었습니다.`);
        } catch (error) {
            console.error(`CID ${CID}의 modelSwitchCounter 저장 실패:`, error);
            throw new Error('modelSwitchCounter 저장 실패');
        }
    }
    // summary들 생산 (가격 정보. 아키 서머리)
    async generateSummary(cid: number, type: 'summary' | 'price'): Promise<string> {
        // 1. DynamoDB에서 keyword 데이터 가져오기
        const params = {
            TableName: 'Archboard_keyword',
            Key: { CID: cid },
            ProjectionExpression: 'keyword',
        };
        const result = await this.dynamoDB.get(params).promise();

        const keywordData = result.Item && result.Item.keyword ? result.Item.keyword : '';
        if (!keywordData) {
            return ''; // keyword 데이터가 없으면 빈 문자열 반환
        }

        // 2. Bedrock 요청을 위한 프롬프트 내용 준비
        const prompt_content = type === 'summary'
            ? `Please provide a detailed summary of the cloud architecture, including each service's information based on the following keywords: ${keywordData}`
            : `Please provide a detailed price summary of the cloud architecture, including each service's information based on the following keywords: ${keywordData}`;

        // 3. Bedrock 요청 본문 생성
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
            // 4. Bedrock 모델 호출
            const response = await this.bedrockClient.invokeModel({
                body: JSON.stringify(requestBody),
                contentType: 'application/json',
                modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
            }).promise();

            const responseBody = response.body.toString();
            const parsedResponse = JSON.parse(responseBody);

            // 예상되는 데이터 형식에 따라 응답 반환
            return parsedResponse.messages[0]?.content || ''; // 적절한 키에 맞게 데이터를 반환
        } catch (error) {
            throw new Error(`Bedrock 모델 호출 실패: ${error.message}`);
        }
    }

    // Bedrock 클라이언트 설정
    private bedrockClient = new AWS.BedrockRuntime({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
   
}
