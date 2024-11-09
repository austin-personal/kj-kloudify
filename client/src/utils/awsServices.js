// AWS 서비스 이름 배열
export const awsServices = [
  "EC2",
  "S3",
  "RDS",
  "Lambda",
  "CloudWatch",
  "IAM",
  "VPC",
  "CloudFormation",
  "Route-53",
  "DynamoDB",
  "CloudFront",
  "SNS",
  "SQS",
  "Kinesis",
  "EFS",
  "ECS",
  "EKS",
  "Aurora",
  "Redshift",
  "ElastiCache",
  "Glue",
  "EMR",
  "SageMaker",
  "CodeBuild",
  "CodePipeline",
  "CodeDeploy",
  "CodeCommit",
  "Secrets Manager",
  "Systems Manager",
  "Config",
  "Macie",
  "Rekognition",
  "Polly",
  "Textract",
  "Transcribe",
  "Lex",
  "Translate",
  "CloudTrail",
  "Inspector",
  "Trusted Advisor",
  "WAF",
  "Shield",
  "Direct Connect",
  "VPN",
  "Migration Hub",
  "DataSync",
  "QuickSight",
  "AppFlow",
  "Timestream",
  "EventBridge",
  "Network ACL",
  "Internet_Gateway",
  "Elastic-Container-Registry",
  "Elastic-Container-Service",
  "Elastic-Block-Store",
  "Auto-Scaling",
  "Security-Group",
  "ELB",
  "User",
  "API-Gateway",
  "NAT-Gateway",
  "Spot-Instances",
  "Cost-Explorer",
  "Read-Replica",
  "Elastic-IP",
  "Application-Load-Balancer",
  "Backup",
  "Elastic-Load-Balancing",
];

// 약어와 원본 매핑 객체
const serviceAliases = {
  ASG: "Auto-Scaling",
  NAT: "NAT-Gateway",
  S3: "S3",
  RDS: "RDS",
  EC2: "EC2",
  ALB: "Application-Load-Balancer",
  EIP: "Elastic-IP",
  R53: "Route-53",
  NATGW: "NAT-Gateway",
  ECR: "Elastic-Container-Registry",
  ECS: "Elastic-Container-Service",
  EBS: "Elastic-Block-Store",
  Security: "Security-Group",
  INTERNET_GATEWAY: "Internet-Gateway",
  ELB: "ELB",
  User: "User",
  // 다른 약어도 추가 가능
};

// 약어 및 대소문자에 유연한 서비스 이름 변환
function normalizeServiceName(text: string): string {
  // 공백과 밑줄을 하이픈으로 변경하여 대소문자 통일
  const modifiedText = text.replace(/[\s_]+/g, "-").toUpperCase();

  // serviceAliases에서 우선 검색
  if (serviceAliases[modifiedText]) {
    return serviceAliases[modifiedText];
  }

  // awsServices 배열에서 서비스 이름과 대조
  const matchedService = awsServices.find(
    (service) => service.toUpperCase() === modifiedText
  );
  return matchedService || modifiedText;
}

// 서비스 이름 추출 함수
export function extractServiceName(text: string): string | undefined {
  const normalizedText = normalizeServiceName(text);
  console.log("추출:", normalizedText);

  // 서비스가 awsServices 배열에 존재하는지 확인
  if (awsServices.includes(normalizedText)) {
    return normalizedText;
  }
  // serviceAliases에 매핑되어 있는 경우
  return serviceAliases[normalizedText] || undefined; // null 대신 undefined 반환
}
