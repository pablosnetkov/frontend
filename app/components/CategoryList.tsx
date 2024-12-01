'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from './utils/api';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest<{ results: Category[] }>('/api/v1/good-categories/');
        setCategories(response.results);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
        setError('Ошибка при загрузке категорий');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link 
          key={category.id}
          href={`/categories/${category.id}`}
          className="block"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">
                {category.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 