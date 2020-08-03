import { getRepository, getCustomRepository } from 'typeorm';
import csv from 'csv-parse';
import fs from 'fs';
import path from 'path'

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Import {
  status: string;
  results: Array<Array<string>>;
}

interface IResponse {
  transactions: Array<Transaction>;
  categories: Array<Category>;
}

class ImportTransactionsService {
  private readFile(importCSV:string): Promise<Import> {
    return new Promise((resolve, reject) => {
      let readStream = fs.createReadStream(importCSV);
      let results:Array<Array<string>>  = [];
      const parser = csv();

      parser
      .on('data', (data) => { results.push(data) })
      .on('end', function () {

        resolve({ status: 'Successfully processed lines: ', results });
      });

      readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(parser);
      });
    });
  }
  async execute(documentName: string): Promise<IResponse> {
    const importCSV = path.resolve(__dirname, '..', '..', 'tmp' ,`${documentName}`);
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);


    const values = this.readFile(importCSV);
    const { status , results  } = await values.then( results => results )
    const transactions = [];
    const categories:Array<Category> = [];
    for (let cont = 1; cont < results.length ; cont++ ) {
      const objectCSV = {
        title: results[cont][0],
        type: results[cont][1].trim(),
        value: Number(results[cont][2]),
        category: results[cont][3].trim(),
      }
      const checkCategoryExists = await categoryRepository.findOne({
        where: {
          title: objectCSV.category
        }
      });

      const category = checkCategoryExists ?
        checkCategoryExists :
        await categoryRepository.create({ title: objectCSV.category  });

      if(!checkCategoryExists)
        await categoryRepository.save(category)

      const transaction = transactionRepository.create({
          title: objectCSV.title,
          category_id: category.id,
          type: objectCSV.type,
          value: objectCSV.value
        });

      await transactionRepository.save(transaction)

      if (categories.findIndex( currentCategory =>( currentCategory.id === category.id)))
        categories.push(category)


      transactions.push(transaction);
    }


    return { transactions, categories } ;
  }
}

export default ImportTransactionsService;
