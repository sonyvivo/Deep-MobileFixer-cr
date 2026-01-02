import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InvoiceAttributes {
    id: string; // INV-YYYY-XXXX
    date: Date;
    customerName: string;
    customerMobile: string;
    customerAddress?: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    deviceImei: string;
    deviceIssues: string;
    deviceAccessories: string;
    items: any[]; // JSON array of items
    subtotal: number;
    taxPercent: number;
    discount: number;
    totalAmount: number;
    paymentStatus: string;
    amountPaid: number;
    balanceDue: number;
    warrantyInfo: string;
    technicianNotes?: string;
}

interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'id'> { }

class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
    public id!: string;
    public date!: Date;
    public customerName!: string;
    public customerMobile!: string;
    public customerAddress?: string;
    public deviceType!: string;
    public deviceBrand!: string;
    public deviceModel!: string;
    public deviceImei!: string;
    public deviceIssues!: string;
    public deviceAccessories!: string;
    public items!: any[];
    public subtotal!: number;
    public taxPercent!: number;
    public discount!: number;
    public totalAmount!: number;
    public paymentStatus!: string;
    public amountPaid!: number;
    public balanceDue!: number;
    public warrantyInfo!: string;
    public technicianNotes?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Invoice.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customerMobile: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customerAddress: DataTypes.TEXT,
        deviceType: DataTypes.STRING,
        deviceBrand: DataTypes.STRING,
        deviceModel: DataTypes.STRING,
        deviceImei: DataTypes.STRING,
        deviceIssues: DataTypes.TEXT,
        deviceAccessories: DataTypes.TEXT,
        items: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        subtotal: DataTypes.DECIMAL(10, 2),
        taxPercent: DataTypes.DECIMAL(5, 2),
        discount: DataTypes.DECIMAL(10, 2),
        totalAmount: DataTypes.DECIMAL(10, 2),
        paymentStatus: DataTypes.STRING,
        amountPaid: DataTypes.DECIMAL(10, 2),
        balanceDue: DataTypes.DECIMAL(10, 2),
        warrantyInfo: DataTypes.STRING,
        technicianNotes: DataTypes.TEXT,
    },
    {
        sequelize,
        tableName: 'invoices',
    }
);

export default Invoice;
