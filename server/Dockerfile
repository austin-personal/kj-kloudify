# 베이스 이미지로 Node.js 선택
FROM node:16

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 복사 및 설치
COPY package*.json ./
RUN npm install

# Terraform 설치
RUN apt-get update && apt-get install -y gnupg software-properties-common \
    && wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor > /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list \
    && apt-get update && apt-get install terraform



# 소스 파일 복사
COPY . .

# NestJS 애플리케이션 빌드 및 실행
RUN npm run build

# changed from CMD ["npm", "run", "start:prod"] :prod will need to have dist folder in local
CMD ["npm", "run", "start"] 

EXPOSE 3000
