import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://localhost:3000/projects';

export const create = async (projectName: string,token: string) => {
    try {
        const response = await axios.post(`${API_URL}`,  
            { projectName },  // createProjectDto로 보내질 부분
            {
                headers: {
                    Authorization: `Bearer ${token}`  // JWT 토큰을 헤더에 포함
                }
            });
        return response.data.CID;
    } catch (error) {
        console.error('프로젝트 생성 개박살!! : ', error);
        throw error;
    }
};

export const deleteProject = async (PID:number,token:string) => {
    try {
        // 태현 api 주소 확인!!!
        console.log("delete 프론트 PID",PID);
        const response = await axios.delete(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`,
              },
              data: { PID }, // PID를 body로 전달
            });
        return response;
    } catch (error) {
        console.error('프로젝트 삭제 개박살!! :', error);
        throw error;
    }
};

export const projectOneInfo = async (pid: number, token: string | null) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/${pid}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('프로젝트 정보 개박살!! :', error);
        throw error;
    }
};

export const projectAllInfo = async (token: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('프로젝트 정보 개박살!! :', error);
        throw error;
    }
};