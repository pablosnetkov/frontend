'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';

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
  recipient: number;
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
            try {
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
            } catch (error) {
              console.error(`Ошибка при загрузке деталей заказа #${checkout.id}:`, error);
              return null;
            }
          })
        );

        // Фильтруем заказы, убирая те, где произошла ошибка
        const validCheckouts = checkoutsWithDetails
          .filter((checkout): checkout is NonNullable<typeof checkout> => checkout !== null)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setCheckouts(validCheckouts);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        showNotification('Ошибка при загрузке заказов', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [token, showNotification]);

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
          </div>
        ))}
      </div>
    </div>
  );
} 