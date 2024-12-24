'use client';

import { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { apiRequest } from './utils/api';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest<{ results: Category[] }>('/api/v1/good-categories/');
        setCategories(response.results);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Загрузка категорий...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
} 