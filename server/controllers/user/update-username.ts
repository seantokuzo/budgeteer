import { Request, Response } from 'express';
import { BadRequestError } from '../../errors';

const errorLocation = '/controllers/user/update-username.ts';

export const updateUsername = async (req: Request, res: Response) => {
  const { newUsername } = req.body;

  if (!newUsername) {
    throw new BadRequestError('Invalid username', errorLocation);
  }

  res.send({ message: 'Username changed' });
};
