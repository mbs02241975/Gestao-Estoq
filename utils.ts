
import { BRAZIL_TIMEZONE } from './constants';
import { Product } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string | Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

/**
 * Gera um UUID v4 robusto compatível com Supabase
 */
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback caso o navegador seja muito antigo
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Gera o próximo código de produto seguindo o padrão Prod001, Prod002...
 */
export const getNextProductCode = (products: Product[]): string => {
  if (products.length === 0) return 'Prod001';

  const codes = products
    .map(p => {
      const match = p.code.match(/^Prod(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);

  const maxNumber = codes.length > 0 ? Math.max(...codes) : 0;
  const nextNumber = maxNumber + 1;

  // Formata com zeros à esquerda (ex: 1 -> 001, 10 -> 010)
  return `Prod${nextNumber.toString().padStart(3, '0')}`;
};
