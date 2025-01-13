'use client';

import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="aspect-square relative">
          <img 
            src={category.image || '/placeholder-category.jpg'}
            alt={category.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-600 line-clamp-2 text-sm">
              {category.description}
            </p>
          )}
          <div className="mt-4 flex items-center text-blue-600 font-medium">
            <span>Перейти в категорию</span>
            <svg 
              className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
} 