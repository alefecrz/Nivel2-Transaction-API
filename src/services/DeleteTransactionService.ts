import { getRepository, getCustomRepository, Transaction } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = await getCustomRepository(TransactionRepository);

    const transaction = await transactionRepository.findOne({ where : { id }});

    if(!transaction)
      throw new AppError('Transaction does not exists',400);

    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
