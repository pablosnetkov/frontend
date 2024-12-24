'use client';

import { useState } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';

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
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изображение категории
                </label>
                {category.image && (
                    <div className="mb-2">
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-24 h-24 object-cover rounded"
                        />
                    </div>
                )}
                <input
                    type="file"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    accept="image/*"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название категории
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
                    Родительская категория
                </label>
                <select
                    value={formData.parent_category}
                    onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                </select>
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-green-500 text-white rounded-md 
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
} 