import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL}/secrets`;

axios.defaults.withCredentials = true;

export const createSecret = async (accessKey: string, secretAccessKey: string, region: string, email: string) => {
    try {
        const response = await axios.post(`${API_URL}`,
            {
                accessKey,
                secretAccessKey,
                region,
                email
            });
        return response.data.message;
    } catch (error) {
        throw error;
    }
};

export const deleteSecret = async (email: string) => {
    try {
        const response = await axios.delete(`${API_URL}`,
            {
                data: {
                    email
                }
            }
        );
        return response.data.message;
    } catch (error) {
        throw error;
    }
};

export const checkSecret = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/check`,
            {
                email
            }
        );
        return response.data.exists;
    } catch (error) {
        throw error;
    }
};

export const getPublicKey = async (): Promise<string | null> => {
    try {
        const response = await axios.get(`${API_URL}/public-key`);
        let publicKey = response.data.publicKey;

        // 수정된 로그 출력
        console.log("서버에서 읽어온 공개 키:\n", publicKey);

        // 문자열 내의 '\\n'을 실제 줄 바꿈 문자 '\n'으로 변환
        publicKey = publicKey.replace(/\\n/g, '\n');

        return publicKey;
    } catch (error) {
        console.error("공개 키를 가져오는 중 오류 발생:", error);
        throw error;
    }
};