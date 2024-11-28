import CategoryList from '../components/CategoryList';
import Link from 'next/link';

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Категории товаров</h1>
      <CategoryList />
    </div>
  );
}
