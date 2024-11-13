import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/secrets`;

axios.defaults.withCredentials = true;

export const createSecret = async (accessKey: string, secretAccessKey: string, region: string) => {
    try {
        const response = await axios.post(`${API_URL}`,
            {
                accessKey,
                secretAccessKey,
                region
            });
        return response.data.message;
    } catch (error) {
        throw error;
    }
};

export const deleteSecret = async () => {
    try {
        const response = await axios.delete(`${API_URL}`);
        return response.data.message;
    } catch (error) {
        throw error;
    }
};

export const checkSecret = async () => {
    try {
        const response = await axios.get(`${API_URL}/check`);
        return response.data.exists;
    } catch (error) {
        throw error;
    }
};

export const getPublicKey = async (): Promise<string | null> => {
    try {
        const response = await axios.get(`${API_URL}/public-key`)
        return response.data.publicKey;
    } catch (error) {
        throw error;
    }
}