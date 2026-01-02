import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Supplier from './supplier';

interface PurchaseAttributes {
    id: string; // Using string to match frontend 'PUR-XXXX' logic if desired, or auto-increment.
    // Plan said PK. Frontend generates 'PUR-1001'. Let's stick to String to keep compatibility or use Serial.
    // To be safe and "production-like", usually we use Integer/UUID.
    // But to migrate data easily, String PK is better if we want to keep specific IDs.
    // Let's use STRING for compatibility with existing frontend logic.
    supplierId?: number; // FK
    date: Date;
    deviceBrand: string;
    deviceModel?: string;
    partName: string;
    partNameOther?: string;
    unitPrice: number; // DECIMAL
    totalAmount: number; // DECIMAL
    notes?: string;
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'supplierId'> { }

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
    public id!: string;
    public supplierId?: number;
    public date!: Date;
    public deviceBrand!: string;
    public deviceModel?: string;
    public partName!: string;
    public partNameOther?: string;
    public unitPrice!: number;
    public totalAmount!: number;
    public notes?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Purchase.init(
    {
        id: {
            type: DataTypes.STRING, // PUR-1001
            primaryKey: true,
        },
        supplierId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Supplier,
                key: 'id',
            }
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
        partName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        partNameOther: DataTypes.STRING,
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        notes: DataTypes.TEXT,
    },
    {
        sequelize,
        tableName: 'purchases',
    }
);

export default Purchase;
