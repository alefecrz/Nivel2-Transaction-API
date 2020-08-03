import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
const upload = multer(uploadConfig);

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  try {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { transactions, balance } = await transactionsRepository.getBalance();


    return response.json({transactions, balance });
  } catch (err) {
    return response.status(400).json({ status: 'error', message: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const createTrasaction = new CreateTransactionService();

    const transaction = await createTrasaction.execute({ title, category, type, value });

    return response.json(transaction);
  }catch(err){
    return response.status(400).json({ status: 'error', message: err.message });
  }


});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const deleteTransactionService = new DeleteTransactionService();

    await deleteTransactionService.execute(id);

    return response.json({ message: 'Transactions removed.'});
  }catch(err){
    return response.status(400).json({ status: 'error', message: err.message });
  }
});

transactionsRouter.post('/import', upload.single('docs'), async (request, response) => {
   const documentName = request.file.filename;

   const importTransactionService = new ImportTransactionsService();

   const transactions = await importTransactionService.execute(documentName);

   return response.json(transactions);
});

export default transactionsRouter;
