export interface ProductColor { name: string; hex: string; }
export interface ProductStock { size: string; color: string | null; stock: number; }

export interface CatalogProduct {
  id:            string;
  cat:           string;
  drop:          string;
  name:          string;
  price:         number;
  originalPrice: number;
  isNew:         boolean;
  isSale:        boolean;
  images:        string[];
  description?:  string;
  colors:        ProductColor[];
  stock:         ProductStock[];
}