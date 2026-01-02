import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Purchase, Sale, Expense, Customer, JobSheet, Invoice } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // LocalStorage Keys
  private readonly KEYS = {
    purchases: 'purchases',
    sales: 'sales',
    expenses: 'expenses',
    customers: 'customers',
    jobSheets: 'jobSheets',
    invoices: 'invoices',
    suppliers: 'suppliers'
  };

  private purchasesSubject = new BehaviorSubject<Purchase[]>([]);
  private salesSubject = new BehaviorSubject<Sale[]>([]);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private jobSheetsSubject = new BehaviorSubject<JobSheet[]>([]);
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  private suppliersSubject = new BehaviorSubject<string[]>([]);

  purchases$ = this.purchasesSubject.asObservable();
  sales$ = this.salesSubject.asObservable();
  expenses$ = this.expensesSubject.asObservable();
  customers$ = this.customersSubject.asObservable();
  jobSheets$ = this.jobSheetsSubject.asObservable();
  invoices$ = this.invoicesSubject.asObservable();
  suppliers$ = this.suppliersSubject.asObservable();

  private backupDebounceTimer: any = null;

  constructor(private injector: Injector) {
    this.loadAllData();
  }

  private loadAllData() {
    // Load all data from localStorage
    this.suppliersSubject.next(this.getFromStorage<string[]>(this.KEYS.suppliers) || []);
    this.customersSubject.next(this.getFromStorage<Customer[]>(this.KEYS.customers) || []);

    // Sort all data by date descending (newest first)
    const purchases = this.getFromStorage<Purchase[]>(this.KEYS.purchases) || [];
    this.purchasesSubject.next(purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const sales = this.getFromStorage<Sale[]>(this.KEYS.sales) || [];
    this.salesSubject.next(sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const expenses = this.getFromStorage<Expense[]>(this.KEYS.expenses) || [];
    this.expensesSubject.next(expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const jobSheets = this.getFromStorage<JobSheet[]>(this.KEYS.jobSheets) || [];
    this.jobSheetsSubject.next(jobSheets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const invoices = this.getFromStorage<Invoice[]>(this.KEYS.invoices) || [];
    this.invoicesSubject.next(invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  // --- Storage Helpers ---
  private getFromStorage<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private saveToStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Suppliers ---
  getSuppliersValue() { return this.suppliersSubject.value; }

  addSupplier(name: string) {
    const current = this.suppliersSubject.value;
    if (!current.includes(name)) {
      const updated = [...current, name].sort();
      this.saveToStorage(this.KEYS.suppliers, updated);
      this.suppliersSubject.next(updated);
      this.triggerAutoBackup();
    }
  }

  deleteSupplier(name: string) {
    const filtered = this.suppliersSubject.value.filter(s => s !== name);
    this.saveToStorage(this.KEYS.suppliers, filtered);
    this.suppliersSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Purchases ---
  getPurchasesValue() { return this.purchasesSubject.value; }

  addPurchase(p: Purchase) {
    p.id = p.id || this.generateId('PUR', this.purchasesSubject.value);
    const current = this.purchasesSubject.value;
    const updated = [p, ...current]; // Add new entry at beginning
    this.saveToStorage(this.KEYS.purchases, updated);
    this.purchasesSubject.next(updated);
    this.triggerAutoBackup();
  }

  updatePurchase(p: Purchase) {
    const current = this.purchasesSubject.value;
    const index = current.findIndex(x => x.id === p.id);
    if (index !== -1) {
      current[index] = p;
      this.saveToStorage(this.KEYS.purchases, [...current]);
      this.purchasesSubject.next([...current]);
      this.triggerAutoBackup();
    }
  }

  deletePurchase(id: string) {
    const filtered = this.purchasesSubject.value.filter(x => x.id !== id);
    this.saveToStorage(this.KEYS.purchases, filtered);
    this.purchasesSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Sales ---
  getSalesValue() { return this.salesSubject.value; }

  addSale(s: Sale) {
    s.id = s.id || this.generateId('SAL', this.salesSubject.value);

    // Auto-create customer if not exists
    const customers = this.customersSubject.value;
    const existingCustomer = customers.find(c =>
      c.name.toLowerCase() === (s.customer || '').toLowerCase() &&
      c.mobile === (s.customerMobile || '')
    );

    if (!existingCustomer && s.customer) {
      this.addCustomer({
        id: '',
        name: s.customer,
        mobile: s.customerMobile || '',
        notes: 'Auto-created from Sale'
      });
    }

    const current = this.salesSubject.value;
    const updated = [s, ...current]; // Add new entry at beginning
    this.saveToStorage(this.KEYS.sales, updated);
    this.salesSubject.next(updated);
    this.triggerAutoBackup();
  }

  updateSale(s: Sale) {
    const current = this.salesSubject.value;
    const index = current.findIndex(x => x.id === s.id);
    if (index !== -1) {
      current[index] = s;
      this.saveToStorage(this.KEYS.sales, [...current]);
      this.salesSubject.next([...current]);
      this.triggerAutoBackup();
    }
  }

  deleteSale(id: string) {
    const filtered = this.salesSubject.value.filter(x => x.id !== id);
    this.saveToStorage(this.KEYS.sales, filtered);
    this.salesSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Expenses ---
  getExpensesValue() { return this.expensesSubject.value; }

  addExpense(e: Expense) {
    e.id = e.id || this.generateId('EXP', this.expensesSubject.value);
    const current = this.expensesSubject.value;
    const updated = [e, ...current]; // Add new entry at beginning
    this.saveToStorage(this.KEYS.expenses, updated);
    this.expensesSubject.next(updated);
    this.triggerAutoBackup();
  }

  updateExpense(e: Expense) {
    const current = this.expensesSubject.value;
    const index = current.findIndex(x => x.id === e.id);
    if (index !== -1) {
      current[index] = e;
      this.saveToStorage(this.KEYS.expenses, [...current]);
      this.expensesSubject.next([...current]);
      this.triggerAutoBackup();
    }
  }

  deleteExpense(id: string) {
    const filtered = this.expensesSubject.value.filter(x => x.id !== id);
    this.saveToStorage(this.KEYS.expenses, filtered);
    this.expensesSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Customers ---
  getCustomersValue() { return this.customersSubject.value; }

  addCustomer(c: Customer) {
    c.id = c.id || this.generateId('CUST', this.customersSubject.value);
    const current = this.customersSubject.value;
    const updated = [...current, c];
    this.saveToStorage(this.KEYS.customers, updated);
    this.customersSubject.next(updated);
    this.triggerAutoBackup();
  }

  updateCustomer(c: Customer) {
    const current = this.customersSubject.value;
    const index = current.findIndex(x => x.id === c.id);
    if (index !== -1) {
      current[index] = c;
      this.saveToStorage(this.KEYS.customers, [...current]);
      this.customersSubject.next([...current]);
      this.triggerAutoBackup();
    }
  }

  deleteCustomer(id: string) {
    const filtered = this.customersSubject.value.filter(x => x.id !== id);
    this.saveToStorage(this.KEYS.customers, filtered);
    this.customersSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Job Sheets ---
  getJobSheetsValue() { return this.jobSheetsSubject.value; }

  addJobSheet(j: JobSheet) {
    j.id = j.id || this.generateJobId(this.jobSheetsSubject.value);
    j.createdAt = new Date().toISOString();
    j.updatedAt = new Date().toISOString();

    // Auto-create customer if not exists
    const customers = this.customersSubject.value;
    const existingCustomer = customers.find(c =>
      c.name.toLowerCase() === j.customerName.toLowerCase() &&
      c.mobile === j.customerMobile
    );

    if (!existingCustomer) {
      this.addCustomer({
        id: '',
        name: j.customerName,
        mobile: j.customerMobile,
        address: j.customerAddress || '',
        notes: 'Auto-created from Job Sheet'
      });
    }

    const current = this.jobSheetsSubject.value;
    const updated = [j, ...current]; // Add at beginning (newest first)
    this.saveToStorage(this.KEYS.jobSheets, updated);
    this.jobSheetsSubject.next(updated);
    this.triggerAutoBackup();
  }

  updateJobSheet(j: JobSheet) {
    j.updatedAt = new Date().toISOString();
    const current = this.jobSheetsSubject.value;
    const index = current.findIndex(x => x.id === j.id);
    if (index !== -1) {
      current[index] = j;
      this.saveToStorage(this.KEYS.jobSheets, [...current]);
      this.jobSheetsSubject.next([...current]);
      this.triggerAutoBackup();
    }
  }

  deleteJobSheet(id: string) {
    const filtered = this.jobSheetsSubject.value.filter(x => x.id !== id);
    this.saveToStorage(this.KEYS.jobSheets, filtered);
    this.jobSheetsSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Invoices ---
  getInvoicesValue() { return this.invoicesSubject.value; }

  addInvoice(inv: Invoice) {
    const current = this.invoicesSubject.value;
    const updated = [inv, ...current]; // Add at beginning (newest first)
    this.saveToStorage(this.KEYS.invoices, updated);
    this.invoicesSubject.next(updated);
    this.triggerAutoBackup();
  }

  updateInvoice(inv: Invoice) {
    const current = this.invoicesSubject.value;
    const index = current.findIndex(x => x.id === inv.id);
    if (index !== -1) {
      current[index] = inv;
      this.saveToStorage(this.KEYS.invoices, [...current]);
      this.invoicesSubject.next([...current]);
      this.triggerAutoBackup();
    }
  }

  deleteInvoice(id: string) {
    const filtered = this.invoicesSubject.value.filter(x => x.id !== id);
    this.saveToStorage(this.KEYS.invoices, filtered);
    this.invoicesSubject.next(filtered);
    this.triggerAutoBackup();
  }

  // --- Utils ---
  private generateId(prefix: string, arr: any[]): string {
    let max = 1000;
    arr.forEach(i => {
      if (i.id && i.id.startsWith(prefix)) {
        const parts = i.id.split('-');
        const n = parseInt(parts[1]);
        if (!isNaN(n) && n >= max) max = n + 1;
      }
    });
    return `${prefix}-${max}`;
  }

  private generateJobId(arr: JobSheet[]): string {
    // Format: DM-1001
    let max = 1000;
    arr.forEach(j => {
      if (j.id && j.id.startsWith('DM-')) {
        const parts = j.id.split('-');
        const n = parseInt(parts[1]);
        if (!isNaN(n) && n >= max) max = n + 1;
      }
    });
    return `DM-${max}`;
  }

  // --- Backup / Restore ---
  exportData() {
    const data = {
      purchases: this.purchasesSubject.value,
      sales: this.salesSubject.value,
      expenses: this.expensesSubject.value,
      customers: this.customersSubject.value,
      jobSheets: this.jobSheetsSubject.value,
      invoices: this.invoicesSubject.value,
      suppliers: this.suppliersSubject.value,
      appPin: localStorage.getItem('appPin')
    };
    return JSON.stringify(data);
  }

  importData(json: string) {
    try {
      const data = JSON.parse(json);
      if (data.purchases) {
        this.saveToStorage(this.KEYS.purchases, data.purchases);
        this.purchasesSubject.next(data.purchases);
      }
      if (data.sales) {
        this.saveToStorage(this.KEYS.sales, data.sales);
        this.salesSubject.next(data.sales);
      }
      if (data.expenses) {
        this.saveToStorage(this.KEYS.expenses, data.expenses);
        this.expensesSubject.next(data.expenses);
      }
      if (data.customers) {
        this.saveToStorage(this.KEYS.customers, data.customers);
        this.customersSubject.next(data.customers);
      }
      if (data.jobSheets) {
        this.saveToStorage(this.KEYS.jobSheets, data.jobSheets);
        this.jobSheetsSubject.next(data.jobSheets);
      }
      if (data.invoices) {
        this.saveToStorage(this.KEYS.invoices, data.invoices);
        this.invoicesSubject.next(data.invoices);
      }
      if (data.suppliers) {
        this.saveToStorage(this.KEYS.suppliers, data.suppliers);
        this.suppliersSubject.next(data.suppliers);
      }
      if (data.appPin) localStorage.setItem('appPin', data.appPin);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  clearAllData() {
    // Clear all CRM data from localStorage
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));

    this.purchasesSubject.next([]);
    this.salesSubject.next([]);
    this.expensesSubject.next([]);
    this.customersSubject.next([]);
    this.jobSheetsSubject.next([]);
    this.invoicesSubject.next([]);
    this.suppliersSubject.next([]);
  }

  // --- Auto Backup to Google Drive ---
  private triggerAutoBackup() {
    // Check if auto-backup is enabled
    if (localStorage.getItem('gdrive_auto_backup') !== 'true') {
      return;
    }

    // Debounce: wait 3 seconds after last change before backing up
    if (this.backupDebounceTimer) {
      clearTimeout(this.backupDebounceTimer);
    }

    this.backupDebounceTimer = setTimeout(async () => {
      try {
        // Lazy load GDriveService to avoid circular dependency
        const { GDriveService } = await import('./gdrive.service');
        const gdriveService = this.injector.get(GDriveService);

        if (gdriveService.isSignedIn()) {
          const jsonData = this.exportData();
          const result = await gdriveService.uploadBackup(jsonData);
          if (result.success) {
            gdriveService.setLastBackupTime();
            console.log('Auto-backup completed:', result.message);
          } else {
            console.warn('Auto-backup failed:', result.message);
          }
        }
      } catch (error) {
        console.error('Auto-backup error:', error);
      }
    }, 3000);
  }
}
