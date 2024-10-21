provider "aws" {
  region = "us-east-1"
}

      resource "aws_instance" "example" {
        ami           = "ami-0123456789abcdef0"
        instance_type = "t2.micro"
        associate_public_ip_address = true
        subnet_id     = "subnet-123456"
      }


      resource "aws_s3_bucket" "example" {
        bucket = "my-unique-bucket"
      }

        resource "aws_s3_bucket_object" "example" {
          bucket = aws_s3_bucket.example.bucket
          key    = "example-object"
          source = "path/to/source/file"
        }

