'use client';

import { useNotification } from '../contexts/NotificationContext';
import Notification from './Notification';

export default function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onComplete={() => {}}
        />
      ))}
    </div>
  );
} 