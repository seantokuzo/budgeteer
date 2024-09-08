import { Request, Response } from 'express';
import { NotAuthorizedError } from '../../errors';

const errorLocation = 'controllers/auth/delete-account.ts';

export const deleteAccount = async (req: Request, res: Response) => {
  if (!req.currentUser) throw new NotAuthorizedError(errorLocation);

  res.status(200).send({ message: 'Account deleted' });
};
