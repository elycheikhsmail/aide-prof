import { config } from '../config/env';

export interface DashboardStats {
    totalEvaluations: number;
    activeClasses: number;
    copiesToCorrect: number;
    averageSuccessRate: number;
}

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    date: string;
}

export const dashboardApi = {
    getStats: async () => {
        const response = await fetch(`${config.apiUrl}/dashboard/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
        }

        return response.json() as Promise<DashboardStats>;
    },

    getNotifications: async () => {
        const response = await fetch(`${config.apiUrl}/dashboard/notifications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la récupération des notifications');
        }

        return response.json() as Promise<{ notifications: Notification[] }>;
    },
};
