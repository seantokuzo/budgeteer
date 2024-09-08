import { Request, Response } from 'express';
import { NotAuthorizedError } from '../../errors';
import pgPool from '../../db/pgPool';

const errorLocation = 'controllers/auth/delete-account.ts';

export const deleteAccount = async (req: Request, res: Response) => {
  if (!req.currentUser) throw new NotAuthorizedError(errorLocation);

  const deleteQuery = `
    DELETE FROM users WHERE id=$1
    `;
  const deleteParams = [req.currentUser];
  await pgPool.query(deleteQuery, deleteParams);

  res.status(200).send({ message: 'Account deleted' });
};
