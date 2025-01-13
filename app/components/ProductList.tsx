'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { apiRequest } from './utils/api';
import { useRouter } from 'next/navigation';
import SortSelect from './SortSelect';

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
  const [sortOrder, setSortOrder] = useState('');
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchProducts = async (url?: string) => {
    try {
      setLoading(true);
      let endpoint;
      
      if (url) {
        // Для следующих страниц используем URL как есть, так как он уже содержит все параметры
        endpoint = url;
      } else {
        // Для первой страницы формируем URL с параметрами
        const params = new URLSearchParams();
        if (categoryId) {
          params.append('category', categoryId.toString());
        }
        if (sortOrder) {
          params.append('ordering', sortOrder);
        }
        endpoint = `/api/v1/goods/?${params.toString()}`;
      }
      
      const data = await apiRequest<ApiResponse>(endpoint);
      
      if (url) {
        setProducts(prev => [...prev, ...data.results]);
      } else {
        setProducts(data.results);
      }
      
      setNextPage(data.next);
      setError(null);
    } catch (err) {
      console.error('Ошибка получения товаров:', err);
      setError('Ошибка загрузки товаров');
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

  // Сбрасываем состояние при изменении категории или сортировки
  useEffect(() => {
    setProducts([]);
    setNextPage(null);
    fetchProducts();
  }, [categoryId, sortOrder]);

  // Обработчик клавиши Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.push('/categories');
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [router]);

  return (
    <div>
      <div className="mb-6">
        <SortSelect
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
        />
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




