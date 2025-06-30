import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Chain {
    id: number;
    name: string;
    content: any;
    is_favorite: boolean;
}

export interface ChainCreate {
    name: string;
    content: any;
    is_favorite?: boolean;
}


export const getAllChains = async (): Promise<Chain[]> => {
    const response = await apiClient.get('/chains/');
    return response.data;
};

export const createChain = async (chain: ChainCreate): Promise<Chain> => {
    const response = await apiClient.post('/chains/', chain);
    return response.data;
};

export const updateFavoriteStatus = async (id: number, is_favorite: boolean): Promise<Chain> => {
    const response = await apiClient.put(`/chains/${id}/favorite?is_favorite=${is_favorite}`);
    return response.data;
};

export const deleteChain = async (id: number): Promise<Chain> => {
    const response = await apiClient.delete(`/chains/${id}`);
    return response.data;
}; 