'use client';

import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">
            {category.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-600 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
} 