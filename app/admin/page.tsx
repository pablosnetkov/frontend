'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../components/utils/api';
import { useNotification } from '../contexts/NotificationContext';

export default function AdminPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = '';
      
      // Загружаем изображение, если оно выбрано
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
          method: 'POST',
          body: formData,
          headers: {}, // Убираем Content-Type, чтобы браузер сам установил правильный для FormData
        });

        imageUrl = imageResponse.url;
      }

      // Создаем товар
      await apiRequest('/api/v1/goods/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          category: Number(formData.category),
          image: imageUrl,
        }),
      });

      showNotification('Товар успешно добавлен', 'success');
      router.push('/categories'); // или куда вы хотите перенаправить после успеха
    } catch (error) {
      console.error('Ошибка при создании товара:', error);
      showNotification('Ошибка при создании товара', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Добавление товара</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение товара
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название товара
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категория
          </label>
          <input
            type="number"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-900 text-white rounded-md 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} 
            transition-colors`}
        >
          {isLoading ? 'Создание...' : 'Создать товар'}
        </button>
      </form>
    </div>
  );
} 