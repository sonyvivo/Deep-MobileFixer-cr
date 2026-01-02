import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ExpenseAttributes {
    id: string; // EXP-XXXX
    date: Date;
    category: string;
    description: string;
    vendor?: string;
    amount: number;
    paymentMode: string;
    receipt?: string;
    receiptNumber?: string;
    notes?: string;
}

interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'id'> { }

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
    public id!: string;
    public date!: Date;
    public category!: string;
    public description!: string;
    public vendor?: string;
    public amount!: number;
    public paymentMode!: string;
    public receipt?: string;
    public receiptNumber?: string;
    public notes?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Expense.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vendor: DataTypes.STRING,
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        paymentMode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        receipt: DataTypes.STRING,
        receiptNumber: DataTypes.STRING,
        notes: DataTypes.TEXT,
    },
    {
        sequelize,
        tableName: 'expenses',
    }
);

export default Expense;
