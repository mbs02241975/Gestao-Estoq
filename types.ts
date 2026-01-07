
export type Role = 'admin' | 'operador' | 'developer';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  password?: string;
  isFirstAccess: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  specification?: string; // Novo: Tamanho, cor, modelo, etc.
  description: string;
  unit: string;
  min_stock: number;
  current_stock: number;
  unit_price: number; // Último preço de entrada
  average_price: number; // Preço médio móvel para relatórios
  category: string;
  created_at: string;
}

export type TransactionType = 'entrada' | 'saida' | 'devolucao';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  vendor?: string;
  invoice_number?: string;
  destination?: string;
  project_destination?: string; // Nome do projeto/obra (ex: Letreiro)
  sector?: string;
  requester?: string;
  total_value: number;
  items: TransactionItem[];
  created_by: string;
  signature?: string; // Base64 da assinatura
}

export interface TransactionItem {
  product_id: string;
  product_name: string;
  product_specification?: string; // Captura a especificação no momento da venda
  quantity: number;
  unit_price: number; // Preço no momento da transação (médio ou de entrada)
  total_price: number;
}

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  logoUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  aiEndpoint: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  mustChangePassword?: boolean;
}
