'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface BasketContextType {
  itemCount: number;
  setItemCount: (count: number) => void;
}

interface BasketItems {
  [key: string]: number;
}

const BasketContext = createContext<BasketContextType>({
  itemCount: 0,
  setItemCount: () => {},
});

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const basket = localStorage.getItem('basket');
    if (basket) {
      try {
        const items = JSON.parse(basket) as BasketItems;
        const count = Object.values(items).reduce((acc, curr) => acc + curr, 0);
        setItemCount(count);
      } catch (error) {
        console.error('Ошибка при парсинге корзины:', error);
        localStorage.removeItem('basket');
      }
    }
  }, []);

  return (
    <BasketContext.Provider value={{ itemCount, setItemCount }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  return useContext(BasketContext);
} 