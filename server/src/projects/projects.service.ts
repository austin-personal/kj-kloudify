import { Injectable, NotFoundException , InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projects } from './entity/projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Users } from '../users/entity/users.entity'; 
import { DeleteItemCommand, DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'; 

import { ConversationsService } from '../conversations/conversations.service'; 

import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as AWS from 'aws-sdk';


@Injectable()
export class ProjectsService {
  private readonly dynamoDB: AWS.DynamoDB.DocumentClient;
  constructor(
    @InjectRepository(Projects)
    private readonly projectRepository: Repository<Projects>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly conversationsService: ConversationsService, 
  ) {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  }

  // 새로운 프로젝트 생성
  async create(createProjectDto: CreateProjectDto, user: Users): Promise<Projects> {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const project = this.projectRepository.create({
    projectName: createProjectDto.projectName,
    createdDate: new Date(),
    UID: user.UID,
    });
    const savedProject = await this.projectRepository.save(project);
    console.log("savedProject", savedProject);
    return savedProject;
  }


// 유저ID로 모든 배포된 프로젝트 가져오기
  async findDeployedByUserId(userId: number): Promise<Projects[]> {
    return this.projectRepository.find({ where: { UID: userId, isDeployed: true } });
  }

// 유저ID로 모든 배포된 프로젝트 가져오기
  async findResumeByUserId(userId: number): Promise<Projects[]> {
    return this.projectRepository.find({ where: { UID: userId, isDeployed: false } });
  }


// PID로 특정 프로젝트 가져오기
  async findOneByPID(pid: number): Promise<Projects> {
    const project = await this.projectRepository.findOne({ where: { PID:pid } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    console.log("project findOne: ", pid);
    
    return project;
  }

  // 해당 프로젝트에 관한 모든 것 삭제.
  async remove(pid: number, uid: number): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { PID: pid } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  
    const cid = project.CID;  // 프로젝트의 CID 값 가져오기 (문자열)
    console.log("Deleting project with PID:", pid, "and CID:", cid);
  
    // RDB에서 프로젝트 삭제
    await this.projectRepository.remove(project);
  
    // DynamoDB 설정
    const dynamoDBClient = new DynamoDBClient({ region: 'ap-northeast-2' }); 
    
    // 삭제할 테이블 목록
    const tables = ['Archboard_keyword', 'Conversations', 'ConversationsState'];
  
    try {
      for (const tableName of tables) {
        const scanParams = {
          TableName: tableName,  
          FilterExpression: 'CID = :CID',
          ExpressionAttributeValues: {
            ':CID': { N: cid.toString() },  
          },
        };
  
        // 1. CID에 해당하는 항목을 스캔
        const scanResult = await dynamoDBClient.send(new ScanCommand(scanParams));
        const itemsToDelete = scanResult.Items ?? [];  // itemsToDelete가 undefined인 경우 빈 배열로 초기화
  
        if (itemsToDelete.length === 0) {
          console.log(`No items found for CID: ${cid} in table: ${tableName}`);
          continue;
        }
  
        // 2. 스캔한 각 항목을 삭제 (ID 사용)
        for (const item of itemsToDelete) {
          if (item.ID && item.ID.N) { // ID는 숫자(N)
            const deleteParams = {
              TableName: tableName,
              Key: {
                ID: { N: item.ID.N },  // 숫자로 저장된 ID 값만 사용하여 삭제
              }
            };
            console.log(`Deleting item with ID: ${item.ID.N} from table: ${tableName}`);
            await dynamoDBClient.send(new DeleteItemCommand(deleteParams));
          } else {
            console.error(`Skipping item due to missing ID: ${JSON.stringify(item)}`);
          }
        }
  
        console.log(`Deleted ${itemsToDelete.length} items from DynamoDB table: ${tableName} with CID: ${cid}`);
      }
    } catch (error) {
      console.error("Error deleting items from DynamoDB:", error);
      throw new InternalServerErrorException('Failed to delete items from DynamoDB');
    }
  }

  async getProjectNameByPID(pid: number): Promise<string | null> {
    
    const project = await this.projectRepository.findOne({
        where: { PID: pid },
        select: ['projectName'], // projectName 컬럼만 선택
    });
    if (!project) {
        throw new NotFoundException('Project not found');
    }
    
    return project.projectName;
  }

  async getUIDByPID(pid: number): Promise<number | null> {
    
    const project = await this.projectRepository.findOne({
        where: { PID: pid },
        select: ['UID'], // UID 컬럼만 선택
    });
    if (!project) {
        throw new NotFoundException('Project not found');
    }
    
    return project.UID;
  }
  async getMermaidCode(pid: number):Promise<any[]>  {
    //Find CID with PID
    const project = await this.projectRepository.findOne({ where: { PID: pid } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const cid = project.CID;
    console.log("getMermaidCode: ", cid);
    const params = {
      TableName: 'Archboard_keyword',
      FilterExpression: 'CID = :cid',
      ExpressionAttributeValues: {
        ':cid': cid
      }
    };
    try {
      const result = await this.dynamoDB.scan(params).promise();
      const items = result.Items || [];
      return items;
    } catch (error) {
      console.error('Error fetching data from DynamoDB:', error);
      throw new InternalServerErrorException('Failed to fetch data from DynamoDB');
    }
  }
  
}
