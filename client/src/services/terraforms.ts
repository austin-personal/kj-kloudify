import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL}/terraforms`;

axios.defaults.withCredentials = true;

export const create = async () => {
    try {
        const response = await axios.post(`${API_URL}/create`, {});
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const destroy = async (cid: number) => {
    try {
        console.log("destroy 호출중...")
        const response = await axios.post(`${API_URL}/destroy`, {
            CID: cid,
        });
        console.log("destroy 호출 성공!!", response.data)
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const show = async () => {
    try {
        const response = await axios.post(`${API_URL}/show`, {});
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const review = async (cid: number | 0, pid: number) => {
    try {
        const response = await axios.post(`${API_URL}/review`,
            {
                CID: cid,
                PID: pid
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deploy = async (cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/deploy`,
            {
                CID: cid
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const download = async (cid: number | undefined) => {
    try {
        const response = await axios.post(`${API_URL}/download`,
            {
                CID: cid
            })
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const state = async (cid: number | undefined, options: { signal?: AbortSignal } = {}) => {
    try {
        const response = await axios.post(`${API_URL}/state`,
            {
                CID: cid
            },
            {
                signal: options.signal,
            })
        return response.data.serviceStates;
    } catch (error) {
        throw error;
    }
}


export const terraInfo = async (cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/terraInfo`,
            {
                CID: cid
            })
        return response.data;
    } catch (error) {
        throw error;
    }
}