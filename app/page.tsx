'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './components/ProductCard';
import { apiRequest } from './components/utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching latest products...');
        const response = await apiRequest<ApiResponse>('/api/v1/goods/?ordering=id');
        console.log('API Response:', response);
        
        if (!response.results || !Array.isArray(response.results)) {
          console.error('Invalid response format:', response);
          return;
        }

        // Берем первые 8 товаров
        const latestProducts = response.results.slice(0, 8);
        console.log('Latest products:', latestProducts);
        setProducts(latestProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="bg-gray-900 text-white py-32 rounded-2xl flex items-center justify-center">
        <Link 
          href="/categories" 
          className="text-6xl font-light tracking-wider hover:tracking-widest transition-all duration-300"
        >
          JUBAMI
        </Link>
      </section>

      {/* Latest products */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-light mb-12 text-center">Последние товары</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">Загрузка товаров...</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              Товары не найдены
            </div>
          )}
        </div>
      </section>
    </div>
  );
}