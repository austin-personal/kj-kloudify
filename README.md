# kj-kloudify
Kloudify - Cloud Architecture Automation Platform
Kloudify enables users to design tailored cloud infrastructures through an interactive, conversational interface. 
By progressively visualizing the evolving cloud architecture, Kloudify helps users clarify their cloud needs and see their ideal setup take shape in real time, leading to automated deployment.

## Problem to Solve
- Resource Constraints: Small teams and solo developers often face limitations in resources such as manpower, time, and budget, which impedes efficient cloud infrastructure setup.
- Complexity of AWS Configuration: AWS services come with numerous configuration options, making even a single service setup challenging. Building a cohesive multi-service architecture adds another layer of complexity, requiring a deep understanding of AWS options and integrations.


# Roles
#### Austin(Minseok) Kim: Project Manager
- DevOps
- Design ERD
- Designed Project Architecture
- Designed Cloud Architecture
- Built the cloud infra
- Backend APIs 50/100
- Adapted LLM

### Front & Backend
- React
- Nest.JS
- Container: Docker
  
### Server
- AWS EC2
- AWS Lambda: To deploy the user's terraform file independently
  
### LLM
- AWS Bedrock: FM model Claude 3.5 Sonnet
  
### DB
- AWS RDS-postgres: Default DB
- AWS DynamoDB: To store Chatting data
- AWS OpenSearch: To store vector data for the LLM model to enhance LLM capacity

### Storage  
- AWS S3: to store Terraform code and cloud arch image


## Simple Flowchart with architectures
![kloudify-flowchart drawio](https://github.com/user-attachments/assets/a58c484a-03f2-4aeb-999c-0f493d1c8e78)

### Process
![Screenshot 2024-10-27 at 19 28 30](https://github.com/user-attachments/assets/3e2acbbf-d665-414f-aeff-adcaf3c559f3)

### Cloud Architecture
![kloudify-architecture drawio](https://github.com/user-attachments/assets/ef5e8065-c37a-4c4e-b987-3dd38c846d6a)

