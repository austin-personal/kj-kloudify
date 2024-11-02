import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/conversations`;

export const ask = async (msg: string, cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/ask`, {
            message: msg,
            CID: cid
        });
        console.log(msg);
        return response.data.content[0].text;
    } catch (error) {
        console.error('응답실패!! : ', error);
        throw error;
    }
};

export const open = async (cid: number, token: string | null) => {
    try {
        const response = await axios.post(`${API_URL}/open`,
            { CID: cid },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        return response.data
    } catch (error) {
        console.error('대화 실패!! : ', error);
        throw error;
    }
};