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
  nacl: "network-access-control-list",
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
};

// detail 페이지를 위한 약어
const serviceStateAliases = {
  aws_instance: "ec2-instance",
  aws_s3_bucket: "s3",
  aws_lambda_function: "lambda",
  aws_rds_instance: "rds",
  aws_dynamodb_table: "dynamodb",
  aws_iam_role: "iam-identity-center",
  aws_iam_policy: "iam-identity-center",
  aws_iam_user: "iam-identity-center",
  aws_vpc: "vpc",
  aws_subnet: "public-subnet",
  aws_security_group: "security-group",
  aws_ecs_cluster: "elastic-container-service",
  aws_ecs_task_definition: "elastic-container-service",
  aws_eks_cluster: "elastic-kubernetes-service",
  aws_elb: "elastic-load-balancing",
  aws_alb: "application-load-balancer",
  aws_glacier_vault: "glacier-vault",
  aws_cloudfront_distribution: "cloudfront",
  aws_cloudwatch_alarm: "cloudwatch",
  aws_cloudwatch_log_group: "cloudwatch",
  aws_autoscaling_group: "auto-scaling",
  aws_autoscaling_policy: "auto-scaling",
  aws_kinesis_stream: "kinesis",
  aws_sqs_queue: "simple-queue-service",
  aws_sns_topic: "simple-notification-service",
  aws_route53_zone: "route-53",
  aws_route53_record: "route-53",
  aws_elasticache_cluster: "elasticache",
  aws_redshift_cluster: "redshift",
  aws_kms_key: "key-management-service",
  aws_secretsmanager_secret: "secrets-manager",
  aws_acm_certificate: "certificate-manager",
  aws_stepfunctions_state_machine: "step-functions",
  aws_emr_cluster: "emr",
  aws_batch_job_queue: "batch",
  aws_batch_compute_environment: "batch",
  aws_sagemaker_notebook_instance: "sagemaker",
  aws_sagemaker_endpoint: "sagemaker",
  aws_apigateway_rest_api: "api-gateway",
  aws_apigatewayv2_api: "api-gateway",
  aws_cloudformation_stack: "cloudformation",
  aws_elastic_beanstalk_environment: "elastic-beanstalk",
  aws_elastic_beanstalk_application: "elastic-beanstalk",
  aws_eip: "elastic-ip",
  aws_rds_cluster: "rds",
  aws_efs_file_system: "efs",
  aws_msk_cluster: "managed-streaming-for-apache-kafka",
  aws_neptune_cluster: "neptune",
  aws_network_acl: "network-access-control-list",
  aws_nat_gateway: "nat-gateway",
  aws_transit_gateway: "transit-gateway",
  aws_codebuild_project: "codebuild",
  aws_codepipeline: "codepipeline",
  aws_codecommit_repository: "codecommit",
  aws_codedeploy_application: "codedeploy",
  aws_opsworks_stack: "opsworks",
  aws_backup_vault: "backup-vault",
  aws_workspaces_directory: "workspaces-family",
  aws_directory_service_directory: "directory-service",
  aws_route_table: "route-table",
  aws_route: "route-53",
  aws_rds_parameter_group: "rds",
  aws_sqs_dead_letter_queue: "simple-queue-service",
  aws_inspector_assessment_template: "inspector",
  aws_appmesh_mesh: "app-mesh",
  aws_licensemanager_license_configuration: "license-manager",
  aws_mq_broker: "mq",
  aws_network_interface: "network-interface",
  aws_s3_access_point: "s3-access-point",
  aws_ec2_capacity_reservation: "ec2",
  aws_elastictranscoder_pipeline: "elastic-transcoder",
  aws_glue_crawler: "glue_crawler",
  aws_glue_job: "glue",
  aws_ssm_parameter: "systems-manager",
  aws_elasticsearch_domain: "elasticsearch",
  aws_documentdb_cluster: "documentdb",
  aws_athena_database: "athena",
  aws_gamelift_fleet: "gamelift",
  aws_kendra_index: "kendra",
  aws_network_firewall: "network-firewall",
  aws_outposts_outpost: "outpost-family",
  aws_qldb_ledger: "quantum-ledger-database",
  aws_amplify_app: "amplify",
  aws_appstream_fleet: "appstream",
  aws_apigatewayv2_stage: "api-gateway",
  aws_cloud9_environment_ec2: "cloud9",
  aws_cognito_user_pool: "cognito",
  aws_cognito_identity_pool: "cognito",
  aws_dataexchange_dataset: "data-exchange",
};

const patternAliases = [
  {
    keywords: ["dynamodb", "accelerator"],
    serviceName: "dynamodb-accelerator",
  },
  {
    keywords: ["elastic", "load"],
    serviceName: "elastic-load-balancing",
  },
  {
    keywords: ["application", "load"],
    serviceName: "application-load-balancer",
  },
  {
    keywords: ["acl"],
    serviceName: "network-access-control-list",
  },
  {
    keywords: ["route", "table"],
    serviceName: "route-table",
  },
  {
    keywords: ["security"],
    serviceName: "security-group",
  },
  {
    keywords: ["nat"],
    serviceName: "nat-gateway",
  },
  {
    keywords: ["route", "53"],
    serviceName: "route-53",
  },
  {
    keywords: ["auto", "scaling"],
    serviceName: "auto-scaling",
  },
  {
    keywords: ["glacier"],
    serviceName: "simple-storage-service-glacier",
  },
  {
    keywords: ["s3"],
    serviceName: "simple-storage-service",
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

// 서비스 상태 이름 추출 함수
export function extractServiceStateName(text: string): string | undefined {
  console.log("stateText", text);
  if (serviceStateAliases[text]) {
    return serviceStateAliases[text];
  } else {
    return null;
  }
}
