import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://your-backend-api-url.com/api/users';

export const signup = async (username: string, email: string, password: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/signup`, {
            username,
            password,
            email,
        });
        return response.data.token;
    } catch (error) {
        console.error('회원가입 개박살!! : ', error);
        throw error;
    }
};

export const login = async (username: string, password: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password,
        });
        return response.data.token;
    } catch (error) {
        console.error('로그인 개박살!! :', error);
        throw error;
    }
};

export const info = async (token: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/info`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('유저 패치 개박살!! :', error);
        throw error;
    }
};