import Link from 'next/link';
import ProductCard from './components/ProductCard';
import { apiRequest } from './components/utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

async function getRandomProducts(): Promise<Product[]> {
  try {
    const response = await apiRequest<{ results: Product[] }>('/api/v1/goods/');
    const products = response.results;
    
    // Получаем 3 случайных товара
    return products
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    return [];
  }
}

export default async function Home() {
  const randomProducts = await getRandomProducts();

  return (
    <div className="space-y-12">
      {/* Hero секция */}
      <section className="bg-gray-900 text-white py-16 rounded-2xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-6xl md:text-7xl font-bold mb-4 text-white">
                jubami.com
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                Откройте для себя широкий ассортимент качественных товаров по выгодным ценам
              </p>
              <Link 
                href="/categories" 
                className="inline-block bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Смотреть каталог
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-800 h-72 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-6xl">Shop</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные товары */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Популярные товары</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {randomProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Преимущества */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Наши преимущества</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Быстрая доставка', icon: '🚚' },
              { title: 'Гарантия качества', icon: '✨' },
              { title: 'Большой выбор', icon: '📦' },
              { title: 'Лучшие цены', icon: '💰' },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Специальные предложения */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Специальные предложения</h2>
        <div className="bg-gray-900 text-white rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Скидка 20% на первый заказ</h3>
              <p className="text-gray-300 mb-4">Используйте промокод: WELCOME20</p>
              <button className="bg-white text-gray-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Получить скидку
              </button>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="bg-gray-800 w-48 h-48 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-4xl">20%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}