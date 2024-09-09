import { Request, Response } from 'express';
import { BadRequestError } from '../../errors';

const errorLocation = 'controllers/auth/-auth/signup.ts';

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Need credentials', errorLocation);
  }

  res.status(201).send({ message: "You're all signed up" });
};
