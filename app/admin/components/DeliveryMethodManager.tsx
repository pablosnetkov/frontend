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
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [newMethod, setNewMethod] = useState({ title: '', description: '' });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const response = await apiRequest<ApiResponse<DeliveryMethod>>('/api/v1/delivery-methods/');
      setMethods(response.results || []);
    } catch (error) {
      console.error('Ошибка при загрузке способов доставки:', error);
      showNotification('Ошибка при загрузке способов доставки', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest<DeliveryMethod>('/api/v1/delivery-methods/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMethod)
      });
      
      setMethods([...methods, response]);
      setNewMethod({ title: '', description: '' });
      showNotification('Способ доставки добавлен', 'success');
    } catch (error) {
      console.error('Ошибка при добавлении способа доставки:', error);
      showNotification('Ошибка при добавлении способа доставки', 'error');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Управление способами доставки</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название
          </label>
          <input
            type="text"
            value={newMethod.title}
            onChange={(e) => setNewMethod({ ...newMethod, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            value={newMethod.description}
            onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Добавить способ доставки
        </button>
      </form>

      <div className="space-y-4">
        {methods.map(method => (
          <div key={method.id} className="border p-4 rounded">
            <h3 className="font-bold">{method.title}</h3>
            <p className="text-gray-600">{method.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 