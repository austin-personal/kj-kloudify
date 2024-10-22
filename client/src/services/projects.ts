import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://localhost:3000/projects';

export const create = async (projectName: string,token: string) => {
    try {
        // 태현 api 주소 확인!!!
        console.log("create 함수 안 테스트",projectName);
        const response = await axios.post(`${API_URL}/create`,  { projectName }, 
            {
                headers: {
                    Authorization: `Bearer ${token}`  // 옵션에 headers를 넣습니다.
                }
            });
        return response;
    } catch (error) {
        console.error('프로젝트 생성 개박살!! : ', error);
        throw error;
    }
};

export const deleteProject = async (PID: number) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.delete(`${API_URL}/delete`, {
           data : {
            PID
           }
        });
        return response;
    } catch (error) {
        console.error('프로젝트 삭제 개박살!! :', error);
        throw error;
    }
};

export const projectOneInfo = async (pid: number) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/${pid}`);
        return response;
    } catch (error) {
        console.error('프로젝트 정보 개박살!! :', error);
        throw error;
    }
};

export const projectAllInfo = async (token: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/findAll`, {
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