// AWS 서비스 이름 배열
export const awsServices = [
  "ec2",
  "s3",
  "rds",
  "lambda",
  "cloudwatch",
  "iam",
  "vpc",
  "cloudformation",
  "route-53",
  "dynamodb",
  "cloudfront",
  "sns",
  "sqs",
  "kinesis",
  "efs",
  "ecs",
  "eks",
  "aurora",
  "redshift",
  "elasticache",
  "glue",
  "emr",
  "sagemaker",
  "codebuild",
  "codepipeline",
  "codedeploy",
  "codecommit",
  "secrets manager",
  "systems manager",
  "config",
  "macie",
  "rekognition",
  "polly",
  "textract",
  "transcribe",
  "lex",
  "translate",
  "cloudtrail",
  "inspector",
  "trusted advisor",
  "waf",
  "shield",
  "direct connect",
  "vpn",
  "migration hub",
  "datasync",
  "quicksight",
  "appflow",
  "timestream",
  "eventbridge",
  "network acl",
  "internet_gateway",
  "elastic-container-registry",
  "elastic-container-service",
  "elastic-block-store",
  "auto-scaling",
  "security-group",
  "elb",
  "user",
  "api-gateway",
  "nat-gateway",
  "spot-instances",
  "cost-explorer",
  "read-replica",
  "elastic-ip",
  "application-load-balancer",
  "backup",
  "elastic-load-balancing",
];

// 약어와 원본 매핑 객체
const serviceAliases = {
  asg: "auto-scaling",
  nat: "nat-gateway",
  s3: "s3",
  rds: "rds",
  ec2: "ec2",
  alb: "application-load-balancer",
  eip: "elastic-ip",
  r53: "route-53",
  natgw: "nat-gateway",
  ecr: "elastic-container-registry",
  ecs: "elastic-container-service",
  ebs: "elastic-block-store",
  security: "security-group",
  elb: "elastic-load-balancing",
  "elastic-load-balancer": "elastic-load-balancing",
  "elastic-load-balancing": "elastic-load-balancing",
  "simple-storage-service": "s3",
  user: "users",
  // 다른 약어도 추가 가능
};

const patternAliases = [
  {
    keywords: ["s3", "glacier"],
    serviceName: "simple-storage-service-glacier",
  },
  { keywords: ["internet"], serviceName: "internet-gateway" },
  // 필요한 추가 패턴 매핑 가능
];

// 약어 및 대소문자에 유연한 서비스 이름 변환
function normalizeServiceName(text: string): string {
  // 공백과 밑줄을 하이픈으로 변경하여 대소문자 통일
  let modifiedText = text.replace(/[\s_]+/g, "-").toLowerCase();
  console.log("modifiedText", modifiedText);

  // 키워드 기반 패턴 매칭
  for (const pattern of patternAliases) {
    if (pattern.keywords.every((keyword) => modifiedText.includes(keyword))) {
      return pattern.serviceName;
    }
  }

  // serviceAliases에서 우선 검색
  if (serviceAliases[modifiedText]) {
    return serviceAliases[modifiedText];
  }

  // awsServices 배열에서 서비스 이름과 대조
  const matchedService = awsServices.find(
    (service) => service === modifiedText
  );
  return matchedService || modifiedText;
}

// 서비스 이름 추출 함수
export function extractServiceName(text: string): string | undefined {
  const normalizedText = normalizeServiceName(text);
  console.log("normalizedText", normalizedText);
  // 서비스가 awsServices 배열에 존재하는지 확인
  if (awsServices.includes(normalizedText)) {
    return normalizedText;
  }

  // serviceAliases에 매핑되어 있는 경우
  return serviceAliases[normalizedText] || normalizedText;
}
