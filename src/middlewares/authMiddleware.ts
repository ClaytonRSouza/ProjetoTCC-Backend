import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';

interface AuthenticatedRequest extends Request {
    uid?: string;
}

export const verificarToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.uid = decodedToken.uid;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
};
