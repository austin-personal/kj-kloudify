const AWS = require('aws-sdk');
const { Client } = require('pg');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
// 필요하면 암호화/복호화를 위한 라이브러리 추가

exports.handler = async (event) => {
  try {
    require('dotenv').config();
    const { userId, s3Bucket, s3Key, CID } = event;

    // 1. PostgreSQL에서 사용자 자격 증명 조회
    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await dbClient.connect();

    const res = await dbClient.query(
      'SELECT "encryptedAccessKeyId", "encryptedSecretAccessKey", region FROM secrets WHERE "UID" = $1',
      [userId]
    );

    if (res.rows.length === 0) {
      throw new Error('User credentials not found');
    }

    const { encryptedAccessKeyId, encryptedSecretAccessKey, region } = res.rows[0];

    // 2. 자격 증명 복호화 (필요한 경우)
    const accessKeyId = decrypt(encryptedAccessKeyId);
    const secretAccessKey = decrypt(encryptedSecretAccessKey);

    await dbClient.end();

    

    // 이제 process.env를 통해 환경 변수에 접근할 수 있습니다.
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;

    // 4. S3에서 Terraform 파일 다운로드
    const s3 = new AWS.S3();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terraform-'));
    const terraformFilePath = path.join(tmpDir, 'main.tf');

    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
    };

    const data = await s3.getObject(params).promise();
    fs.writeFileSync(terraformFilePath, data.Body.toString());

    // 5. Terraform 명령 실행
    // Terraform 초기화
    await executeCommand('./terraform init', tmpDir);

    // Terraform 계획 생성
    await executeCommand('./terraform plan -out=plan.out', tmpDir);

    // Terraform 적용
    await executeCommand('./terraform apply -auto-approve plan.out', tmpDir);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Terraform deployment successful',
      }),
    };
  } catch (error) {
    console.error('Deployment failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Deployment failed',
        error: error.message,
      }),
    };
  }
};

// 쉘 명령 실행을 위한 헬퍼 함수
function executeCommand(command, workingDir) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`, error);
        reject(error);
      } else {
        console.log(`Command succeeded: ${command}`, stdout);
        resolve(stdout);
      }
    });
  });
}

// 자격 증명 복호화 함수 (구현 필요)
function decrypt(encryptedText) {
  // 복호화 로직 구현
  return encryptedText; // 실제 복호화된 텍스트 반환
}
