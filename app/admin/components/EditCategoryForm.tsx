'use client';

import { useState } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import FileInput from '../../components/FileInput';

interface Category {
    id: number;
    name: string;
    description: string;
    image: string;
    parent_category: number | null;
}

interface EditCategoryFormProps {
    category: Category;
    categories: Category[];
    token: string;
    onCancel: () => void;
    onSuccess: (updatedCategory: Category) => void;
}

export default function EditCategoryForm({ category, categories, token, onCancel, onSuccess }: EditCategoryFormProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: category.name,
        description: category.description,
        parent_category: category.parent_category?.toString() || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = category.image;

            if (selectedImage) {
                const formDataImage = new FormData();
                formDataImage.append('file', selectedImage);
                formDataImage.append('name', formData.name);
                formDataImage.append('description', formData.description);
                formDataImage.append('parent_category', formData.parent_category);

                const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
                    method: 'POST',
                    body: formDataImage,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                imageUrl = imageResponse.url;
            }

            const updatedCategory = await apiRequest<Category>(`/api/v1/good-categories/${category.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    image: imageUrl,
                    parent_category: formData.parent_category ? Number(formData.parent_category) : null
                })
            });

            showNotification('Категория успешно обновлена', 'success');
            onSuccess(updatedCategory);
        } catch (error) {
            console.error('Ошибка при обновлении категории:', error);
            showNotification('Ошибка при обновлении категории', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FileInput
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                label="Изображение категории"
                selectedFile={selectedImage}
                onClear={() => setSelectedImage(null)}
                currentImageUrl={category.image}
            />

            <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                label="Название категории"
                required
            />

            <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                label="Описание"
                rows={4}
            />

            <Select
                label="Родительская категория"
                value={formData.parent_category}
                onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
            >
                <option value="">Без родительской категории</option>
                {categories
                    .filter(cat => cat.id !== category.id)
                    .map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))
                }
            </Select>

            <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary">
                    Сохранить
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Отмена
                </Button>
            </div>
        </form>
    );
} 