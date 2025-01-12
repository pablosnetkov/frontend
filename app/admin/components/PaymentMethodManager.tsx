'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';

interface PaymentMethod {
  id: number;
  title: string;
  description: string;
}

interface ApiResponse<T> {
  results: T[];
}

export default function PaymentMethodManager({ token }: { token: string }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiRequest<ApiResponse<PaymentMethod>>('/api/v1/payment-methods/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPaymentMethods(response.results || []);
    } catch (error) {
      console.error('Ошибка при загрузке способов оплаты:', error);
      showNotification('Ошибка при загрузке способов оплаты', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот способ оплаты?')) {
      return;
    }

    try {
      await apiRequest(`/api/v1/payment-methods/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      showNotification('Способ оплаты успешно удален', 'success');
      fetchPaymentMethods(); // Обновляем список
    } catch (error) {
      console.error('Ошибка при удалении способа оплаты:', error);
      showNotification('Ошибка при удалении способа оплаты', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Управление способами оплаты</h2>
      
      <div className="space-y-4">
        {paymentMethods.map(method => (
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