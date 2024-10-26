import React from "react";

interface Template {
    name: string;
    text: string;
    buttons?: { id: number; label: string }[];
    checks?: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
    1: {
        name: "template 8",
        text: "이 프로젝트의 최종 목표는 무엇인가요?",
        buttons: [
            { id: 1, label: "개인 학습" },
            { id: 2, label: "소규모 비즈니스" },
            { id: 3, label: "대규모 배포" }
        ]
    },
    2: {
        name: "template 8",
        text: "클라우드에서 가장 필요한 기능이나 역할은 무엇인가요?",
        buttons: [
            { id: 4, label: "데이터 저장" },
            { id: 5, label: "서버 운영" },
            { id: 6, label: "개발 환경 제공" }
        ]
    },
    3: {
        name: "template 8",
        text: "이 프로젝트를 이용할 예상 사용자 수는 얼마나 되나요?",
        buttons: [
            { id: 7, label: "개인" },
            { id: 8, label: "소규모 팀" },
            { id: 9, label: "100명 이상" }
        ]
    },
    4: {
        name: "template 8",
        text: "예산이나 기간 제한이 있나요?",
        buttons: [
            { id: 10, label: "소규모 예산" },
            { id: 11, label: "6개월 내로 개발 완성 목표" },
        ]
    },
    5: {
        name: "template 8",
        text: "특별히 고려하고 싶은 요소가 있다면 알려주세요.",
        checks: [
            { id: 12, label: "데이터 보안" },
            { id: 13, label: "빠른 구축 속도" },
        ]
    },
    6: {
        name: "template 8",
        text: "당신의 서비스가 인터넷과 연결되어야 하나요?",
        buttons: [
            { id: 14, label: "예" },
            { id: 15, label: "아니요" },
        ]
    },
    7: {
        name: "template 8",
        text: "서버가 프로젝트의 핵심인가요, 아니면 간단한 웹 서버 정도만 필요한가요?",
        buttons: [
            { id: 16, label: "복잡한 서버" },
            { id: 17, label: "간단한 서버" },
            { id: 18, label: "필요없다" },
        ]
    },
    8: {
        name: "template 8",
        text: "데이터 저장 공간이 필요하신가요? 어떤 유형의 데이터가 주로 저장될 예정인가요?",
        buttons: [
            { id: 18, label: "필요없다" },
            { id: 19, label: "관계형 데이터베이스" },
            { id: 20, label: "NoSQL 데이터베이스" },
        ]
    },
    9: {
        name: "template 8",
        text: "프로젝트가 여러 네트워크 영역을 필요로 하나요? 혹은 안전한 네트워크 분리가 필요한가요?",
        buttons: [
            { id: 21, label: "여러 네트워크, Yes 분리" },
            { id: 23, label: "여러 네트워크, No 분리" },
            { id: 22, label: "단일 네트워크" },
        ]
    },
    10: {
        name: "template 8",
        text: "그 외에 필요한 기능이 있나요?",
        checks: [
            { id: 21, label: "데이터 분석" },
            { id: 23, label: "AI/ML 서비스" },
        ]
    },
    11: {
        name: "template 8",
        text: "이미지, 비디오, 문서 등 파일을 저장해야 하나요? 대량의 파일을 저장하고 관리하는 용도로 사용될 예정인가요?",
        buttons: [
            { id: 21, label: "예" },
            { id: 23, label: "아니요" },
        ]
    },
    12: {
        name: "template 8",
        text: "시스템 성능을 추적하거나 로그를 관리할 필요가 있나요?",
        buttons: [
            { id: 21, label: "예" },
            { id: 23, label: "아니요" },
        ]
    },
    13: {
        name: "template 8",
        text: "데이터베이스의 주요 기준을 선택하세요",
        buttons: [
            { id: 21, label: "비용 최적화: 비용을 낮추고 저용량부터 시작할 수 있는 설정 (예: 작은 RDS 인스턴스, 온디맨드 가격 모델)" },
            { id: 23, label: "고성능: 높은 성능과 빠른 처리 속도를 위해 최적화된 설정 (예: 고성능 RDS 인스턴스, Provisioned IOPS 스토리지)" },
            { id: 24, label: "확장 가능성: 서비스 확장을 위한 자동 확장 옵션 (예: Aurora Serverless)"}
        ]
    },
    14: {
        name: "template 8",
        text: "서버의 주요 기준을 선택하세요",
        buttons: [
            { id: 21, label: "저비용 서버: 일반적인 웹 서비스나 소규모 트래픽을 위한 저비용 옵션 (예: 작은 EC2 인스턴스, Spot Instances)" },
            { id: 23, label: "성능 중심 서버: 트래픽이 많거나 성능이 중요한 경우 (예: 고성능 EC2 인스턴스, Enhanced Networking 지원)" },
            { id: 24, label: "서버리스: 관리가 필요 없는 자동 확장 서버리스 옵션 (예: AWS Lambda)"}
        ]
    },
    15: {
        name: "template 8",
        text: "저장 공간의 주요 기준을 선택하세요",
        buttons: [
            { id: 21, label: "비용 절감: 장기 저장 및 저렴한 비용이 필요할 때 (예: S3 Standard-IA, S3 Glacier)" },
            { id: 23, label: "고성능: 빈번한 데이터 접근을 위한 높은 성능 (예: S3 Standard)" },
            { id: 24, label: "확장 및 내구성: 자동 확장 및 높은 데이터 내구성을 원하는 경우 (예: S3와 자동 확장 설정)"}
        ]
    },
    16: {
        name: "template 8",
        text: "네트워크 구성에서 중요하게 여기는 기준을 선택하세요",
        buttons: [
            { id: 21, label: "기본 보안: 기본적인 보안 구성으로 클라우드 네트워크 보호" },
            { id: 23, label: "고급 보안: 보안 강화를 위한 VPN 연결 및 세분화된 접근 제어 (예: VPC, Network ACL)" },
            { id: 24, label: "성능 최적화: 네트워크 성능을 높이기 위한 고성능 설정 (예: 고성능 네트워킹, 글로벌 가속기)"}
        ]
    },
    17: {
        name: "template 8",
        text: "모니터링과 로그 관리의 주요 기준을 선택하세요",
        buttons: [
            { id: 21, label: "기본 모니터링: 기본적인 성능 모니터링과 에러 알림 (예: CloudWatch 기본 설정)" },
            { id: 23, label: "심화 모니터링: 더 상세한 성능 및 로그 데이터 수집 (예: CloudWatch와 고급 메트릭)" },
            { id: 24, label: "자동화된 경고 및 알림: 특정 조건이 발생할 때 자동으로 알림을 받는 설정 (예: 경고 알림 및 자동 조치 설정)"}
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