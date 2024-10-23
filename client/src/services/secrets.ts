import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://localhost:3000/secrets';

export const createSecret = async (accessKey: string, secretAccessKey: string, securityKey: string, token: string) => {
    try {
        const response = await axios.post(`${API_URL}`,  
            {  accessKey,
                secretAccessKey,
                securityKey },  // createProjectDto로 보내질 부분
            {
                headers: {
                    Authorization: `Bearer ${token}`  // JWT 토큰을 헤더에 포함
                }
            });
        return response.data.message;
    } catch (error) {
        console.error('키 전달 실패: ', error);
        throw error;
    }
};