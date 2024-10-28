terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"  # 최신 안정 버전 사용
    }
  }
}
provider "aws" {
  region = var.aws_region  # 변수를 사용하여 리전 설정
}

resource "aws_lambda_function" "terraform_deploy_lambda" {
  filename         = "${path.module}/../terraform_deploy_function.zip"
  function_name    = "KloudifyTerraformDeploy"
  role             = "arn:aws:iam::123456789012:role/kloudify_lambda_role"
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../terraform_deploy_function.zip")
  runtime          = "nodejs16.x"

  environment {
    variables = {
      DB_HOST     = var.db_host
      DB_PORT     = var.db_port
      DB_USERNAME = var.db_username
      DB_PASSWORD = var.db_password
      DB_NAME     = var.db_name
      # 필요한 다른 환경 변수들
    }
  }

  vpc_config {
    subnet_ids         = var.lambda_subnet_ids
    security_group_ids = var.lambda_security_group_ids
  }
}


