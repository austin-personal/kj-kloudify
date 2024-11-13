import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/projects`;

axios.defaults.withCredentials = true;

export const create = async (projectName: string) => {
    try {
        const response = await axios.post(`${API_URL}`,
            { projectName },  // createProjectDto로 보내질 부분
        );
        return response.data.CID;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (PID: number) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.delete(`${API_URL}`, {
            data: { PID }, // PID를 body로 전달
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const projectOneInfo = async (pid: number) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/${pid}`);
        return response;
    } catch (error) {
        throw error;
    }
};

//배포되지 않은 프로젝트 가져오기
export const projectResumeInfo = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/resume`);
        return response;
    } catch (error) {
        throw error;
    }
};

//배포 완료된 프로젝트 가져오기
export const projectDeployedInfo = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/deployed`);
        return response;
    } catch (error) {
        throw error;
    }
};

//머메이드 코드 가져오기
export const mermaid = async (pid: number) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/${pid}/archiboard`);
        return response.data.code[0].mermaid;
    } catch (error) {
        throw error;
    }
};

//summeray 가져오기
export const projectSummary = async (cid: number) => {
    try {
        const response = await axios.get(`${API_URL}/${cid}/summary`);
        return response.data.summary;
    } catch (error) {
        throw error;
    }
};

//price 가져오기
export const projectPrice = async (cid: number) => {
    try {
        const response = await axios.get(`${API_URL}/${cid}/price`);
        return response.data;
    } catch (error) {
        throw error;
    }
};