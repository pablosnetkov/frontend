import ProductCardFilled from '../../components/ProductCardFilled';
import Link from 'next/link';

type PageProps = {
  params: { id: string };
};

const DynamicPage = async ({ params }: PageProps) => {
  const { id } = params;
  const numericId = parseInt(id, 10);
  
  console.log('Page ID:', id);
  console.log('Numeric ID:', numericId);
  
  try {
    return (
      <div>
        <Link href="/products">
          <button className="mb-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
            <span>←</span> Back
          </button>
        </Link>
        <ProductCardFilled id={numericId} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering product:', error);
    return <div>Ошибка загрузки товара</div>;
  }
};

export default DynamicPage;

