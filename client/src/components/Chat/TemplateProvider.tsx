import React from "react";

interface Template {
    name: string;
    text: string;
    subtext?: string;
    buttons?: { id: number; label: string }[];
    checks?: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
    2: {
        name: "template1-1",
        text: "먼저, 당신의 웹서비스에 대해 알고 싶어요. 당신의 웹 서비스의 주요 목적과 기능은 무엇인가요?",
        subtext: "자유롭게 당신의 서비스를 설명해주세요."
    },
    3: {
        name: "template1-2",
        text: "당신의 웹서비스 규모에 대해 알고 싶어요.",
        buttons: [
            { id: 1, label: "개인 프로젝트" },
            { id: 1, label: "소규모" },
            { id: 1, label: "중규모" },
            { id: 1, label: "대규모" },
        ]
    },
    4: {
        name: "template1-3",
        text: "당신의 예산과 비용 관리 계획은 어떻게 되나요?",
        buttons: [
            { id: 1, label: "저렴하게 사용" },
            { id: 1, label: "중간 금액 (월 $50)" },
            { id: 1, label: "금액 상관 없음" },
        ]
    },
    5: {
        name: "template1-4",
        text: "추가적인 무언가가 필요한가요? 추가적으로 필요한 것만 알려주세요. (다중선택)",
        checks: [
            { id: 1, label: "운영 우수성" },
            { id: 1, label: "보안" },
            { id: 1, label: "안정성" },
            { id: 1, label: "성능 효율성" },
            { id: 1, label: "비용 최적화" },
        ],
    },
    6: {
        name: "template1-5",
        text: "당신의 웹서비스는 어떤 클라우드 기술이 필요한가요? (다중선택)",
        checks: [
            { id: 1, label: "서버" },
            { id: 1, label: "데이터베이스" },
            { id: 1, label: "스토리지" },
            { id: 1, label: "네트워크" },
        ],
    },
    7: {
        name: "template2-1",
        text: "애플리케이션의 워크로드 특성이 있나요? (다중선택)",
        checks: [
            { id: 1, label: "기본" },
            { id: 1, label: "CPU 집약적" },
            { id: 1, label: "Memory 집약적" },
            { id: 1, label: "통신 집약적" },
            { id: 1, label: "GPU 필요" },
        ],
    },
    8: {
        name: "template2-2",
        text: "어떠한 서버 타입이 필요하시나요?",
        buttons: [
            { id: 1, label: "기본 서버" },
            { id: 1, label: "컨테이너 서버" },
            { id: 1, label: "배포, 관리, 확장 자동화 서버" },
            { id: 1, label: "이벤트 기반 서버" },
        ]
    },
    9: {
        name: "template2-3",
        text: "가장 중요한 가치는 무엇인가요? (다중선택) ",
        checks: [
            { id: 1, label: "기본" },
            { id: 1, label: "가격 최적화" },
            { id: 1, label: "고가용성" },
            { id: 1, label: "고성능" },
            { id: 1, label: "백업기능" },
        ],
    },
    10: {
        name: "template3-1",
        text: "데이터베이스 유형이 어떻게 되나요?",
        buttons: [
            { id: 1, label: "관계형 데이터베이스 (postgres)" },
            { id: 1, label: "관계형 데이터베이스 (MySQL)" },
            { id: 1, label: "NoSQL (완전 관리형)" },
            { id: 1, label: "NoSQL (MongoDB호환형)" },
        ]
    },
    11: {
        name: "template3-2",
        text: "추가적인 데이터베이스 정보를 알려주세요. 가장 중요한 가치는 무엇인가요?",
        buttons: [
            { id: 1, label: "기본" },
            { id: 1, label: "가격 최적화" },
            { id: 1, label: "고가용성" },
            { id: 1, label: "고성능" },
            { id: 1, label: "백업기능" },
        ]
    },
    12: {
        name: "template4-1",
        text: "스토리지의 사용 패턴은 어떻게 되나요?",
        buttons: [
            { id: 1, label: "기본" },
            { id: 1, label: "아주 가끔식만 접근" },
        ]
    },
    13: {
        name: "template4-2",
        text: "스토리지의 사용 목적은 무엇인가요?",
        buttons: [
            { id: 1, label: "미디어 저장 (사진, 동영상등등)" },
            { id: 1, label: "파일(저장)" },
            { id: 1, label: "정적 왭호스팅" }
        ]
    },
    14: {
        name: "template4-3",
        text: "스토리지에서 가장 중요한 가치는 무엇인가요? (다중선택) ",
        checks: [
            { id: 1, label: "기본" },
            { id: 1, label: "가격 최적화" },
            { id: 1, label: "고가용성" },
            { id: 1, label: "고성능" },
            { id: 1, label: "백업기능" },
        ],
    },
    15: {
        name: "template5-1",
        text: "애플리케이션의 네트워크 요구사항은 무엇인가요? (다중선택)",
        checks: [
            { id: 1, label: "기본 성능의 보안과 네트워크" },
            { id: 1, label: "추가적인 보안" },
            { id: 1, label: "퍼블릭 인터넷과 연결" }
        ],
    },
    16: {
        name: "template-trigger",
        text: "이대로 하시겠습니까?",
        buttons: [
            { id: 1, label: "예" },
            { id: 1, label: "아니요" }
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