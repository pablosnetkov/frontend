'use client';

import { useState } from 'react';
import { apiRequest } from '../../components/utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: number;
}

interface EditProductFormProps {
  product: Product;
  token: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditProductForm({ product, token, onSave, onCancel }: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    description: product.description || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = product.image;
      
      if (selectedImage) {
        const formDataEnd = new FormData();
        formDataEnd.append('file', selectedImage);
        
        const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
          method: 'POST',
          body: formDataEnd,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        imageUrl = imageResponse.url;
      }

      await apiRequest(`/api/v1/goods/${product.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          category: product.category,
          image: imageUrl,
        })
      });

      onSave();
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        {product.image && !selectedImage && (
          <img
            src={product.image}
            alt="Текущее изображение"
            className="mt-2 h-32 object-cover rounded-md"
          />
        )}
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
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
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

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
            transition-colors`}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
} 