// src/utils/awsServices.js

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
  "NACL",
  "Internet-Gateway",
  "Elastic-Container-Registry",
  "Elastic-Container-Service",
  "Elastic-Block-Store",
  "Auto-Scaling",
  "Security-Group",
  "ELB",
  "User",
  "API-Gateway",
  "NAT-Gateway",
  "Systems-Manager",
  "Spot-Instances",
  "Cost-Explorer",
  "Read-Replica",
  "Elastic-IP",
];

// 약어와 원본 매핑 객체
const serviceAliases = {
  EIP: "Elastic-IP",
  Internet: "Internet-Gateway",
  IGW: "Internet-Gateway",
  R53: "Route-53",
  ELP: "Elastic-IP",
  NATGW: "NAT-Gateway",
  ElasticLoadBalancing: "ELB",
  ELB: "ELB", // 다른 약어도 추가 가능
  ECR: "Elastic-Container-Registry",
  ECS: "Elastic-Container-Service",
  EBS: "Elastic-Block-Store",
  "Security Groups": "Security-Group",
  // "Security Group": "Security-Group",
  // "Network ACL": "NACL",
  "Network ACLs": "NACL",
  // "Auto Scaling": "Auto-Scaling",
  // "Internet Gateway": "Internet-Gateway",
  Users: "User",
  // "API Gateway": "API-Gateway",
};

// 매핑된 키로 변환하는 함수
function normalizeServiceName(text) {
  // 공백을 하이픈으로 변환
  const modifiedText = text.replace(/\s+/g, "-");

  for (const [key, alias] of Object.entries(serviceAliases)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(modifiedText)) {
      return alias;
    }
  }

  return modifiedText; // 수정된 텍스트 반환
}

// 서비스 이름을 추출하는 함수
export function extractServiceName(text) {
  // 공백을 하이픈으로 변환 후 약어 변환
  const normalizedText = normalizeServiceName(text);
  console.log("text:", text);
  const regex = new RegExp(
    `\\b(${awsServices.map((name) => name).join("|")})\\b`,
    "i"
  );
  console.log("text:", regex);
  const match = normalizedText.match(regex);
  return match ? match[0] : null;
}
