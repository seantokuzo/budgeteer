import { Request, Response } from 'express';
import { BadRequestError } from '../../errors';

const errorLocation = '/controllers/budget/upload-transactions.ts';

export const uploadTransactions = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No transactions uploaded', errorLocation);
  }

  res.send({ message: 'Transactions processed' });
};
