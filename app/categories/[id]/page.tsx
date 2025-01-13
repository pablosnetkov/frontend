'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProductList from '../../components/ProductList';
import { apiRequest } from '../../components/utils/api';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

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

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await apiRequest<Category>(`/api/v1/good-categories/${resolvedParams.id}/`);
        setCategory(data);
      } catch (err) {
        console.error('Ошибка загрузки категории:', err);
        setError('Ошибка загрузки категории');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (error || !category) {
    return <div className="text-red-500 text-center mt-8">{error || 'Категория не найдена'}</div>;
  }

  return (
    <div>
      <button
        onClick={() => router.push('/categories')}
        className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
      >
        ← Назад к категориям
      </button>
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>
      <ProductList categoryId={parseInt(resolvedParams.id, 10)} />
    </div>
  );
}