import CategoryList from '../components/CategoryList';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Категории товаров</h1>
      <CategoryList />
    </div>
  );
}
