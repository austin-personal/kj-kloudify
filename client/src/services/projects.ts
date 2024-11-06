import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/projects`;

export const create = async (projectName: string, token: string) => {
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

export const deleteProject = async (PID: number, token: string | null) => {
    try {
        // 태현 api 주소 확인!!!
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

//배포되지 않은 프로젝트 가져오기
export const projectResumeInfo = async (token: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/resume`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('배포안된 프로젝트 정보 개박살!! :', error);
        throw error;
    }
};

//배포 완료된 프로젝트 가져오기
export const projectDeployedInfo = async (token: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/deployed`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('배포된 프로젝트 정보 개박살!! :', error);
        throw error;
    }
};

//머메이드 코드 가져오기
export const mermaid = async (pid: number, token: string | null) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/${pid}/archiboard`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.code[0].mermaid;
    } catch (error) {
        console.error('머메이드 코드 개박살!! :', error);
        throw error;
    }
};

//summeray 가져오기
export const projectSummary = async (cid: number, token: string | null) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/${cid}/summary`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.code[0].mermaid;
    } catch (error) {
        console.error('summary 개박살!! :', error);
        throw error;
    }
};