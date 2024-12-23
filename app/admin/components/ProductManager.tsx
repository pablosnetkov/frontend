'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EditProductModal from './EditProductModal';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: number;
}

interface Category {
  id: number;
  name: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export default function ProductManager({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const fetchProducts = async (url?: string) => {
    try {
      setLoading(true);
      let endpoint;
      
      if (url) {
        endpoint = url;
      } else {
        const baseEndpoint = '/api/v1/goods/';
        const params = new URLSearchParams();
        
        if (selectedCategory) {
          params.append('category', selectedCategory.toString());
        }
        
        endpoint = `${baseEndpoint}?${params.toString()}`;
      }
      
      const data = await apiRequest<ApiResponse>(endpoint);
      
      const filteredResults = selectedCategory
        ? data.results.filter(product => product.category === selectedCategory)
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

  // Получаем категории при монтировании
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiRequest<{ results: Category[] }>('/api/v1/good-categories/');
        setCategories(categoriesData.results);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        showNotification('Ошибка при загрузке категорий', 'error');
      }
    };

    fetchCategories();
  }, [showNotification]);

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
    if (selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory]);

  const handleDelete = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      await apiRequest(`/api/v1/goods/${productId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProducts(products.filter(p => p.id !== productId));
      showNotification('Товар успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      showNotification('Ошибка при удалении товара', 'error');
    }
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = (updatedProduct: Product) => {
    if (updatedProduct.category !== selectedCategory) {
      setProducts(products.filter(p => p.id !== updatedProduct.id));
    } else {
      setProducts(products.map(p => 
        p.id === updatedProduct.id 
          ? { ...updatedProduct, image: updatedProduct.image }
          : p
      ));
    }
  };

  // Добавляем функцию для прокрутки вверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleBackToMain = () => {
    setSelectedCategory(null);
    router.push('/admin');
  };

  if (!selectedCategory) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Выберите категорию</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="p-6 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="p-6 relative">
      <button
        onClick={() => setSelectedCategory(null)}
        className="mb-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        Назад к категориям
      </button>

      <h1 className="text-3xl font-bold mb-8">
        {currentCategory?.name}
      </h1>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : products.length === 0 && !loading ? (
        <div className="text-gray-500">В данной категории пока нет товаров</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map(product => (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm flex flex-col h-full">
                <div 
                  className="flex-grow cursor-pointer"
                  onClick={() => handleEdit(product)}
                >
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="mt-auto">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-lg font-bold mb-4">{product.price} ₽</p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
          
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

          {/* Кнопка прокрутки вверх */}
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            aria-label="Наверх"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          token={token}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
} 