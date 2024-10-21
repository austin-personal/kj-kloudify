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

    // S3 버킷 생성 (파일 업로드 없이 버킷만 생성)
    if (service === 's3') {
      terraformBlock += `
      provider "aws" {
        alias       = "s3_provider"
        access_key  = "${options.access_key || ''}"  // 자격 증명 전달
        secret_key  = "${options.secret_key || ''}"
        region      = "${options.region || 'ap-northeast-2'}"  // S3 리전 설정
      }
    
      resource "aws_s3_bucket" "example" {
        provider = aws.s3_provider  // 올바른 provider 참조
        bucket   = "${options.bucket_name || 'example-bucket'}"
      }\n`;
  
      // S3와 EC2 연결이 필요하지만 파일 업로드는 하지 않음
      if (options.linked_to_ec2) {
        terraformBlock += `
        # S3와 EC2 연결을 위해 추가적인 설정이 필요할 경우 여기에 작성 가능 (업로드는 하지 않음)
        `;
      }
    }
  
    // RDS DB 인스턴스 생성

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

  // 여러 서비스를 받아 Terraform configuration 파일 생성
  private generateTerraformConfig(
    services: Array<{ service: string; options: any }>, 
    awsCredentials: { accessKeyId: string; secretAccessKey: string }
  ): string {
    let terraformConfig = `
      provider "aws" {
        access_key = "${awsCredentials.accessKeyId}"
        secret_key = "${awsCredentials.secretAccessKey}"
        region     = "${services[0]?.options?.region || 'ap-northeast-2'}"  // 서울 리전으로 설정
      }\n`;

    // 주어진 서비스 리스트에 따라 Terraform 블록을 생성하여 병합
    for (const service of services) {
      terraformConfig += this.generateTerraformBlock(service.service, {
        ...service.options,
        access_key: awsCredentials.accessKeyId,
        secret_key: awsCredentials.secretAccessKey
      }) + '\n';
    }

    return terraformConfig;
  }

  // 테라폼 생성 명령어 실행
  async createTerraform(
    services: Array<{ service: string; options: any }>, 
    awsCredentials: { accessKeyId: string; secretAccessKey: string }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // 주어진 키워드에 맞는 Terraform configuration 파일 생성
      const terraformConfig = this.generateTerraformConfig(services, awsCredentials);

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
        if (stderr && !stderr.includes('Warning')) {  // 경고를 제외한 stderr 처리
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout); // 성공 시 stdout 로그 반환

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
        if (stderr && !stderr.includes('Warning')) {  // 경고를 제외한 stderr 처리
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout); // 성공 시 stdout 로그 반환

      });
    });
  }
}
