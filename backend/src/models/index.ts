import Supplier from './supplier';
import Customer from './customer';
import Purchase from './purchase';
import Sale from './sale';
import Expense from './expense';
import JobSheet from './job-sheet';
import Invoice from './invoice';
import sequelize from '../config/database';

// Define Associations
Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId' });

Customer.hasMany(Sale, { foreignKey: 'customerId' });
Sale.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(JobSheet, { foreignKey: 'customerId' });
JobSheet.belongsTo(Customer, { foreignKey: 'customerId' });

const db = {
    sequelize,
    Supplier,
    Customer,
    Purchase,
    Sale,
    Expense,
    JobSheet,
    Invoice,
};

export default db;
export { Supplier, Customer, Purchase, Sale, Expense, JobSheet, Invoice };
