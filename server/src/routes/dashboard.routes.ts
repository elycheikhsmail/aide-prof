import { Hono } from 'hono';
import { db } from '../config/database.js';
import { evaluations, classes } from '../db/schema/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { count, eq, and } from 'drizzle-orm';

const router = new Hono();

// Toutes les routes sont protégées
router.use('*', authMiddleware);

router.get('/stats', async (c) => {
    try {
        const user = c.get('user');
        const userId = user.id;

        // Total evaluations
        const [evaluationsCount] = await db
            .select({ count: count() })
            .from(evaluations)
            .where(eq(evaluations.professorId, userId));

        // Active classes
        const [classesCount] = await db
            .select({ count: count() })
            .from(classes)
            .where(eq(classes.professorId, userId));

        // Copies to correct
        const [correctionCount] = await db
            .select({ count: count() })
            .from(evaluations)
            .where(
                and(
                    eq(evaluations.professorId, userId),
                    eq(evaluations.status, 'correcting')
                )
            );

        const averageSuccessRate = 72.5;

        return c.json({
            totalEvaluations: evaluationsCount?.count ?? 0,
            activeClasses: classesCount?.count ?? 0,
            copiesToCorrect: correctionCount?.count ?? 0,
            averageSuccessRate: averageSuccessRate,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500);
    }
});

router.get('/notifications', async (c) => {
    try {
        const notifications = [
            {
                id: 'notif-1',
                type: 'info',
                message: 'Bienvenue sur votre tableau de bord',
                date: new Date().toISOString(),
            },
        ];
        return c.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return c.json({ error: 'Erreur lors de la récupération des notifications' }, 500);
    }
});

export default router;
