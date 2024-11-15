import React from "react";

export interface Template {
    header?: string;
    name: string;
    text: string;
    multiselect?: string;
    subtext?: string;
    buttons?: { id: number; label: string }[];
    nobutton?: { id: number; label: string };
    checks?: { id: number; label: string }[];
    nocheck?: { id: number; label: string };
    servicechecks?: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
    3: {
        header: "구조 설정",
        name: "template1-2",
        text: "당신의 웹서비스 규모에 대해 알고 싶어요.",
        buttons: [
            { id: 1, label: "개인 프로젝트" },
            { id: 2, label: "소규모" },
            { id: 3, label: "중규모" },
            { id: 4, label: "대규모" },
        ]
    },
    4: {
        header: "구조 설정",
        name: "template1-3",
        text: "당신의 예산과 비용 관리 계획은 어떻게 되나요?",
        buttons: [
            { id: 5, label: "저렴하게 사용" },
            { id: 6, label: "금액 상관 없음" },
        ]
    },
    5: {
        header: "구조 설정",
        name: "template1-4",
        text: "추가적인 무언가가 필요한가요?\n 추가로 필요한 것만 알려주세요.",
        multiselect: "다중 선택",
        checks: [
            { id: 7, label: "운영 우수성" },
            { id: 8, label: "보안" },
            { id: 9, label: "안정성" },
            { id: 10, label: "성능 효율성" },
            { id: 11, label: "비용 최적화" },
        ],
        nocheck: { id: 12, label: "알아서 해줘" },
    },
    6: {
        header: "구조 설정",
        name: "template1-5",
        text: "당신의 웹서비스는 어떤 클라우드 기술이 필요한가요?",
        multiselect: "다중 선택",
        servicechecks: [
            { id: 13, label: "서버" },
            { id: 14, label: "데이터베이스" },
            { id: 15, label: "스토리지" },
            { id: 16, label: "추가적인 네트워크 설정" },
        ],
        nocheck: { id: 17, label: "알아서 해줘" }
    },
    7: {
        header: "서버",
        name: "template2-1",
        text: "지금부터는 서버에 대한 세부 설정을 할 거예요.\n서버는 어떤 특징이 필요하나요?",
        multiselect: "다중 선택",
        checks: [
            { id: 18, label: "기본 서버" },
            { id: 19, label: "CPU 집약적" },
            { id: 20, label: "Memory 집약적" },
            { id: 21, label: "통신 집약적" },
            { id: 22, label: "GPU 필요" },
        ],
        nocheck: { id: 23, label: "알아서 해줘" },
    },
    8: {
        header: "서버",
        name: "template2-2",
        text: "어떠한 서버 타입이 필요하시나요?",
        nobutton: { id: 24, label: "알아서 해줘" },
        buttons: [
            { id: 25, label: "기본 서버 (EC2)" },
            { id: 26, label: "컨테이너 서버 (ECS)" },
            { id: 27, label: "배포, 관리, 확장 자동화 서버" },
            { id: 28, label: "이벤트 기반 서버" }
        ]
    },
    9: {
        header: "서버",
        name: "template2-3",
        text: "가장 중요한 가치는 무엇인가요?",
        multiselect: "다중 선택",
        checks: [
            { id: 29, label: "가격 최적화" },
            { id: 30, label: "고가용성" },
            { id: 31, label: "고성능" },
            { id: 32, label: "백업기능" },
        ],
        nocheck: { id: 33, label: "알아서 해줘" },
    },
    10: {
        header: "데이터베이스",
        name: "template3-1",
        text: "지금부터는 데이터베이스에 대한 세부 설정을 할 거예요.\n데이터베이스 유형이 어떻게 되나요?",
        nobutton: { id: 34, label: "알아서 해줘" },
        buttons: [
            { id: 35, label: "관계형 데이터베이스 (postgres)" },
            { id: 36, label: "관계형 데이터베이스 (MySQL)" },
            { id: 37, label: "NoSQL (완전 관리형)" },
            { id: 38, label: "NoSQL (MongoDB호환형)" },
        ]
    },
    11: {
        header: "데이터베이스",
        name: "template3-2",
        text: "추가적인 데이터베이스 정보를 알려주세요.\n 가장 중요한 가치는 무엇인가요?",
        buttons: [
            { id: 39, label: "기본 설정" },
            { id: 40, label: "가격 최적화" },
            { id: 41, label: "고가용성" },
            { id: 42, label: "고성능" },
            { id: 43, label: "백업기능" },
        ],
        nocheck: { id: 44, label: "알아서 해줘" },
    },
    12: {
        header: "스토리지",
        name: "template4-1",
        text: "지금부터는 스토리지에 대한 세부 설정을 할 거예요.\n스토리지의 사용 패턴은 어떻게 되나요?",
        nobutton: { id: 45, label: "알아서 해줘" },
        buttons: [
            { id: 46, label: "기본 접근" },
            { id: 47, label: "아주 가끔식만 접근" },
        ],
    },
    13: {
        header: "스토리지",
        name: "template4-2",
        text: "스토리지의 사용 목적은 무엇인가요?",
        buttons: [
            { id: 49, label: "기본 파일" },
            { id: 50, label: "미디어 저장 (사진, 동영상 등)" },
            { id: 51, label: "정적 웹호스팅" }
        ]
    },
    14: {
        header: "스토리지",
        name: "template4-3",
        text: "스토리지에서 가장 중요한 가치는 무엇인가요?",
        multiselect: "다중 선택",
        checks: [
            { id: 52, label: "가격 최적화" },
            { id: 53, label: "고가용성" },
            { id: 54, label: "고성능" },
            { id: 55, label: "백업기능" },
        ],
        nocheck: { id: 56, label: "알아서 해줘" },
    },
    15: {
        header: "네트워크",
        name: "template5-1",
        text: "지금부터는 네트워크에 대한 세부 설정을 할 거예요.\n애플리케이션의 네트워크 요구사항은 무엇인가요?",
        multiselect: "다중 선택",
        checks: [
            { id: 57, label: "기본 설정" },
            { id: 58, label: "추가적인 보안" },
            { id: 59, label: "퍼블릭 인터넷과 연결" }
        ],
        nocheck: { id: 60, label: "알아서 해줘" },
    },
    16: {
        name: "template-trigger",
        text: "이대로 하시겠습니까?",
        buttons: [
            { id: 61, label: "예" },
            { id: 62, label: "아니요" }
        ]
    },
};

export const TemplateProvider: React.FC = (children) => {
    return <>{children}</>;
};

// templates를 외부에서 사용할 수 있도록 export
export const useTemplates = () => {
    return templates;
};