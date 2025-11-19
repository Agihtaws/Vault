import { useEffect } from 'react';
import { useUIStore } from '../store/useStore';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';

export const Notification = () => {
  const { notification, hideNotification } = useUIStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-success-400" />,
    error: <XCircleIcon className="w-6 h-6 text-danger-400" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />,
    info: <InformationCircleIcon className="w-6 h-6 text-primary-400" />,
  };

  const bgColors = {
    success: 'bg-success-900/90 border-success-500/50',
    error: 'bg-danger-900/90 border-danger-500/50',
    warning: 'bg-yellow-900/90 border-yellow-500/50',
    info: 'bg-primary-900/90 border-primary-500/50',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 ${bgColors[notification.type]} backdrop-blur-sm border rounded-lg shadow-lg min-w-[300px] max-w-md`}>
        {icons[notification.type]}
        <p className="flex-1 text-sm font-medium text-white">{notification.message}</p>
        <button
          onClick={hideNotification}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
