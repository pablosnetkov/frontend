'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import FileInput from '../../components/FileInput';

interface Category {
  id: number;
  name: string;
}

export default function AddProduct() {
  const router = useRouter();
  const { token, isAuthenticated, userInfo } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userInfo?.staff) {
      router.push('/');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await apiRequest<{ results: Category[] }>('/api/v1/good-categories/');
        setCategories(response.results);
        if (response.results.length > 0) {
          setFormData(prev => ({ ...prev, category: response.results[0].id.toString() }));
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        showNotification('Ошибка при загрузке категорий', 'error');
      }
    };

    fetchCategories();
  }, [isAuthenticated, userInfo, router, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = '';
      
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        formDataImage.append('name', formData.name);
        formDataImage.append('price', formData.price);
        formDataImage.append('description', formData.description);
        formDataImage.append('category', formData.category);

        const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
          method: 'POST',
          body: formDataImage,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        imageUrl = imageResponse.url;
      }

      await apiRequest('/api/v1/goods/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
          category: Number(formData.category),
          image: imageUrl
        })
      });

      showNotification('Товар успешно добавлен', 'success');
      
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
      });
      setSelectedImage(null);
      
      router.push('/admin');
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
        <FileInput
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
          label="Изображение товара"
          selectedFile={selectedImage}
          onClear={() => setSelectedImage(null)}
        />

        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          label="Название товара"
          required
        />

        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          label="Цена"
          required
        />

        <Select
          label="Категория"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          label="Описание"
          rows={4}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Создание...' : 'Создать товар'}
        </Button>
      </form>
    </div>
  );
} 