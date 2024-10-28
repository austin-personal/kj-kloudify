variable "db_host" {
  type        = string
  description = "Database host"
  default     = "localhost"
}

variable "db_port" {
  type        = number
  description = "Database port"
  default     = 5432
}

variable "db_username" {
  type        = string
  description = "Database username"
  default     = "postgres"
}

variable "db_password" {
  type        = string
  description = "Database password"
  sensitive   = true
  default     = "1234"
}

variable "db_name" {
  type        = string
  description = "Database name"
  default     = "my_test"
}

variable "lambda_subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for Lambda function"
}

variable "lambda_security_group_ids" {
  type        = list(string)
  description = "Security Group IDs for Lambda function"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  default     = "us-northeast-2"  # 필요한 리전으로 설정
}

