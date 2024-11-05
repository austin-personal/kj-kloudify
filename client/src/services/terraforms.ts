import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/terraforms`;

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

export const destroy = async (cid: number, token: string | null) => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/destroy`, {
            CID: cid,
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

export const review = async (cid: number | 0, pid: number, token: string | null) => {
    try {
        const response = await axios.post(`${API_URL}/review`,
            {
                CID: cid,
                PID: pid
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('리뷰 개박살!! :', error);
        throw error;
    }
}

export const deploy = async (cid: number, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/deploy`,
            {
                CID: cid
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('디플로이 개박살!! :', error);
        throw error;
    }
}

export const download = async (cid: number, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/download`,
            {
                CID: cid
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        return response.data;
    } catch (error) {
        console.error('다운로드 개박살!! ;', error)
        throw error;
    }
}

export const state = async (cid: number | undefined, token: string | null) => {
    try {
        const response = await axios.post(`${API_URL}/state`,
            {
                CID: cid
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        return response.data;
    } catch (error) {
        console.error('스테이트 개박살!! ;', error)
        throw error;
    }
}