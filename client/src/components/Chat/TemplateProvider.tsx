import React from "react";

interface Template {
    name: string;
    buttons: { id: number; label: string }[];
    checks?: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
    1: {
        name: "어떤 서비스들을 원하시나요?",
        buttons: [],
        checks: [
            { id: 1, label: "Server" },
            { id: 2, label: "DataBase" },
            { id: 3, label: "Storage" }
        ]
    },
    2: {
        name: "Server는 어떤 서버를 원하시나요?",
        buttons: [
            { id: 4, label: "EC2" },
            { id: 5, label: "Lambda" },
            { id: 6, label: "Elastic beanstalk" },
        ],
    },
    3: {
        name: "Server 성능은 어느정도를 원하시나요?",
        buttons: [
            { id: 7, label: "동시 접속 1000명 이하" },
            { id: 8, label: "동시 접속 1000 ~ 5000명" },
            { id: 9, label: "동시 접속 5000명 이상" },
        ],
    },
    4: {
        name: "DB는 어떤 DB를 원하시나요?",
        buttons: [
            { id: 10, label: "DynamoDB" },
            { id: 11, label: "DocumentDB" },
            { id: 12, label: "RDS" },
        ],
    },
    5: {
        name: "DB 성능은 어느정도를 원하시나요?",
        buttons: [
            { id: 13, label: "1GB 이하" },
            { id: 14, label: "1GB ~ 100GB" },
            { id: 15, label: "100GB 이상" },
        ],
    },
    6: {
        name: "Storage는 어떤 Storage를 원하시나요?",
        buttons: [
            { id: 16, label: "S3" },
            { id: 17, label: "EBS" },
            { id: 18, label: "EFS" }
        ]
    },
    7: {
        name: "Storage 성능은 어느정도를 원하시나요?",
        buttons: [
            { id: 19, label: "고빈도" },
            { id: 20, label: "중빈도" },
            { id: 21, label: "저빈도" }
        ]
    },
    8: {
        name: "가격은 어느정도를 원하시나요?",
        buttons: [
            { id: 22, label: "약 $10 ~ $50 USD/month" },
            { id: 23, label: "약 $100 ~$500 USD / month" },
            { id: 24, label: "약 $1,000 ~수천 USD / month" }
        ]
    }
};

export const TemplateProvider: React.FC = (children) => {
    return <>{children}</>;
};

// templates를 외부에서 사용할 수 있도록 export
export const useTemplates = () => {
    return templates;
};