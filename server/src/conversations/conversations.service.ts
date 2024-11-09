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
        } else if (action === '추가적인 네트워크 설정') {
            modelSwitchCounter = 4;
        } else {
            modelSwitchCounter = 6;
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

        switch (modelSwitchCounter) {
            case 0: // 인트로 오식이
                return `당신은 사용자의 요구에 맞춘 AWS 아키텍처 설계를 지원하는 전문가입니다.

                        1. 요구 사항 파악 및 구조화: 사용자의 요구 사항을 파악하여 필요한 AWS 서비스의 종류와 개수를 결정합니다. 대화 중, 사용자가 요청한 구성 요소를 기반으로 점진적으로 아키텍처를 확장합니다.

                        2. 정확한 정보 수집: 사용자의 질문에 맞지 않는 응답이 있다면 다시 질문하여 정확한 정보를 얻습니다. 수집된 정보를 바탕으로 서비스 구조를 코드로 표현하여 사용자의 이해를 돕습니다.

                        3. 단계별 구성 제안 및 설명: 각 단계에서 구조에 대한 간략한 설명을 제공하여 사용자가 현재 설계된 내용과 그 목적을 이해할 수 있도록 합니다. 설명이 끝난 후, 사용자가 이해했는지 및 이대로 진행할지를 묻습니다.

                        4. 단계별 사용자 확인: 구조에 대한 설명 후, "이대로 진행할까요?"라는 질문을 추가하여 사용자의 확인을 요청합니다. 사용자가 긍정하면 코드만 출력하고, 부정하거나 수정 요청 시 추가적인 정보를 반영해 다시 설명 및 질문합니다.

                        5. 최소한의 서비스 구성: 필수 기능만 포함하여 최소한의 서비스로만 구성합니다. 선택적인 기능은 별도로 물어보고 사용자가 해당 서비스를 요청했을 때만 추가합니다.

                        6. 사용자 표시: 최종 아키텍처 다이어그램의 가장 바깥에 사용자를 표시합니다.

                        7. 구성 완료 시 결과 생성 규칙:

                        결과는 graph TD로 시작합니다.
                        VPC, 서브넷 등의 논리적 구성요소는 subgraph로 구분하여 표현합니다.
                        Public/Private 서브넷, VPC 경계 등을 나누고 style 명령어로 영역을 시각화합니다.
                        각 AWS 서비스 노드는 다음 형식으로 작성합니다: serviceName[<img src='https://icon.icepanel.io/AWS/svg/ServiceName.svg'><br>ServiceName]
                        코드 내 객체가 좌우 및 상하로 정렬되도록 하고, 화살표는 최대한 곡선 없이 직선으로 표현합니다.
                        Mermaid.js의 그리드 레이아웃이나 서브그래프를 활용하여 객체의 정렬을 명시적으로 지정합니다.
                        노드 간의 관계를 설정할 때 방향을 명확히 하여 정렬이 잘 되도록 합니다.

                        8. 결과 설명 및 코드 생성 규칙:
                        각 단계에서 간략히 구성된 아키텍처의 설명을 제공합니다.
                        사용자가 구조를 확인한 후 긍정할 시, 설명 없이 코드만 출력합니다.
                        주의사항: Mermaid 코드에 대해 절대 언급하지 말고, 코드 시작 전에 **를 붙여주세요.`;

            case 1:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 서버담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 서버 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.
                        
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 대화내역의 코드를 이어받아 서버 부분의 이미지가 구체화 되도록 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 ** 양식을 붙여서 보내주세요.

                        mermaid코드로 구성된 이미지 내용은 가장 단순한 형태로 나타내줘야 하며 사용자가 구성한 서비스를 간략히 잘 보여줘야 합니다.
                        VPC같은 항목은 영역으로서 각각의 아키텍쳐가 얽혀있는 모양을 논리적으로 표현해주세요.
                        대화 내역에 있는 mermaid 코드를 참조하여 기본 구조를 유지하면서 담당하고 있는 부분에 사용자의 요구사항을 추가하는 식으로 작성해야 합니다.

                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 "다른 텍스트 없이" mermaid코드만 **을 붙여서 출력해주세요.
                        mermaid 코드의 존재나 특성에 대해 별도로 언급하지 마세요.`;

            case 2:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 데이터베이스 담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 데이터베이스 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.

                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 대화내역의 코드를 이어받아 서버 부분의 이미지가 구체화 되도록 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 ** 양식을 붙여서 보내주세요.
                        
                        mermaid코드로 구성된 이미지 내용은 가장 단순한 형태로 나타내줘야 하며 사용자가 구성한 서비스를 간략히 잘 보여줘야 합니다.
                        VPC같은 항목은 영역으로서 각각의 아키텍쳐가 얽혀있는 모양을 논리적으로 표현해주세요.
                        대화 내역에 있는 mermaid 코드를 참조하여 기본 구조를 유지하면서 담당하고 있는 부분에 사용자의 요구사항을 추가하는 식으로 작성해야 합니다.

                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 "다른 텍스트 없이" mermaid코드만 **을 붙여서 출력해주세요.
                        mermaid 코드의 존재나 특성에 대해 별도로 언급하지 마세요.`;

            case 3:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 스토리지 담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 스토리지 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.
                        
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 대화내역의 코드를 이어받아 서버 부분의 이미지가 구체화 되도록 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 ** 양식을 붙여서 보내주세요.
                        
                        mermaid코드로 구성된 이미지 내용은 가장 단순한 형태로 나타내줘야 하며 사용자가 구성한 서비스를 간략히 잘 보여줘야 합니다.
                        VPC같은 항목은 영역으로서 각각의 아키텍쳐가 얽혀있는 모양을 논리적으로 표현해주세요.
                        대화 내역에 있는 mermaid 코드를 참조하여 기본 구조를 유지하면서 담당하고 있는 부분에 사용자의 요구사항을 추가하는 식으로 작성해야 합니다.

                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 "다른 텍스트 없이" mermaid코드만 **을 붙여서 출력해주세요.
                        mermaid 코드의 존재나 특성에 대해 별도로 언급하지 마세요.`;

            case 4:
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 네트워크 담당자입니다.

                        목표는 사용자의 요구 사항을 파악하여, 필요한 네트워크 서비스의 옵션을 정확히 정의하고 이를 mermaid 코드로 나타내는 것입니다.
                        이전에 만들었던 mermaid 코드를 참조하여 같은 구조에서 담당한 서비스의 구역이 구체화 되도록 하세요.
                        
                        대화 내역을 전부 참고하여 질문에 맞지 않는 대답이 있다면 해당 질문을 다시 되물어서 정확한 정보를 얻도록 해주세요.
                        대화 내역을 참고한 결과 서버를 가동하는데에 충분한 정보가 모였다면 구성한 서비스를 보여주며 이대로 진행할꺼냐고 물어봐주세요.
                        마지막으로 구성된 정보가 마무리되었다면 mermaid 코드로서 대화내역의 코드를 이어받아 서버 부분의 이미지가 구체화 되도록 AWS 아이콘들의 실제 URL을 사용해서 3티어 아키텍쳐 머메이드로 <img> 사용해서 ** 양식을 붙여서 보내주세요.
                        
                        mermaid코드로 구성된 이미지 내용은 가장 단순한 형태로 나타내줘야 하며 사용자가 구성한 서비스를 간략히 잘 보여줘야 합니다.
                        VPC같은 항목은 영역으로서 각각의 아키텍쳐가 얽혀있는 모양을 논리적으로 표현해주세요.
                        대화 내역에 있는 mermaid 코드를 참조하여 기본 구조를 유지하면서 담당하고 있는 부분에 사용자의 요구사항을 추가하는 식으로 작성해야 합니다.

                        구성이 완료되고 사용자가 이대로 진행을 요청을 하게되면 "다른 텍스트 없이" mermaid코드만 **을 붙여서 출력해주세요.
                        mermaid 코드의 존재나 특성에 대해 별도로 언급하지 마세요.`;


            case 5:  // 안쓰는 번호
                return "이 프롬프트는 도달할 수 없습니다. 만약 이 메세지를 보게된다면 도망가십시오.";

            case 6: // 아웃트로 육식이
                return `당신은 사용자의 요구에 맞는 AWS 아키텍처 설계를 돕는 전문 안내자 역할을 합니다. 그 중 최종적으로 대화내역을 검토하는 담당자입니다.
                    지금까지의 대화 내용을 종합하여 필요한 AWS 서비스 구성을 아래 양식으로 생성해야합니다. 최종 구성은 Terraform 코드로 변환될 예정이며, 각 서비스와 옵션이 정확히 입력되어야 합니다.
                    생성한 최종구조에 대해 간략하게 설명해주세요. 
                    설명이 끝나면 다음의 양식대로 \n 없이 한줄로 글을 마무리해주세요.
                    각각 생성된 코드의 존재에 대해서는 절대 언급하지 말아주세요. 설명이 끝나고 코드가 시작할때 !!을 붙여주세요.

                    생성된 키워드 양식:
                    !!{ "service": "", "options": { "ami": "", "instance_type": "", "public":  } },{ "service": "", "options": { "engine": "", "instance_class": "", "allocated_storage":  } },{ "service": "", "options": { "bucket_name": "", "access": "" } }

                    그리고 해당 양식에 대해서 mermaid코드 또한 생성해주세요. 대화 로그를 참조하여 구조를 짜주세요. 구조에 변화가 없다면 대화로그를 참조하여 그대로 출력해주세요.
                    바로 사용할 수 있도록 result같은 수식어를 붙이지 마세요.
                    반드시 시작할때 **을 붙여주세요.
                    머메이드 코드의 문법을 철저하게 지켜서 에러가 나지 않도록 해줘.
                    생성된 mermaid 양식:
                    **[graphTD ...]
                    `;

            default:
                return "이 출력값은 버그이므로 어떤 인풋이 들어오든 '에러. 새로고침 필요' 메세지를 출력해야 함";
        }
    }

    // static async saveConversation(CID: number, user_question: string, response: string) {
    //     console.log(`Saving conversation: CID=${CID}, user_question=${user_question}, response=${response}`);
    // }

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
        console.log(`코드 시작 CID received in askBedrockModel: ${CID}`);

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
            // '당신의 웹서비스는 어떤 클라우드 기술이 필요한가요': 'template1-6',
            // 'template1-6' : '질문의 끝'

            '서버는 어떤 특징이 필요하나요': 'template2-2',
            '어떠한 서버 타입이 필요하시나요': 'template2-3',
            // '가장 중요한 가치는 무엇인가요': '질문의 끝',

            '데이터베이스 유형이 어떻게 되나요': 'template3-2',
            // '추가적인 데이터베이스 정보를 알려주세요': '질문의 끝',

            '스토리지의 사용 패턴은 어떻게 되나요': 'template4-2',
            '스토리지의 사용 목적은 무엇인가요': 'template4-3',
            // '스토리지에서 가장 중요한 가치는 무엇인가요': '질문의 끝',

            // '애플리케이션의 네트워크 요구사항은 무엇인가요': '마지막 질문',
            '계활': "컨텍스트 스위칭",
            '특정텍스트1': '컨텍스트 스위칭' // 여기서 답변 매칭해줌
        };

        // 이 질문의 역할은? - 아 메트릭스에서 나온 키워드에 따라 다음 질문을 매핑하는 역할. 즉, 각 스테이지의 첫 질문 트리거
        // const level4Questions = {
        //     '디비': 'template3-1',
        //     '서버': 'template2-1',
        //     '스토리지': 'template3-1',
        //     '네트워크': 'template4-1',
        // };

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

            let mermaid1: string[] = [];

            mermaid1 = await this.fetchMermaidByCID(CID);

            console.log("템플릿 머메이드가 찍히나?", `\n**${mermaid1.join(', ')}`);

            // 템플릿 응답 반환
            try {
                await this.saveConversation(CID, user_question, templateResponse + `\n**${mermaid1.join(', ')}`);
            } catch (error) {
                console.error('대화 내용 저장 중 에러 발생:', error);
            }
            return this.createResponse(templateResponse + `\n**${mermaid1.join(', ')}`);
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
                let textAfterDash = remainingText.substring(dashIndex + 1).trim();

                const slashIndex = textAfterDash.indexOf('/');

                if (slashIndex !== -1) { // / 기준으로 자르기
                    textAfterDash = textAfterDash.substring(0, slashIndex).trim();
                }

                // "선택" 글자 제거
                textAfterDash = textAfterDash.replace(/ 선택/g, '').trim();

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
            max_tokens: 2000,
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

            // 키워드 처리 및 저장 (botResponse, user_question을 사용)
            let updatedResponse = await this.processTextAndAddKeywords(botResponse, user_question, CID, modelSwitchCounter);

            if (botResponse.startsWith('**')) {

                let nextItem = globalMatrix.shift();
                this.saveStateData(CID, globalMatrix);
                if (!nextItem) {
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
                } else if (nextItem === '추가적인 네트워크 설정') {
                    nextTemplate = 'template5-1';
                } else {
                    nextTemplate = 'template6-1';
                }

                this.updateModelCounter(CID, nextItem);

                let answer = '';

                if (nextTemplate === 'template6-1') {
                    answer = nextTemplate;
                } else {
                    answer = nextTemplate + updatedResponse;
                }

                await this.saveConversation(CID, user_question, answer);

                return {
                    ...parsedResponse,
                    content: [
                        {
                            type: "text",
                            text: answer // 업데이트된 텍스트 (키워드 리스트 포함)
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
            console.error('에러 스택:', error.stack);
            console.error('에러 전체 정보:', JSON.stringify(error));
            console.error('DynamoDB 요청 실패 params:', params);
            throw new Error('대화 기록 저장 실패');
        }
    }

    // DynamoDB에서 특정 CID의 대화 기록을 불러오는 함수
    async getConversationsByCID(CID: number): Promise<any[]> {
        let lastEvaluatedKey;
        const allItems: any[] = []; // 명시적으로 any[] 타입으로 설정
    
        do {
            const params = {
                TableName: 'Conversations',
                FilterExpression: 'CID = :cid',
                ExpressionAttributeValues: {
                    ':cid': CID,
                },
                ExclusiveStartKey: lastEvaluatedKey, // 페이징을 위한 시작 키
            };
    
            try {
                console.log('쿼리 파라미터:', params);
                const result = await this.dynamoDB.scan(params).promise();
                
                if (result.Items) {
                    allItems.push(...(result.Items as any[])); // result.Items를 any[]로 타입 캐스팅
                }
    
                lastEvaluatedKey = result.LastEvaluatedKey; // 다음 페이지가 있으면 설정
    
            } catch (error) {
                console.error('대화 기록 불러오기 실패:', error.message);
                throw new Error('대화 기록 불러오기 실패');
            }
        } while (lastEvaluatedKey); // `LastEvaluatedKey`가 없을 때까지 반복
    
        // 타임스탬프를 기준으로 정렬하여 반환
        return allItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    

    // **로 감싸진 텍스트에서 키워드 추출
    extractMermaid(text: string): { keywords: string[], updatedText: string } {
        if (!text) {
            return { keywords: [], updatedText: '' };
        }

        // 줄바꿈 문자를 포함하여 문자열 끝까지 매치
        const regex = /\*\*(.*)$/s;
        const keywords: string[] = [];
        let match = text.match(regex);

        if (match) {
            keywords.push(match[1].trim());
            // '**'부터 문자열 끝까지 제거
            const updatedText = text.replace(regex, '').trim();
            return { keywords, updatedText };
        } else {
            // '**'로 시작하는 부분이 없으면 원본 텍스트 반환
            return { keywords: [], updatedText: text.trim() };
        }
    }

    extractKeywords(text: string): { keywords2: string[], updatedText2: string } {
        if (!text) {
            return { keywords2: [], updatedText2: '' };
        }
    
        // 줄바꿈 문자를 포함하여 문자열 끝까지 매치하는 정규식 수정
        const regex = /!!(.*)$/s;
        const keywords2: string[] = [];
        let match = text.match(regex);
    
        if (match) {
            keywords2.push(match[1].trim());
            // '!!'부터 문자열 끝까지 제거
            const updatedText2 = text.replace(regex, '').trim();
            return { keywords2, updatedText2 };
        } else {
            // '!!'로 시작하는 부분이 없으면 원본 텍스트 반환
            return { keywords2: [], updatedText2: text.trim() };
        }
    }

    // 기존 키워드를 누적하지 않고 새로운 키워드로 덮어쓰는 함수
    async saveKeywords(keywords: string[], CID: number): Promise<void> {
        const newKeywords = keywords.join(', ');

        const params = {
            TableName: 'Archboard_keyword',
            Key: { CID: CID },
            UpdateExpression: 'SET #keyword = :newKeywords, #timestamp = :timestamp',
            ExpressionAttributeNames: {
                '#keyword': 'keyword',
                '#timestamp': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':newKeywords': newKeywords,
                ':timestamp': new Date().toISOString(),
            }
        };

        try {
            await this.dynamoDB.update(params).promise();
            console.log(`키워드 저장 성공: ${newKeywords}`);
        } catch (error) {
            console.error(`키워드 저장 실패: ${error.message}`);
        }
    }

    // 기존 키워드를 누적하지 않고 새로운 키워드로 덮어쓰는 함수
    async saveMermaid(keywords: string[], CID: number): Promise<void> {
        // 새로운 키워드를 문자열로 결합
        const newKeywords = keywords.join(', ');


        const params = {
            TableName: 'Archboard_keyword',
            Item: {
                CID: CID,
                mermaid: newKeywords,
                timestamp: new Date().toISOString(),
            }
        };

        try {
            await this.dynamoDB.put(params).promise();
            console.log(`머메이드 저장 성공: ${newKeywords}`);
        } catch (error) {
            console.error(`머메이드 저장 실패: ${error.message}`);
        }
    }

    async processTextAndAddKeywords(outputText: string, inputText: string, CID: number, modelSwitchCounter: number): Promise<string> {

        // 키워드 추출 및 텍스트 업데이트
        const result = this.extractMermaid(outputText);

        const { keywords, updatedText } = result;

        const Keywordresult = this.extractKeywords(result.updatedText);

        const { keywords2, updatedText2 } = Keywordresult;

        // console.log("체크 1",updatedText);
        // console.log("체크 2",updatedText2);

        if (keywords.length > 0) {

            await this.saveMermaid(keywords, CID);

            if (modelSwitchCounter === 6) {
                
                await this.saveKeywords(keywords2, CID);
            }
        }

        let fetchedKeywords: string[] = [];

        // CID로 저장된 키워드 조회

        fetchedKeywords = await this.fetchMermaidByCID(CID);


        // 최종적으로 텍스트 끝에 키워드 리스트 추가
        let finalText = updatedText2;


        finalText += `\n**${fetchedKeywords.join(', ')}`;


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

    async fetchMermaidByCID(CID: number): Promise<string[]> {
        const params = {
            TableName: 'Archboard_keyword',
            KeyConditionExpression: 'CID = :cid',
            ExpressionAttributeValues: { ':cid': CID }
        };

        const result = await this.dynamoDB.query(params).promise();
        if (!result.Items || result.Items.length === 0) {
            return [];
        }

        return result.Items.map(item => item.mermaid);
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
    async generateSummary(CID: number, type: 'summary' | 'price'): Promise<string> {
        // 1. DynamoDB에서 keyword 데이터 가져오기
        const FuckingCID = Number(CID);
        const params = {
            TableName: 'Archboard_keyword',
            Key: { CID: FuckingCID },
            ProjectionExpression: 'keyword',
        };
        const result = await this.dynamoDB.get(params).promise();

        const keywordData = result.Item && result.Item.keyword ? result.Item.keyword : '';
        if (!keywordData) {
            return ''; // keyword 데이터가 없으면 빈 문자열 반환
        }

        // 2. Bedrock 요청을 위한 프롬프트 내용 준비
        const prompt_content = type === 'summary'
            ? `다음 키워드를 기반으로 각 서비스의 정보를 포함한 클라우드 아키텍처에 대한 상세 요약을 제공해 주세요. 각 서비스에 대해 두 줄 이내의 설명을 포함해 주세요. 추가 설명은 필요 없습니다.

아래와 같은 JSON 형식으로 출력해 주세요 (출력은 순수 내용만 나오게 해주세요):

{
  "aws_services": {
    "<서비스_이름>": {
      "title": "<서비스 제목>",
      "description": [
        "<첫 번째 설명 문장>",
        "<두 번째 설명 문장>"
      ]
    }
    // 키워드에 포함된 각 서비스마다 반복
  }
}

키워드: ${keywordData}

출력은 **한국어로** 해주세요.
`
            : `다음 키워드 내용을 바탕으로, 각 서비스의 가격 정보와 월간 총 예상 비용을 포함하여 불필요한 도입부나 마무리 멘트 없이 아래 형식으로 깔끔하게 정리해 주세요. 서비스의 개수는 유동적입니다.

            [각 서비스 반복 시작]
            [서비스 이름]
              - [세부 정보]
              - 가격: [가격 정보]
            [각 서비스 반복 끝]
            
            총 예상 비용 (월간):
            - [서비스 이름]: [월간 비용]
            - ...
            
            총계: [총 월간 비용]/월
            
            참고: 실제 비용은 사용량, 리전, 데이터 전송 등에 따라 달라질 수 있습니다.
            
            키워드: ${keywordData}`;

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
                modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
            }).promise();

            const responseBody = response.body.toString();
            const parsedResponse = JSON.parse(responseBody);


            console.log(parsedResponse);

            // 예상되는 데이터 형식에 따라 응답 반환
            return parsedResponse.content[0] || ''; // 적절한 키에 맞게 데이터를 반환
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
