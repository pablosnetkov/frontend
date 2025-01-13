'use client';

import Link from 'next/link';
import ProductCardFilled from '../../components/ProductCardFilled';
import { apiRequest } from '../../components/utils/api';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = params?.id;
        if (!id || Array.isArray(id)) {
          throw new Error('Неверный ID продукта');
        }

        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new Error('Неверный ID продукта');
        }

        const data = await apiRequest<Product>(`/api/v1/goods/${numericId}/`);
        setProduct(data);
      } catch (err) {
        console.error('Ошибка получения товара:', err);
        setError('Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (error || !product) {
    return <div className="text-red-500 text-center mt-8">{error || 'Товар не найден'}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/categories">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
            <span>←</span> Назад к категориям
          </button>
        </Link>
      </div>
      <ProductCardFilled product={product} />
    </div>
  );
}

