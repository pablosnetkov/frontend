'use client';

import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    alert('Функция добавления в корзину пока не реализована');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <div className="cursor-pointer">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
              {product.name}
            </h3>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-gray-900">
          {product.price.toLocaleString()} ₽
        </span>
        <button 
          onClick={handleAddToCart}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>🛒</span>
          В корзину
        </button>
      </div>
    </div>
  );
}