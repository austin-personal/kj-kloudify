import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `http://server:3000/`;

export const signup = async (username: string, email: string, password: string) => {
    try {
        console.log("API_URL:", API_URL);
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/signUp`, {
            username,
            password,
            email,
        });
        return response.data.access_token;
    } catch (error) {
        console.error('회원가입 개박살!! : ', error);
        throw error;
    }
};
// 회원가입 페이지

export const login = async (email: string, password: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        return response.data.access_token;
    } catch (error) {
        console.error('로그인 개박살!! :', error);
        throw error;
    }
};
// 로그인 페이지

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
// 프로필 페이지