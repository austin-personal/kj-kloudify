import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/conversations`;

export const ask = async (msg: string, cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/ask`, {
            message: msg,
            CID: cid
        });
        console.log("뭐라고 왔냐", response);
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

//서비스 키워드 가져오는 api
export const fetch = async (cid: number, token: string | null) => {
    try {
        const response = await axios.post(`${API_URL}/fetch`,
            { CID: cid },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
          
        // response.data가 JSON 문자열이라면 파싱 필요
        const data = typeof response.data === 'string' ? JSON.parse(`[${response.data}]`) : response.data;

        // 각 항목의 service 필드만 배열로 추출
        const services = Array.isArray(data) ? data.map((item: { service: string }) => item.service) : [];

        return services;
    } catch (error) {
        console.error('대화 실패!! : ', error);
        throw error;
    }
};