'use client';

import { useState } from 'react';
import { apiRequest } from '../../components/utils/api';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import FileInput from '../../components/FileInput';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <FileInput
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
        label="Изображение товара"
        selectedFile={selectedImage}
        onClear={() => setSelectedImage(null)}
        currentImageUrl={product.image}
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
        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        label="Цена"
        required
      />

      <Textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        label="Описание"
        rows={4}
      />

      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
} 