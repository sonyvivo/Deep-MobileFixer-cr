import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CustomerAttributes {
    id: number;
    name: string;
    mobile?: string;
    address?: string; // TEXT
    notes?: string;   // TEXT
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id'> { }

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
    public id!: number;
    public name!: string;
    public mobile?: string;
    public address?: string;
    public notes?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Customer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'customers',
    }
);

export default Customer;
