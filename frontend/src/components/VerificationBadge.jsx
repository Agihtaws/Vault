import { useVerification } from '../hooks/useVerification';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export const VerificationBadge = () => {
  const { isVerified, verificationStatus } = useVerification();

  if (!verificationStatus) {
    return null;
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-success-900/30 border border-success-500/50 rounded-lg">
        <CheckCircleIcon className="w-4 h-4 text-success-400 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-success-100 whitespace-nowrap">Verified</span>
          <span className="text-[10px] text-success-300">{verificationStatus.version}</span>
        </div>
      </div>
    );
  }

  if (verificationStatus.error === 'Unverified frontend') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-900/30 border border-danger-500/50 rounded-lg">
        <XCircleIcon className="w-4 h-4 text-danger-400 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-danger-100 whitespace-nowrap">Unverified</span>
          <span className="text-[10px] text-danger-300">Not registered</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-yellow-100 whitespace-nowrap">Pending</span>
        <span className="text-[10px] text-yellow-300">Not registered</span>
      </div>
    </div>
  );
};
