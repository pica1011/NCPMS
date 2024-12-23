import { useState, useEffect } from 'react';
import { ProductModel } from '../lib/models/product';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await ProductModel.findAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await ProductModel.create(product);
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, addProduct, refreshProducts: fetchProducts };
};