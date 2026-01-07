
import { Product, Transaction, CompanySettings, User } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const KEYS = {
  PRODUCTS: 'gestorpro_products',
  TRANSACTIONS: 'gestorpro_transactions',
  SETTINGS: 'gestorpro_settings',
  USERS: 'gestorpro_users',
};

export const storageService = {
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      // Usuário admin inicial padrão
      const initialAdmin: User = {
        id: 'admin-001',
        username: 'admin',
        name: 'Administrador',
        role: 'admin',
        password: 'admin01',
        isFirstAccess: true
      };
      const users = [initialAdmin];
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      return users;
    }
    return JSON.parse(data);
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  updateUser: (updatedUser: User) => {
    const users = storageService.getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      storageService.saveUsers(users);
    }
  },
  deleteUser: (id: string) => {
    const users = storageService.getUsers();
    storageService.saveUsers(users.filter(u => u.id !== id));
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  addProduct: (product: Product) => {
    const products = storageService.getProducts();
    if (products.some(p => p.code === product.code || p.name.toLowerCase() === product.name.toLowerCase())) {
      throw new Error('Produto com este nome ou código já cadastrado.');
    }
    // Inicializa média móvel com o preço inicial
    const newProduct = { ...product, average_price: product.unit_price };
    products.push(newProduct);
    storageService.saveProducts(products);
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransaction: (transaction: Transaction) => {
    const transactions = storageService.getTransactions();
    const products = storageService.getProducts();

    transaction.items.forEach(item => {
      const pIdx = products.findIndex(p => p.id === item.product_id);
      if (pIdx !== -1) {
        const p = products[pIdx];
        
        if (transaction.type === 'entrada') {
          // Lógica de Média Móvel: (Q_ant * P_méd_ant + Q_nova * P_novo) / (Q_total)
          const oldStock = p.current_stock;
          const oldAvg = p.average_price || 0;
          const newQty = item.quantity;
          const newPrice = item.unit_price;
          
          const totalStock = oldStock + newQty;
          const newAvg = ((oldStock * oldAvg) + (newQty * newPrice)) / totalStock;
          
          p.current_stock = totalStock;
          p.average_price = Number(newAvg.toFixed(4));
          p.unit_price = newPrice; // Atualiza o "último preço"
        } else if (transaction.type === 'saida') {
          p.current_stock -= item.quantity;
        } else if (transaction.type === 'devolucao') {
          p.current_stock += item.quantity;
        }
      }
    });

    storageService.saveProducts(products);
    transactions.push(transaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Settings
  getSettings: (): CompanySettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: CompanySettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
