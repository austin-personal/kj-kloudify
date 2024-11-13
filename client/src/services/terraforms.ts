import axios from 'axios';

// 태현 api 주소 확인!!!
const API_URL = `${process.env.REACT_APP_SERVER_URL}/terraforms`;

export const create = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/create`, {});
        return response.data;
    } catch (error) {
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
        throw error;
    }
};

export const show = async () => {
    try {
        // 태현 api 주소 확인!!!
        const response = await axios.post(`${API_URL}/show`, {});
        return response.data;
    } catch (error) {
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
        throw error;
    }
}

export const download = async (cid: number | undefined, token: string | null) => {
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
        throw error;
    }
}

export const state = async (cid: number | undefined, token: string | null, options: { signal?: AbortSignal } = {}) => {
    try {
        const response = await axios.post(`${API_URL}/state`,
            {
                CID: cid
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                signal: options.signal,
            })
        return response.data.serviceStates;
    } catch (error) {
        throw error;
    }
}


export const terraInfo = async (cid: number, token: string | null) => {
    try {
        const response = await axios.post(`${API_URL}/terraInfo`,
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
        throw error;
    }
}