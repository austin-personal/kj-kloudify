import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL}/projects`;

axios.defaults.withCredentials = true;

export const create = async (projectName: string) => {
    try {
        const response = await axios.post(`${API_URL}`,
            { projectName }
        );
        return response.data.CID;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (PID: number) => {
    try {
        const response = await axios.delete(`${API_URL}`, {
            data: { PID }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const projectOneInfo = async (pid: number) => {
    try {
        const response = await axios.get(`${API_URL}/${pid}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const projectResumeInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}/resume`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const projectDeployedInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}/deployed`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const mermaid = async (pid: number) => {
    try {
        const response = await axios.get(`${API_URL}/${pid}/archiboard`);
        return response.data.code[0].mermaid;
    } catch (error) {
        throw error;
    }
};

export const projectSummary = async (cid: number) => {
    try {
        const response = await axios.get(`${API_URL}/${cid}/summary`);
        return response.data.summary;
    } catch (error) {
        throw error;
    }
};

export const projectPrice = async (cid: number) => {
    try {
        const response = await axios.get(`${API_URL}/${cid}/price`);
        return response.data;
    } catch (error) {
        throw error;
    }
};