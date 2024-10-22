import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = 'http://localhost:3000/conversations';

export const ask= async (msg:string) => {
    try {
        const response = await axios.post(`${API_URL}/ask`, {
            message :msg
        });
        return response.data.response.content[0].text;
    } catch (error) {
        console.error('응답실패!! : ', error);
        throw error;
    }
};
