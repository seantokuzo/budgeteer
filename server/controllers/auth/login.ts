import { Request, Response } from 'express';
import { BadRequestError } from '../../errors';

const errorLocation = 'controllers/auth/login.ts';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Need credentials', errorLocation);
  }

  res.status(200).send('Logged in');
};
