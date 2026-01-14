import { config } from '../config/env';

export interface Subject {
    id: string;
    code: string;
    label: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}

export const subjectsApi = {
    getAll: async () => {
        const response = await fetch(`${config.apiUrl}/subjects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la récupération des matières');
        }

        return response.json() as Promise<{ subjects: Subject[] }>;
    },
};
