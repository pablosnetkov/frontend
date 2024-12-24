import { useState, useEffect } from 'react'
import { apiRequest } from '../../components/utils/api'
import { useNotification } from '../../contexts/NotificationContext'
import EditCategoryForm from './EditCategoryForm'

interface Category {
    id: number;
    name: string;
    description: string;
    image: string;
    parent_category: number | null;
}

export default function ProductList({ token }: { token: string }) {
    const [categories, setCategories] = useState<Category[]>([])
    const [editingCategory, setEditingCategory] = useState<number | null>(null)
    const { showNotification } = useNotification()

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

    const handleCategoryDelete = async (categoryId: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            try {
                await apiRequest(`/api/v1/good-categories/${categoryId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setCategories(categories.filter(cat => cat.id !== categoryId));
                showNotification('Категория успешно удалена', 'success');
            } catch (error) {
                console.error('Ошибка при удалении категории:', error);
                showNotification('Ошибка при удалении категории', 'error');
            }
        }
    }

    return (
        <div>
            <h2 className="text-xl font-bold mt-8 mb-4">Управление категориями</h2>
            <div className="space-y-4">
                {categories.map(category => (
                    <div key={category.id} className="border p-4 rounded flex items-start gap-4">
                        {category.image && (
                            <div className="w-24 h-24 flex-shrink-0">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                        )}
                        <div className="flex-grow">
                            {editingCategory === category.id ? (
                                <EditCategoryForm
                                    category={category}
                                    categories={categories}
                                    token={token}
                                    onCancel={() => setEditingCategory(null)}
                                    onSuccess={(updatedCategory) => {
                                        setCategories(categories.map(cat =>
                                            cat.id === updatedCategory.id ? updatedCategory : cat
                                        ));
                                        setEditingCategory(null);
                                    }}
                                />
                            ) : (
                                <>
                                    <h3 className="font-bold">{category.name}</h3>
                                    <p className="text-gray-600">{category.description}</p>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => setEditingCategory(category.id)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleCategoryDelete(category.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 