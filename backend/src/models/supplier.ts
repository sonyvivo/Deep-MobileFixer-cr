import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SupplierAttributes {
    id: number;
    name: string;
    contactInfo?: string;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id'> { }

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
    public id!: number;
    public name!: string;
    public contactInfo?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Supplier.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        contactInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'suppliers',
    }
);

export default Supplier;
