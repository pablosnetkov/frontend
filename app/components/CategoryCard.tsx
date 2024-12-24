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
      <div className="group cursor-pointer">
        <div className="aspect-square overflow-hidden rounded-xl relative">
          <img 
            src={category.image || '/placeholder-category.jpg'}
            alt={category.name}
            className="object-cover w-full h-full transition duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-600 line-clamp-2">{category.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
} 