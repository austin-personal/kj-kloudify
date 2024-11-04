FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

# Terraform 설치 - bullseye로 변경
RUN apt-get update && apt-get install -y gnupg software-properties-common \
    && wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor > /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com bullseye main" | tee /etc/apt/sources.list.d/hashicorp.list \
    && apt-get update && apt-get install terraform


COPY . .

RUN npm run build

CMD ["npm", "run", "start"] 

EXPOSE 3000
