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

export const destroy = async (cid: number, email: string) => {
    try {
        const response = await axios.post(`${API_URL}/destroy`, {
            CID: cid,
            email: email
        });
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

export const review = async (cid: number | 0, pid: number, email: string) => {
    try {
        const response = await axios.post(`${API_URL}/review`,
            {
                CID: cid,
                PID: pid,
                email: email
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deploy = async (cid: number, email: string) => {
    try {
        const response = await axios.post(`${API_URL}/deploy`,
            {
                CID: cid,
                email: email
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

export const state = async (cid: number | undefined, email: string, options: { signal?: AbortSignal } = {}) => {
    try {
        const response = await axios.post(`${API_URL}/state`,
            {
                CID: cid,
                email: email,
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