import * as fs from 'fs';
import * as path from 'path';
import sequelize from '../config/database';
import Customer from '../models/customer';
import Supplier from '../models/supplier';
import Purchase from '../models/purchase';
import Sale from '../models/sale';
import Expense from '../models/expense';
import JobSheet from '../models/job-sheet';
import Invoice from '../models/invoice';

interface JsonBackup {
    purchases: any[];
    sales: any[];
    expenses: any[];
    customers: any[];
    jobSheets: any[];
    invoices: any[];
    suppliers: any[];
    appPin: any;
}

async function migrateData() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Read JSON file
        const jsonPath = path.join(__dirname, '../../DeepMobileBackup_2025-12-29.json');
        const jsonData: JsonBackup = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        console.log('\n📊 Data Summary:');
        console.log(`   Customers: ${jsonData.customers?.length || 0}`);
        console.log(`   Suppliers: ${jsonData.suppliers?.length || 0}`);
        console.log(`   Purchases: ${jsonData.purchases?.length || 0}`);
        console.log(`   Sales: ${jsonData.sales?.length || 0}`);
        console.log(`   Expenses: ${jsonData.expenses?.length || 0}`);
        console.log(`   JobSheets: ${jsonData.jobSheets?.length || 0}`);
        console.log(`   Invoices: ${jsonData.invoices?.length || 0}`);

        // Clear existing data (optional - be careful in production)
        console.log('\n🗑️  Clearing existing data...');
        await Invoice.destroy({ where: {} });
        await JobSheet.destroy({ where: {} });
        await Sale.destroy({ where: {} });
        await Purchase.destroy({ where: {} });
        await Expense.destroy({ where: {} });
        await Customer.destroy({ where: {} });
        await Supplier.destroy({ where: {} });
        console.log('   Done.');

        // Reset sequences for auto-increment
        await sequelize.query('ALTER SEQUENCE customers_id_seq RESTART WITH 1;');
        await sequelize.query('ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;');

        // Map to track old customer ID -> new customer ID
        const customerMap = new Map<string, number>();

        // 1. Migrate Customers
        console.log('\n👥 Migrating Customers...');
        if (jsonData.customers && jsonData.customers.length > 0) {
            for (const c of jsonData.customers) {
                const newCustomer = await Customer.create({
                    name: c.name || 'Unknown',
                    mobile: c.mobile || '',
                    address: c.address || '',
                    notes: c.notes || ''
                });
                customerMap.set(c.id, newCustomer.id);
                customerMap.set(c.name.toLowerCase() + ':' + (c.mobile || ''), newCustomer.id);
            }
            console.log(`   ✅ Migrated ${jsonData.customers.length} customers.`);
        }

        // 2. Migrate Suppliers (from JSON - empty in this case)
        console.log('\n🏭 Migrating Suppliers...');
        if (jsonData.suppliers && jsonData.suppliers.length > 0) {
            for (const s of jsonData.suppliers) {
                await Supplier.create({
                    name: s.name || 'Unknown',
                    contactInfo: s.contactInfo || s.contact || ''
                });
            }
            console.log(`   ✅ Migrated ${jsonData.suppliers.length} suppliers.`);
        } else {
            // Extract unique suppliers from purchases
            const supplierNames = new Set<string>();
            jsonData.purchases?.forEach((p: any) => {
                if (p.supplier) supplierNames.add(p.supplier);
            });
            for (const name of supplierNames) {
                await Supplier.create({ name, contactInfo: '' });
            }
            console.log(`   ✅ Created ${supplierNames.size} suppliers from purchases.`);
        }

        // Get supplier map
        const allSuppliers = await Supplier.findAll();
        const supplierMap = new Map<string, number>();
        allSuppliers.forEach(s => supplierMap.set(s.name.toLowerCase(), s.id));

        // 3. Migrate Purchases
        console.log('\n📦 Migrating Purchases...');
        if (jsonData.purchases && jsonData.purchases.length > 0) {
            for (const p of jsonData.purchases) {
                const supplierId = supplierMap.get((p.supplier || '').toLowerCase()) || undefined;
                await Purchase.create({
                    id: p.id,
                    supplierId: supplierId,
                    date: new Date(p.date),
                    deviceBrand: p.deviceBrand || '',
                    deviceModel: p.deviceModel || '',
                    partName: p.partName || '',
                    partNameOther: p.partNameOther || '',
                    unitPrice: p.unitPrice || 0,
                    totalAmount: p.totalAmount || 0,
                    notes: p.notes || ''
                });
            }
            console.log(`   ✅ Migrated ${jsonData.purchases.length} purchases.`);
        }

        // 4. Migrate Expenses
        console.log('\n💸 Migrating Expenses...');
        if (jsonData.expenses && jsonData.expenses.length > 0) {
            for (const e of jsonData.expenses) {
                await Expense.create({
                    id: e.id,
                    date: new Date(e.date),
                    category: e.category || 'Other',
                    description: e.description || '',
                    vendor: e.vendor || '',
                    amount: e.amount || 0,
                    paymentMode: e.paymentMode || 'Cash',
                    receipt: e.receipt || 'No',
                    receiptNumber: e.receiptNumber || '',
                    notes: e.notes || ''
                });
            }
            console.log(`   ✅ Migrated ${jsonData.expenses.length} expenses.`);
        }

        // 5. Migrate Sales
        console.log('\n💰 Migrating Sales...');
        if (jsonData.sales && jsonData.sales.length > 0) {
            let salesMigrated = 0;
            let salesSkipped = 0;
            for (const s of jsonData.sales) {
                // Find or create customer based on name and mobile
                let customerId = customerMap.get((s.customer || 'NA').toLowerCase() + ':' + (s.customerMobile || ''));

                if (!customerId) {
                    // Create new customer
                    const newCustomer = await Customer.create({
                        name: s.customer || 'NA',
                        mobile: s.customerMobile || '',
                        address: '',
                        notes: 'Auto-created from Sales migration'
                    });
                    customerId = newCustomer.id;
                    customerMap.set((s.customer || 'NA').toLowerCase() + ':' + (s.customerMobile || ''), customerId);
                }

                try {
                    await Sale.create({
                        id: s.id,
                        customerId: customerId,
                        date: new Date(s.date),
                        deviceBrand: s.deviceBrand || '',
                        deviceModel: s.deviceModel || '',
                        problem: s.problem || '',
                        partName: s.partName || '',
                        partNameOther: s.partNameOther || s.partDescription || '',
                        unitPrice: s.unitPrice || 0,
                        purchaseCost: s.purchaseCost || s.purchasePrice || 0,
                        profit: s.profit || 0,
                        totalAmount: s.totalAmount || 0,
                        notes: s.notes || '',
                        paymentMode: s.paymentMode || 'Cash',
                        pendingAmount: s.pendingAmount || 0
                    });
                    salesMigrated++;
                } catch (err: any) {
                    console.log(`   ⚠️  Skipped sale ${s.id}: ${err.message}`);
                    salesSkipped++;
                }
            }
            console.log(`   ✅ Migrated ${salesMigrated} sales, skipped ${salesSkipped}.`);
        }

        // 6. Migrate Job Sheets
        console.log('\n📋 Migrating Job Sheets...');
        if (jsonData.jobSheets && jsonData.jobSheets.length > 0) {
            for (const j of jsonData.jobSheets) {
                // Find or create customer
                let customerId = customerMap.get((j.customerName || 'NA').toLowerCase() + ':' + (j.customerMobile || ''));

                if (!customerId) {
                    const newCustomer = await Customer.create({
                        name: j.customerName || 'NA',
                        mobile: j.customerMobile || '',
                        address: j.customerAddress || '',
                        notes: 'Auto-created from JobSheet migration'
                    });
                    customerId = newCustomer.id;
                    customerMap.set((j.customerName || 'NA').toLowerCase() + ':' + (j.customerMobile || ''), customerId);
                }

                await JobSheet.create({
                    id: j.id,
                    date: new Date(j.date),
                    status: j.status || 'Pending',
                    customerId: customerId,
                    customerName: j.customerName || '',
                    customerMobile: j.customerMobile || '',
                    customerAddress: j.customerAddress || '',
                    deviceBrand: j.deviceBrand || '',
                    deviceModel: j.deviceModel || '',
                    imei: j.imei || '',
                    color: j.color || '',
                    lockType: j.lockType || '',
                    lockCode: j.lockCode || '',
                    faultCategory: Array.isArray(j.faultCategory) ? j.faultCategory : [],
                    customerRemark: j.customerRemark || '',
                    technicianNote: j.technicianNote || '',
                    physicalCondition: {
                        scratches: j.scratches || false,
                        dents: j.dents || false,
                        backGlassBroken: j.backGlassBroken || false
                    },
                    estimatedCost: j.estimatedCost || 0,
                    advancePayment: j.advancePayment || 0,
                    pendingAmount: j.pendingAmount || 0
                });
            }
            console.log(`   ✅ Migrated ${jsonData.jobSheets.length} job sheets.`);
        }

        // 7. Migrate Invoices
        console.log('\n📄 Migrating Invoices...');
        if (jsonData.invoices && jsonData.invoices.length > 0) {
            for (const inv of jsonData.invoices) {
                await Invoice.create({
                    id: inv.id,
                    date: new Date(inv.date),
                    customerName: inv.customerName || '',
                    customerMobile: inv.customerMobile || '',
                    customerAddress: inv.customerAddress || '',
                    deviceType: inv.deviceType || '',
                    deviceBrand: inv.deviceBrand || '',
                    deviceModel: inv.deviceModel || '',
                    deviceImei: inv.deviceImei || '',
                    deviceIssues: inv.deviceIssues || '',
                    deviceAccessories: inv.deviceAccessories || '',
                    items: Array.isArray(inv.items) ? inv.items : [],
                    subtotal: inv.subtotal || 0,
                    taxPercent: inv.taxPercent || 0,
                    discount: inv.discount || 0,
                    totalAmount: inv.totalAmount || 0,
                    paymentStatus: inv.paymentStatus || 'Pending',
                    amountPaid: inv.amountPaid || 0,
                    balanceDue: inv.balanceDue || 0,
                    warrantyInfo: inv.warrantyInfo || '',
                    technicianNotes: inv.technicianNotes || ''
                });
            }
            console.log(`   ✅ Migrated ${jsonData.invoices.length} invoices.`);
        }

        console.log('\n🎉 Migration completed successfully!');

        // Summary
        const customerCount = await Customer.count();
        const supplierCount = await Supplier.count();
        const purchaseCount = await Purchase.count();
        const saleCount = await Sale.count();
        const expenseCount = await Expense.count();
        const jobSheetCount = await JobSheet.count();
        const invoiceCount = await Invoice.count();

        console.log('\n📊 Final Database Counts:');
        console.log(`   Customers: ${customerCount}`);
        console.log(`   Suppliers: ${supplierCount}`);
        console.log(`   Purchases: ${purchaseCount}`);
        console.log(`   Sales: ${saleCount}`);
        console.log(`   Expenses: ${expenseCount}`);
        console.log(`   JobSheets: ${jobSheetCount}`);
        console.log(`   Invoices: ${invoiceCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
