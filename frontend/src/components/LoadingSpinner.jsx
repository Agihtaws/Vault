import { useUIStore } from '../store/useStore';

export const LoadingSpinner = () => {
  const { isLoading, loadingMessage } = useUIStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 px-8 py-6 bg-gray-900 border border-primary-500/30 rounded-xl shadow-2xl">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary-200/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        {loadingMessage && (
          <p className="text-sm font-medium text-primary-100">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
};
