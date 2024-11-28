import { apiRequest } from './utils/api';
import CategoryCard from './CategoryCard';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default async function CategoryList() {
  try {
    const data = await apiRequest<{ results: Category[] }>('/api/v1/good-categories/');
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.results.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    return <div className="text-red-500">Ошибка загрузки категорий</div>;
  }
} 