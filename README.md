# kj-kloudify

Kloudify - Cloud Architecture Automation Platform
Kloudify enables users to design tailored cloud infrastructures through an interactive, conversational interface. 
By progressively visualizing the evolving cloud architecture, Kloudify helps users clarify their cloud needs and see their ideal setup take shape in real time, leading to automated deployment.

## Front & Backend
- React
- Nest.JS
- Container: Docker
  
## Server
- AWS EC2
- AWS Lambda: To deploy the user's terraform file independently
  
## LLM
- AWS Bedrock: FM model Claude 3.5 Sonnet
  
## DB
- AWS RDS-postgres: Default DB
- AWS DynamoDB: To store Chatting data
- AWS OpenSearch: To store vector data for the LLM model to enhance LLM capacity

## Storage  
- AWS S3: to store Terraform code and cloud arch image



![kloudify-architecture drawio](https://github.com/user-attachments/assets/ef5e8065-c37a-4c4e-b987-3dd38c846d6a)
