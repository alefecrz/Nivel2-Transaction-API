import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface ITransaction {
  title: string;
  type: "outcome" | "income";
  value: number;
  category_id: string;
  id: string;
  created_at: Date;
  updated_at: Date;
  categories: Category;
}

class CreateTransactionService {
  private async createCategory(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const newCategory = categoryRepository.create({ title});
    await categoryRepository.save(newCategory);

    return newCategory;
  }

  public async execute({ title, value, type, category }: Request): Promise<ITransaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const checkCategoryExists = await categoryRepository.findOne({ where: { title: category }});

    const newCategory = checkCategoryExists ?
      checkCategoryExists :
      await this.createCategory(category);

    const transaction = transactionRepository.create({
      title,
      category_id: newCategory.id,
      type,
      value
    });

    const data = await transactionRepository.getBalance();

    if(type === 'outcome' && data.balance.total - value < 0){
      throw new AppError('Can not have negative sald',400);
    }

    await transactionRepository.save(transaction);

    transaction.categories = newCategory;

    return transaction;
  }
}

export default CreateTransactionService;
