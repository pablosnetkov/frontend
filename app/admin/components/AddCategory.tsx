'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '../../components/utils/api'
import { useNotification } from '../../contexts/NotificationContext'

interface Category {
    id: number;
    name: string;
    description: string;
    image: string;
    parent_category: number | null;
}

export default function AddCategory({ token }: { token: string }) {
    const router = useRouter();
    const { showNotification } = useNotification()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_category: '',
    })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)

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
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let imageUrl = '';
            
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

            await apiRequest('/api/v1/good-categories/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    image: imageUrl,
                    parent_category: formData.parent_category ? Number(formData.parent_category) : null
                })
            });

            showNotification('Категория успешно создана', 'success')
            setFormData({
                name: '',
                description: '',
                parent_category: '',
            })
            setSelectedImage(null)
            router.push('/admin')
        } catch (error) {
            console.error('Ошибка при создании категории:', error);
            showNotification('Ошибка при создании категории', 'error');
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Добавление категории</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Изображение категории
                    </label>
                    <input
                        type="file"
                        onChange={handleImageChange}
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
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-4 py-2 bg-gray-900 text-white rounded-md 
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} 
                        transition-colors`}
                >
                    {loading ? 'Создание...' : 'Создать категорию'}
                </button>
            </form>
        </div>
    )
} 