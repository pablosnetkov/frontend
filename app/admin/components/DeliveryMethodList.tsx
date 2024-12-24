'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../components/utils/api';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';

interface DeliveryMethod {
  id: number;
  title: string;
  description: string;
}

export default function DeliveryMethodList({ token }: { token: string }) {
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await apiRequest<{ results: DeliveryMethod[] }>('/api/v1/delivery-methods/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMethods(response.results || []);
      } catch (error) {
        console.error('Ошибка при загрузке способов доставки:', error);
        showNotification('Ошибка при загрузке способов доставки', 'error');
      }
    };

    fetchMethods();
  }, [token, showNotification]);

  const handleDeleteClick = (methodId: number) => {
    setMethodToDelete(methodId);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return;

    try {
      await apiRequest(`/api/v1/delivery-methods/${methodToDelete}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMethods(prev => prev.filter(method => method.id !== methodToDelete));
      showNotification('Способ доставки успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении способа доставки:', error);
      showNotification('Ошибка при удалении способа доставки', 'error');
    } finally {
      setShowConfirmDelete(false);
      setMethodToDelete(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Способы доставки</h2>
      <div className="space-y-4">
        {methods.map(method => (
          <div key={method.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-bold">{method.title}</h3>
              <p className="text-gray-600">{method.description}</p>
            </div>
            <button
              onClick={() => handleDeleteClick(method.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление способа доставки"
        message="Вы уверены, что хотите удалить этот способ доставки? Это действие нельзя отменить."
      />
    </div>
  );
} 