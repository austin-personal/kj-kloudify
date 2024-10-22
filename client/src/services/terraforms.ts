import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://your-backend-api-url.com/api/terraforms';

export const create = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/create`, {});
        return response.data;
    } catch (error) {
        console.error('테라폼 생성 실패!! : ', error);
        throw error;
    }
};

export const destroy = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/destroy`, {});
        return response.data;
    } catch (error) {
        console.error('클라우드 중지 개박살!! :', error);
        throw error;
    }
};

export const show = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/show`, {});
        return response.data;
    } catch (error) {
        console.error('상태 보기 개박살!! :', error);
        throw error;
    }
};