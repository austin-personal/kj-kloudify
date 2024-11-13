import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL}/projects`;

axios.defaults.withCredentials = true;

export const create = async (projectName: string, email: string) => {
    try {
        const response = await axios.post(`${API_URL}`,
            { 
                projectName,
                email
            }
        );
        return response.data.CID;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (PID: number, email: string) => {
    try {
        const response = await axios.delete(`${API_URL}`, {
            data: {
                PID,
                email
            }
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

export const projectResumeInfo = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/resume`,
            {
                email: email
            }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const projectDeployedInfo = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/deployed`, 
            {
                email: email
            }
        );
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