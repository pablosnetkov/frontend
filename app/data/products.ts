interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
  }
  
  const products: Product[] = [
    { id: 1, name: 'Товар 1', price: 1000, image: '/images/product1.jpg' },
    { id: 2, name: 'Товар 2', price: 1500, image: '/images/product2.jpg' },
    { id: 3, name: 'Товар 3', price: 2000, image: '/images/product3.jpg' },
  ];
  
  export default products;