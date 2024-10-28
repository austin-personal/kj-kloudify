# Provider configuration
provider "aws" {
  region     = "us-west-2"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

# Variables
variable "aws_access_key" {
  description = "AWS Access Key"
  type        = string
}

variable "aws_secret_key" {
  description = "AWS Secret Key"
  type        = string
}

# EC2 Instance
resource "aws_instance" "example" {
  ami           = "ami-0c9c942bd7bf113a2"
  instance_type = "t3.micro"
  
  tags = {
    Name = "ExampleInstance"
  }

  vpc_security_group_ids = [aws_security_group.instance_sg.id]
}

resource "aws_security_group" "instance_sg" {
  name_prefix = "instance-sg-"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Instance
resource "aws_db_instance" "example" {
  engine         = "mysql"
  engine_version = "5.7"
  instance_class = "db.t3.micro"
  multi_az       = false

  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = "exampledb"
  username = "admin"
  password = "password123"  # Change this to a secure password

  skip_final_snapshot = true
}

# S3 Bucket
resource "aws_s3_bucket" "example" {
  bucket = "my-example-bucket"
}

resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.example.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}