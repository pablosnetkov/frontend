'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';

interface DeliveryMethod {
  id: number;
  title: string;
  description: string;
}

interface ApiResponse<T> {
  results: T[];
}

export default function DeliveryMethodManager({ token }: { token: string }) {
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchDeliveryMethods = async () => {
    try {
      const response = await apiRequest<ApiResponse<DeliveryMethod>>('/api/v1/delivery-methods/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDeliveryMethods(response.results || []);
    } catch (error) {
      console.error('Ошибка при загрузке способов доставки:', error);
      showNotification('Ошибка при загрузке способов доставки', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDeliveryMethods();
    }
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот способ доставки?')) {
      return;
    }

    try {
      await apiRequest(`/api/v1/delivery-methods/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      showNotification('Способ доставки успешно удален', 'success');
      fetchDeliveryMethods(); // Обновляем список
    } catch (error) {
      console.error('Ошибка при удалении способа доставки:', error);
      showNotification('Ошибка при удалении способа доставки', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Управление способами доставки</h2>
      
      <div className="space-y-4">
        {deliveryMethods.map(method => (
          <div key={method.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{method.title}</h3>
              <p className="text-gray-600">{method.description}</p>
            </div>
            <button
              onClick={() => handleDelete(method.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 