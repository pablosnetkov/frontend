'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { apiRequest } from './utils/api';
import Link from 'next/link';

interface ProductListProps {
  categoryId?: number;
}

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

export default function ProductList({ categoryId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchProducts = async (url?: string) => {
    try {
      setLoading(true);
      let endpoint;
      
      if (url) {
        endpoint = url;
      } else {
        const baseEndpoint = '/api/v1/goods/';
        const params = new URLSearchParams();
        
        if (categoryId) {
          params.append('category', categoryId.toString());
        }
        
        endpoint = `${baseEndpoint}?${params.toString()}`;
      }
      
      const data = await apiRequest<ApiResponse>(endpoint);
      
      const filteredResults = categoryId
        ? data.results.filter(product => product.category === categoryId)
        : data.results;
      
      if (url) {
        setProducts(prev => [...prev, ...filteredResults]);
      } else {
        setProducts(filteredResults);
      }
      
      setNextPage(filteredResults.length > 0 ? data.next : null);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки товаров');
      console.error('Ошибка получения товаров:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция-колбэк для Intersection Observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && nextPage && !loading) {
      fetchProducts(nextPage);
    }
  }, [nextPage, loading]);

  // Устанавливаем observer при монтировании компонента
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  // Сбрасываем состояние при изменении категории
  useEffect(() => {
    setProducts([]);
    setNextPage(null);
    fetchProducts();
  }, [categoryId]);

  return (
    <div>
      <div className="mb-6">
        <Link href="/categories">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
            <span>←</span> Назад к категориям
          </button>
        </Link>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : products.length === 0 && !loading ? (
        <div className="text-gray-500">В данной категории пока нет товаров</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {/* Элемент-триггер для загрузки следующей страницы */}
          <div 
            ref={observerTarget} 
            className="h-10 flex justify-center items-center"
          >
            {loading && (
              <div className="text-gray-500">
                Загрузка...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}




