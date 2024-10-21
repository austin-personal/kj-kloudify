import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://your-backend-api-url.com/api/auth';

export const signup = async (username: string, email: string, password: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/signup`, {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error('회원가입 개박살!! : ', error);
        throw error;
    }
};

export const login = async (email: string, password: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        return response.data.token;
    } catch (error) {
        console.error('로그인 개박살!! :', error);
        throw error;
    }
};