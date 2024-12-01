import ProductList from '../../components/ProductList';
import { apiRequest } from '../../components/utils/api';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default async function CategoryPage({ params }: PageProps) {
    const { id } = await params; // Await the params to access id
    
    try {
      const category = await apiRequest<Category>(`/api/v1/good-categories/${id}/`);
      
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6">{category.name}</h1>
          <ProductList categoryId={parseInt(id, 10)} />
        </div>
      );
    } catch (error) {
      console.error('Ошибка загрузки категории:', error);
      return <div className="text-red-500">Ошибка загрузки категории</div>;
    }
  }