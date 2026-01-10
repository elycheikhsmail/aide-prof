import { Hono } from 'hono';
import auth from './auth.routes.js';
import users from './users.routes.js';
import classes from './classes.routes.js';
import evaluations from './evaluations.routes.js';
import students from './students.routes.js';

const api = new Hono();

// Mount routes
api.route('/auth', auth);
api.route('/users', users);
api.route('/classes', classes);
api.route('/evaluations', evaluations);
api.route('/students', students);

export default api;
