import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL}/conversations`;

axios.defaults.withCredentials = true;

export const ask = async (msg: string, cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/ask`, {
            message: msg,
            CID: cid
        });
        return response.data.content[0].text;
    } catch (error) {
        throw error;
    }
};

export const open = async (cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/open`,
            { CID: cid },
        );
        return response.data
    } catch (error) {
        throw error;
    }
};

export const fetch = async (cid: number) => {
    try {
        const response = await axios.post(`${API_URL}/fetch`,
            { CID: cid },
        );
        const data = typeof response.data === 'string' ? JSON.parse(`[${response.data}]`) : response.data;
        const services = Array.isArray(data)
            ? data.map((item: { service: string }) => item.service)
            : [data.service];
    } catch (error) {
        throw error;
    }
};