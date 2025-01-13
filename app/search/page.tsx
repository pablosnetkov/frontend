'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import { apiRequest } from '../components/utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const data = await apiRequest<ApiResponse>(`/api/v1/goods/?search=${encodeURIComponent(query)}`);
        setProducts(data.results);
        setError(null);
      } catch (err) {
        console.error('Ошибка при поиске товаров:', err);
        setError('Ошибка при поиске товаров');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {products.length > 0
            ? `Результаты поиска по запросу "${query}"`
            : `По запросу "${query}" ничего не найдено`}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <span>←</span> Назад
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center mt-8">Загрузка...</div>}>
      <SearchResults />
    </Suspense>
  );
} 