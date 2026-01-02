import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Customer from './customer';

interface JobSheetAttributes {
    id: string; // DM-1001
    date: Date; // ISO
    status: string;
    customerId: number; // FK
    customerName: string; // Denormalized for display
    customerMobile: string; // Denormalized for display
    customerAddress?: string; // Denormalized for display
    deviceBrand: string;
    deviceModel: string;
    imei: string;
    color?: string;
    lockType?: string;
    lockCode?: string;
    faultCategory: string[]; // Array of strings
    customerRemark?: string;
    technicianNote?: string;
    physicalCondition: any; // JSON
    estimatedCost: number;
    advancePayment: number;
    pendingAmount: number;
}

interface JobSheetCreationAttributes extends Optional<JobSheetAttributes, 'id'> { }

class JobSheet extends Model<JobSheetAttributes, JobSheetCreationAttributes> implements JobSheetAttributes {
    public id!: string;
    public date!: Date;
    public status!: string;
    public customerId!: number;
    public customerName!: string;
    public customerMobile!: string;
    public customerAddress?: string;
    public deviceBrand!: string;
    public deviceModel!: string;
    public imei!: string;
    public color?: string;
    public lockType?: string;
    public lockCode?: string;
    public faultCategory!: string[];
    public customerRemark?: string;
    public technicianNote?: string;
    public physicalCondition!: any;
    public estimatedCost!: number;
    public advancePayment!: number;
    public pendingAmount!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

JobSheet.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATE, // Keep full timestamp for JobSheets
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Pending',
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Customer,
                key: 'id',
            }
        },
        customerName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        customerMobile: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        customerAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deviceBrand: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deviceModel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imei: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: DataTypes.STRING,
        lockType: DataTypes.STRING,
        lockCode: DataTypes.STRING,
        faultCategory: {
            type: DataTypes.JSONB, // Store array as JSONB
            allowNull: false,
            defaultValue: [],
        },
        customerRemark: DataTypes.TEXT,
        technicianNote: DataTypes.TEXT,
        physicalCondition: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        estimatedCost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        advancePayment: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        pendingAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'job_sheets',
    }
);

export default JobSheet;
