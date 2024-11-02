# 1단계: Node.js를 이용해 빌드
FROM node:16 AS build
WORKDIR /app

# package.json과 package-lock.json을 복사
COPY package*.json ./
RUN npm install

# 소스 파일을 복사하고 빌드
COPY . .
RUN npm run build

# 2단계: Nginx를 통해 정적 파일 제공
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
