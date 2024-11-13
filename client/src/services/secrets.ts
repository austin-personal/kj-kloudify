import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/secrets`;

export const createSecret = async (accessKey: string, secretAccessKey: string, region: string, token: string) => {
    try {
        const response = await axios.post(`${API_URL}`,
            {
                accessKey,
                secretAccessKey,
                region
            },  // createProjectDto로 보내질 부분
            {
                headers: {
                    Authorization: `Bearer ${token}`  // JWT 토큰을 헤더에 포함
                }
            });
        return response.data.message;
    } catch (error) {
        throw error;
    }
};

export const deleteSecret = async (token: string) => {
    try {
        const response = await axios.delete(`${API_URL}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`  // JWT 토큰을 헤더에 포함
                }
            });
        return response.data.message;
    } catch (error) {
        throw error;
    }
};

export const checkSecret = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/check`,
            {
                headers: {
                    Authorization: `Bearer ${token}`  // JWT 토큰을 헤더에 포함
                }
            });
        return response.data.exists;
    } catch (error) {
        throw error;
    }
};