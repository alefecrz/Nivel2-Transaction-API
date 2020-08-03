import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface IBalance {
  income: number;
  outcome: number;
  total: number;
}

interface IData {
  balance : IBalance;
  transactions: Transaction[];
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private sumValuesByType(listTransations: Transaction[], type: string): number {
    const value = listTransations
      .filter(transaction => transaction.type === type)
      .reduce((accumlator: number, current: Transaction) => {
        return accumlator + Number(current.value);
      }, 0);

    return value;
  }
  public async getBalance(): Promise<IData> {

    const transactions = await this
    .createQueryBuilder('transactions')
    .leftJoinAndSelect('transactions.categories', 'categories')
    .getMany();

    const income = this.sumValuesByType(transactions, 'income');
    const outcome = this.sumValuesByType(transactions, 'outcome');

    const balance = { outcome, income, total: income - outcome };

    return { transactions, balance };
  }

}

export default TransactionsRepository;
