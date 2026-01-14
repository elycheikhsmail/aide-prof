import { Hono } from 'hono';
import { db } from '../config/database.js';
import { subjects } from '../db/schema/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { desc } from 'drizzle-orm';

const router = new Hono();

// Toutes les routes sont protégées
router.use('*', authMiddleware);

router.get('/', async (c) => {
    try {
        const allSubjects = await db.query.subjects.findMany({
            orderBy: [desc(subjects.label)],
        });

        return c.json({
            subjects: allSubjects,
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return c.json({ error: 'Erreur lors de la récupération des matières' }, 500);
    }
});

export default router;
