import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Customer from './customer';

interface SaleAttributes {
    id: string; // SALE-XXXX
    customerId?: number; // FK - now optional
    customer?: string; // Denormalized for display
    customerMobile?: string; // Denormalized for display
    date: Date;
    deviceBrand: string;
    deviceModel?: string;
    problem?: string;
    partName?: string;
    partNameOther?: string;
    unitPrice: number;
    purchaseCost?: number;
    profit?: number;
    totalAmount: number;
    notes?: string;
    paymentMode: string;
    pendingAmount?: number;
}

interface SaleCreationAttributes extends Optional<SaleAttributes, 'id'> { }

class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
    public id!: string;
    public customerId?: number;
    public customer?: string;
    public customerMobile?: string;
    public date!: Date;
    public deviceBrand!: string;
    public deviceModel?: string;
    public problem?: string;
    public partName?: string;
    public partNameOther?: string;
    public unitPrice!: number;
    public purchaseCost?: number;
    public profit?: number;
    public totalAmount!: number;
    public notes?: string;
    public paymentMode!: string;
    public pendingAmount?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Sale.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Made nullable
            references: {
                model: Customer,
                key: 'id',
            }
        },
        customer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        customerMobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        deviceBrand: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deviceModel: DataTypes.STRING,
        problem: DataTypes.STRING,
        partName: DataTypes.STRING,
        partNameOther: DataTypes.STRING,
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        purchaseCost: DataTypes.DECIMAL(10, 2),
        profit: DataTypes.DECIMAL(10, 2),
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        notes: DataTypes.TEXT,
        paymentMode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pendingAmount: DataTypes.DECIMAL(10, 2),
    },
    {
        sequelize,
        tableName: 'sales',
    }
);

export default Sale;

