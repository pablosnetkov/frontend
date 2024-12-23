'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../../components/ConfirmDialog';

interface ApiResponse<T> {
  results: T[];
}

// Интерфейс для исходных данных заказа из API
interface Checkout {
  id: number;
  created_at: string;
  updated_at: string;
  payment_total: number;
  payment_method: number;
  delivery_method: number;
  recipient: number; // ID получателя
  basket: number;
}

// Интерфейсы для детальной информации
interface PaymentMethod {
  id: number;
  title: string;
  description: string;
}

interface DeliveryMethod {
  id: number;
  title: string;
  description: string;
}

interface Recipient {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  email: string;
  address: string;
  zip_code: string;
}

interface CheckoutWithDetails {
  id: number;
  created_at: string;
  updated_at: string;
  payment_total: number;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  recipient: Recipient;
  basket: number;
}

export default function CheckoutManager({ token }: { token: string }) {
  const [checkouts, setCheckouts] = useState<CheckoutWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [checkoutToDelete, setCheckoutToDelete] = useState<number | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      if (!token) return;

      try {
        const checkoutsResponse = await apiRequest<ApiResponse<Checkout>>('/api/v1/checkouts/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Получаем детальную информацию для каждого заказа
        const checkoutsWithDetails = await Promise.all(
          checkoutsResponse.results.map(async (checkout) => {
            const [paymentMethod, deliveryMethod, recipient] = await Promise.all([
              apiRequest<PaymentMethod>(`/api/v1/payment-methods/${checkout.payment_method}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              apiRequest<DeliveryMethod>(`/api/v1/delivery-methods/${checkout.delivery_method}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              apiRequest<Recipient>(`/api/v1/recipients/${checkout.recipient}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
            ]);

            return {
              ...checkout,
              payment_method: paymentMethod,
              delivery_method: deliveryMethod,
              recipient: recipient
            };
          })
        );

        setCheckouts(checkoutsWithDetails);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        showNotification('Ошибка при загрузке заказов', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [token, showNotification]);

  const handleDeleteClick = (checkoutId: number) => {
    setCheckoutToDelete(checkoutId);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!checkoutToDelete) return;

    try {
      await apiRequest(`/api/v1/checkouts/${checkoutToDelete}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setCheckouts(prev => prev.filter(checkout => checkout.id !== checkoutToDelete));
      showNotification('Заказ успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      showNotification('Ошибка при удалении заказа', 'error');
    } finally {
      setShowConfirmDelete(false);
      setCheckoutToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Управление заказами</h2>
      
      <div className="space-y-6">
        {checkouts.map(checkout => (
          <div key={checkout.id} className="border p-4 rounded shadow-sm">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-bold">Заказ #{checkout.id}</h3>
                <p className="text-gray-600">
                  {new Date(checkout.created_at).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Обновлен: {new Date(checkout.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">Сумма: {checkout.payment_total} ₽</p>
                <p>Способ оплаты: {checkout.payment_method.title}</p>
                <p>Способ доставки: {checkout.delivery_method.title}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Получатель:</h4>
              <p>ФИО: {checkout.recipient.last_name} {checkout.recipient.first_name} {checkout.recipient.middle_name}</p>
              <p>Телефон: {checkout.recipient.phone}</p>
              <p>Email: {checkout.recipient.email}</p>
              <p>Адрес: {checkout.recipient.address}</p>
              <p>Индекс: {checkout.recipient.zip_code}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleDeleteClick(checkout.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Удалить заказ
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление заказа"
        message="Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить."
      />
    </div>
  );
} 