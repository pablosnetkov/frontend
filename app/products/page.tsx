import ProductList from '../components/ProductList';
import header from '../components/header';


const ProductsPage: React.FC = () => {
  return (
    <div>
      <header />
      <h1 className="text-3xl font-bold my-4"></h1>
      <ProductList />
    </div>
  );
};

export default ProductsPage;

