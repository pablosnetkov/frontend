'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: number;
}

interface EditProductModalProps {
  product: Product;
  token: string;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({ product, token, onClose, onSave }: EditProductModalProps) {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    description: product.description || '',
    category: product.category,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(product.image);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest<{ results: Category[] }>('/api/v1/good-categories/');
        setCategories(response.results);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        showNotification('Ошибка при загрузке категорий', 'error');
      }
    };

    fetchCategories();
  }, [showNotification]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewImage('');
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = previewImage;
      
      if (selectedImage) {
        const formDataEnd = new FormData();
        formDataEnd.append('file', selectedImage);
        formDataEnd.append('name', formData.name);
        formDataEnd.append('price', formData.price.toString());
        formDataEnd.append('description', formData.description);
        formDataEnd.append('category', formData.category.toString());

        try {
          const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
            method: 'POST',
            body: formDataEnd,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          imageUrl = imageResponse.url;
        } catch (error) {
          console.error('Ошибка при загрузке изображения:', error);
          showNotification('Ошибка при загрузке изображения', 'error');
          return;
        }
      }

      if (!previewImage && !selectedImage) {
        imageUrl = '';
      }

      const updatedProduct = await apiRequest<Product>(`/api/v1/goods/${product.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          category: formData.category,
          image: imageUrl,
        })
      });

      onSave({
        ...updatedProduct,
        image: imageUrl
      });
      
      showNotification('Товар успешно обновлен', 'success');
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      showNotification('Ошибка при обновлении товара', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Редактирование товара</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изображение товара
            </label>
            <div className="space-y-4">
              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Предпросмотр"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 