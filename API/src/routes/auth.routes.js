import express from 'express';
import { health } from '../controllers/auth.controller.js';

export const authRouter = express.Router();

authRouter.get('/health',     health.verify);
authRouter.post('/registrar', health.registrar);
authRouter.post('/login',     health.login);
authRouter.get('/perfil',     health.perfil);