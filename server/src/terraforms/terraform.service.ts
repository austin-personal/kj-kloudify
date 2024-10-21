import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';

@Injectable()
export class TerraformService {

  // 키워드별로 필요한 Terraform 블록을 생성
  private generateTerraformBlock(service: string, options: any): string {
    let terraformBlock = '';

    // EC2 인스턴스 생성 (퍼블릭/프라이빗 여부 조건에 따라 처리)
    if (service === 'ec2') {
      terraformBlock += `
      resource "aws_instance" "example" {
        ami           = "${options.ami || 'ami-0c55b159cbfafe1f0'}"
        instance_type = "${options.instance_type || 't2.micro'}"
        ${options.public ? 'associate_public_ip_address = true' : ''}
        subnet_id     = "${options.subnet_id || 'subnet-123456'}"
      }\n`;
    }

    // S3 버킷 생성 (연결 여부 옵션 처리)
    if (service === 's3') {
      terraformBlock += `
      resource "aws_s3_bucket" "example" {
        bucket = "${options.bucket_name || 'example-bucket'}"
      }\n`;

      // 만약 S3와 연결된 EC2가 있다면
      if (options.linked_to_ec2) {
        terraformBlock += `
        resource "aws_s3_bucket_object" "example" {
          bucket = aws_s3_bucket.example.bucket
          key    = "example-object"
          source = "path/to/source/file"
        }\n`;
      }
    }

    // DB 연결 상태 (옵션에 따라 처리)
    if (service === 'rds') {
      terraformBlock += `
      resource "aws_db_instance" "example" {
        allocated_storage    = ${options.storage || '20'}
        engine               = "${options.engine || 'mysql'}"
        instance_class       = "${options.instance_class || 'db.t2.micro'}"
        name                 = "${options.db_name || 'exampledb'}"
        username             = "${options.username || 'admin'}"
        password             = "${options.password || 'password'}"
      }\n`;

      // 만약 DB와 연결된 EC2가 있다면
      if (options.linked_to_ec2) {
        terraformBlock += `
        output "db_instance_endpoint" {
          value = aws_db_instance.example.endpoint
        }\n`;
      }
    }

    return terraformBlock;
  }

  // 여러 키워드를 받아 Terraform configuration 파일 생성
  private generateTerraformConfig(keywords: Array<{ service: string; options: any }>): string {
    let terraformConfig = `provider "aws" {\n  region = "${keywords[0]?.options?.region || 'us-east-1'}"\n}\n`;

    // 주어진 키워드 리스트에 따라 Terraform 블록을 생성하여 병합
    for (const keyword of keywords) {
      terraformConfig += this.generateTerraformBlock(keyword.service, keyword.options) + '\n';
    }

    return terraformConfig;
  }

  // 테라폼 생성 명령어 실행
  async createTerraform(keywords: Array<{ service: string; options: any }>): Promise<string> {
    return new Promise((resolve, reject) => {
      // 주어진 키워드에 맞는 Terraform configuration 파일 생성
      const terraformConfig = this.generateTerraformConfig(keywords);
      fs.writeFileSync('main.tf', terraformConfig); // main.tf 파일 생성

      // Terraform 명령어 실행
      exec('terraform init && terraform apply -auto-approve', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout); // 성공 시 stdout 로그 반환
      });
    });
  }

  // 테라폼 삭제 명령어 실행
  async destroyTerraform(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec('terraform destroy -auto-approve', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  }

  // 테라폼 상태 확인 명령어 실행
  async showTerraformState(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec('terraform show', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
