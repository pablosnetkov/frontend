import { apiRequest } from './utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default async function ProductCardFilled({ id }: { id: number }) {
  try {
    const data = await apiRequest<Product>(`/api/v1/goods/${id}/`);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="h-64 bg-gray-200 flex items-center justify-center mb-6 rounded-md">
          <span className="text-gray-400 text-6xl">
            {data.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {data.name}
        </h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Описание:</h2>
          <p className="text-gray-600 leading-relaxed">
            {data.description}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-gray-900">
            {data.price.toLocaleString()} ₽
          </span>
          <button className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors font-medium">
            Купить
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    return <div className="text-red-500">Ошибка загрузки товара</div>;
  }
}

