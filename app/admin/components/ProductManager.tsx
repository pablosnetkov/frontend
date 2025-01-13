'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScrollToTop from '../../components/ScrollToTop';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  parent_category: number | null;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: number;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function ProductManager({ token }: { token: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Состояния для форм
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState<Category | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', parent_category: '' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [nextPage, setNextPage] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    try {
      const response = await apiRequest<ApiResponse<Category>>('/api/v1/good-categories/');
      setCategories(response.results || []);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      showNotification('Ошибка при загрузке категорий', 'error');
    }
  };

  const fetchProducts = async (categoryId: number, url?: string) => {
    try {
      let endpoint;
      
      if (url) {
        endpoint = url;
      } else {
        endpoint = `/api/v1/goods/?category=${categoryId}`;
      }
      
      const response = await apiRequest<ApiResponse<Product>>(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (url) {
        setProducts(prev => [...prev, ...response.results]);
      } else {
        setProducts(response.results);
      }
      
      setNextPage(response.next);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      showNotification('Ошибка при загрузке товаров', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик для Intersection Observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && nextPage && !loading && selectedCategory) {
      fetchProducts(selectedCategory, nextPage);
    }
  }, [nextPage, loading, selectedCategory]);

  // Установка observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  // При смене категории сбрасываем состояние и загружаем новые товары
  useEffect(() => {
    if (selectedCategory) {
      setProducts([]);
      setNextPage(null);
      setLoading(true);
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Обработчики для категорий
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
          method: 'POST',
          body: formDataImage,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        imageUrl = imageResponse.url;
      }

      if (isEditingCategory) {
        await apiRequest(`/api/v1/good-categories/${isEditingCategory.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newCategory,
            image: imageUrl || isEditingCategory.image,
            parent_category: newCategory.parent_category ? Number(newCategory.parent_category) : null
          })
        });
        showNotification('Категория успешно обновлена', 'success');
      } else {
        await apiRequest('/api/v1/good-categories/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newCategory,
            image: imageUrl,
            parent_category: newCategory.parent_category ? Number(newCategory.parent_category) : null
          })
        });
        showNotification('Категория успешно создана', 'success');
      }

      setIsAddingCategory(false);
      setIsEditingCategory(null);
      setNewCategory({ name: '', description: '', parent_category: '' });
      setSelectedImage(null);
      fetchCategories();
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
      showNotification('Ошибка при сохранении категории', 'error');
    }
  };

  // Обработчики для товаров
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append('file', selectedImage);
        const imageResponse = await apiRequest<{ url: string }>('/api/v1/images/', {
          method: 'POST',
          body: formDataImage,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        imageUrl = imageResponse.url;
      }

      if (isEditingProduct) {
        await apiRequest(`/api/v1/goods/${isEditingProduct.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newProduct,
            price: Number(newProduct.price),
            image: imageUrl || isEditingProduct.image,
            category: selectedCategory
          })
        });
        showNotification('Товар успешно обновлен', 'success');
      } else {
        await apiRequest('/api/v1/goods/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newProduct,
            price: Number(newProduct.price),
            image: imageUrl,
            category: selectedCategory
          })
        });
        showNotification('Товар успешно создан', 'success');
      }

      setIsAddingProduct(false);
      setIsEditingProduct(null);
      setNewProduct({ name: '', price: '', description: '', category: '' });
      setSelectedImage(null);
      if (selectedCategory) {
        fetchProducts(selectedCategory);
      }
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      showNotification('Ошибка при сохранении товара', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      await apiRequest(`/api/v1/good-categories/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showNotification('Категория успешно удалена', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      showNotification('Ошибка при удалении категории', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await apiRequest(`/api/v1/goods/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showNotification('Товар успешно удален', 'success');
      if (selectedCategory) {
        fetchProducts(selectedCategory);
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      showNotification('Ошибка при удалении товара', 'error');
    }
  };

  const startEditCategory = (category: Category) => {
    setIsEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      parent_category: category.parent_category?.toString() || ''
    });
    setIsAddingCategory(true);
  };

  const startEditProduct = (product: Product) => {
    setIsEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category.toString()
    });
    setIsAddingProduct(true);
  };

  return (
    <div className="space-y-6">
      <ScrollToTop />
      
      {!selectedCategory ? (
        // Список категорий
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Управление категориями</h2>
            <Button
              onClick={() => setIsAddingCategory(true)}
              variant="primary"
            >
              Добавить категорию
            </Button>
          </div>

          <Modal
            isOpen={isAddingCategory}
            onClose={() => {
              setIsAddingCategory(false);
              setIsEditingCategory(null);
              setNewCategory({ name: '', description: '', parent_category: '' });
            }}
            title={isEditingCategory ? 'Редактирование категории' : 'Добавление категории'}
          >
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                label="Изображение категории"
              />
              <Input
                type="text"
                placeholder="Название категории"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                label="Название категории"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Описание
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Родительская категория
                </label>
                <select
                  value={newCategory.parent_category}
                  onChange={(e) => setNewCategory({ ...newCategory, parent_category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Без родительской категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary">
                  {isEditingCategory ? 'Сохранить изменения' : 'Добавить категорию'}
                </Button>
              </div>
            </form>
          </Modal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div 
                  onClick={() => setSelectedCategory(category.id)}
                  className="cursor-pointer"
                >
                  <img
                    src={category.image || '/placeholder.png'}
                    alt={category.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-gray-600 mt-2">{category.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditCategory(category);
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Список товаров в категории
        <>
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mb-4 text-blue-500 hover:text-blue-700"
              >
                ← Назад к категориям
              </button>
              <h2 className="text-xl font-bold">Товары в категории</h2>
            </div>
            <Button
              onClick={() => setIsAddingProduct(true)}
              variant="primary"
            >
              Добавить товар
            </Button>
          </div>

          <Modal
            isOpen={isAddingProduct}
            onClose={() => {
              setIsAddingProduct(false);
              setIsEditingProduct(null);
              setNewProduct({ name: '', price: '', description: '', category: '' });
            }}
            title={isEditingProduct ? 'Редактирование товара' : 'Добавление нового товара'}
          >
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {isEditingProduct ? 'Редактирование товара' : 'Добавление нового товара'}
              </h3>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                label="Изображение товара"
              />
              <Input
                type="text"
                placeholder="Название товара"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                label="Название товара"
                required
              />
              <Input
                type="number"
                placeholder="Цена"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                label="Цена"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Описание
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary">
                  {isEditingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                </Button>
              </div>
            </form>
          </Modal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border p-4 rounded-lg">
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="font-bold mb-4">{product.price} ₽</p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => startEditProduct(product)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div 
            ref={observerTarget} 
            className="h-10 flex justify-center items-center"
          >
            {loading && (
              <LoadingSpinner />
            )}
          </div>
        </>
      )}
    </div>
  );
} 