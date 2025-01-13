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
  const [isEditing, setIsEditing] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null);
  const [newMethod, setNewMethod] = useState({ title: '', description: '' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingMethod) {
        await apiRequest(`/api/v1/delivery-methods/${editingMethod.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingMethod),
        });
        showNotification('Способ доставки успешно обновлен', 'success');
      } else {
        await apiRequest('/api/v1/delivery-methods/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMethod),
        });
        showNotification('Способ доставки успешно добавлен', 'success');
      }
      setIsEditing(false);
      setEditingMethod(null);
      setNewMethod({ title: '', description: '' });
      fetchDeliveryMethods();
    } catch (error) {
      console.error('Ошибка при сохранении способа доставки:', error);
      showNotification('Ошибка при сохранении способа доставки', 'error');
    }
  };

  const startEdit = (method: DeliveryMethod) => {
    setIsEditing(true);
    setEditingMethod(method);
    setNewMethod({ title: '', description: '' });
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Управление способами доставки</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Название способа доставки"
            value={isEditing ? editingMethod?.title : newMethod.title}
            onChange={(e) => isEditing 
              ? setEditingMethod({ ...editingMethod!, title: e.target.value })
              : setNewMethod({ ...newMethod, title: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Описание"
            value={isEditing ? editingMethod?.description : newMethod.description}
            onChange={(e) => isEditing
              ? setEditingMethod({ ...editingMethod!, description: e.target.value })
              : setNewMethod({ ...newMethod, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? 'Сохранить изменения' : 'Добавить способ доставки'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingMethod(null);
              }}
              className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {deliveryMethods.map(method => (
          <div key={method.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{method.title}</h3>
              <p className="text-gray-600">{method.description}</p>
            </div>
            <div>
              <button
                onClick={() => startEdit(method)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
              >
                Редактировать
              </button>
              <button
                onClick={() => handleDelete(method.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 