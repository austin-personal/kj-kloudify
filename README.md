# kj-kloudify
Kloudify - Cloud Architecture Automation Platform
Kloudify enables users to design tailored cloud infrastructures through an interactive, conversational interface. 
By progressively visualizing the evolving cloud architecture, Kloudify helps users clarify their cloud needs and see their ideal setup take shape in real time, leading to automated deployment.

## Problem to Solve
- Resource Constraints: Small teams and solo developers often face limitations in resources such as manpower, time, and budget, which impedes efficient cloud infrastructure setup.
- Complexity of AWS Configuration: AWS services come with numerous configuration options, making even a single service setup challenging. Building a cohesive multi-service architecture adds another layer of complexity, requiring a deep understanding of AWS options and integrations.


# Roles
#### Austin(Minseok) Kim: Project Manager
> - **Role**: DevOps, Project Manager, Backend Dev
> - **Implementation**:
>   - ERD Design
>   - Project Architecture Design
>   - Cloud Architecture Design
>   - Built the Cloud Infrastructure
>   - Backend APIs Progress
>   - Adapted LLM for project needs


### Front & Backend
- React
- Nest.JS

### LLM
- AWS Bedrock: FM model Claude 3.5 Sonnet
  
### DevOps
- AWS RDS-postgres: Default DB
- AWS DynamoDB: To store Chatting data
- AWS OpenSearch: To store vector data for the LLM model to enhance LLM capacity
- AWS S3: to store Terraform code and cloud arch image
- Container: Docker
- AWS EC2


## Simple Flowchart with architectures
![kloudify-flowchart drawio](https://github.com/user-attachments/assets/a58c484a-03f2-4aeb-999c-0f493d1c8e78)
- 현재 Lambda는 사용하지 않음.

### Poster

![kloudify 포스터 (1) pdf](https://github.com/user-attachments/assets/4b4c736d-aa2b-48ed-b10c-ce2596b749f7)

![포스터-김민석-Kloudify.pdf](https://github.com/user-attachments/files/17918272/-.-Kloudify.pdf)


