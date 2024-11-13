import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/users`;

axios.defaults.withCredentials = true;

export const signup = async (username: string, email: string, password: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/signUp`, {
            username,
            password,
            email,
        },
            { withCredentials: false }
        );
        return response.data.achieved;
    } catch (error) {
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
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 로그인 페이지

export const info = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/info`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 프로필 페이지

export const checkEmail = async (email: string) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/check-email`, {
            email
        });
        return response.data.exists;
    } catch (error) {
        throw error;
    }
};

export const checkauth = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.get(`${API_URL}/check-auth`);
        return response.data.isAuthenticated;
    } catch (error) {
        throw error;
    }
};