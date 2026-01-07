
export const APP_VERSION = "1.3.0";
export const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export const SECTORS = ["Adm", "Produção", "Instalação", "Manutenção", "Plotagem"];
export const RETURN_DESTINATIONS = ["Almoxarifado", "Descarte"];

export const UNITS = [
  { id: 'un', label: 'Unidade (un)' },
  { id: 'par', label: 'Par (pr)' },
  { id: 'cx', label: 'Caixa (cx)' },
  { id: 'pac', label: 'Pacote (pac)' },
  { id: 'rl', label: 'Rolo (rl)' },
  { id: 'kg', label: 'Quilo (kg)' },
  { id: 'g', label: 'Grama (g)' },
  { id: 'm', label: 'Metro (m)' },
  { id: 'm2', label: 'Metro Quadrado (m²)' },
  { id: 'm3', label: 'Metro Cúbico (m³)' },
  { id: 'L', label: 'Litro (L)' },
  { id: 'ml', label: 'Mililitro (ml)' },
];

export const DEFAULT_SETTINGS = {
  companyName: "Empresa Exemplo LTDA",
  tradeName: "GestorPro Soluções",
  logoUrl: "https://picsum.photos/200/100?grayscale",
  supabaseUrl: "",
  supabaseKey: "",
  aiEndpoint: "https://ai.google.dev/gemini-api"
};

export const SUPABASE_SQL_SCHEMA = `
-- SQL CONSOLIDADO GESTORPRO v1.3.0

DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operador', 'developer')),
  is_first_access BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Usuário Inicial: admin / admin01
INSERT INTO users (username, name, password, role, is_first_access) 
VALUES ('admin', 'Administrador', 'admin01', 'admin', TRUE);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  specification TEXT, -- Armazena Tamanho (ex: 39), Cor, Modelo ou Voltagem
  description TEXT,
  unit TEXT DEFAULT 'un',
  min_stock NUMERIC DEFAULT 0,
  current_stock NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  average_price NUMERIC DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'devolucao')),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  vendor TEXT,
  invoice_number TEXT,
  destination TEXT,
  project_destination TEXT, -- Destino por Projeto/Obra
  sector TEXT,
  requester TEXT,
  total_value NUMERIC DEFAULT 0,
  created_by TEXT,
  signature TEXT, -- Assinatura Digital em Base64
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_specification TEXT, -- Persiste o tamanho/cor no momento da transação
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_transactions_project ON transactions(project_destination);
CREATE INDEX idx_transactions_date ON transactions(date);
`;
