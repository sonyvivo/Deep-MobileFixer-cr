import { Router } from 'express';
import { GenericController } from '../controllers/generic.controller';
import {
    Supplier,
    Customer,
    Purchase,
    Sale,
    Expense,
    JobSheet,
    Invoice
} from '../models';

const router = Router();

const models = [
    { model: Supplier, path: 'suppliers' },
    { model: Customer, path: 'customers' },
    { model: Purchase, path: 'purchases' },
    { model: Sale, path: 'sales' },
    { model: Expense, path: 'expenses' },
    { model: JobSheet, path: 'job-sheets' },
    { model: Invoice, path: 'invoices' },
];

models.forEach(({ model, path }) => {
    const controller = new GenericController(model as any);
    const resourceRouter = Router();

    resourceRouter.get('/', controller.getAll);
    resourceRouter.get('/:id', controller.getOne);
    resourceRouter.post('/', controller.create);
    resourceRouter.put('/:id', controller.update); // Full update
    resourceRouter.patch('/:id', controller.update); // Partial update (Sequelize update handles both mostly)
    resourceRouter.delete('/:id', controller.delete);

    router.use(`/${path}`, resourceRouter);
});

export default router;
