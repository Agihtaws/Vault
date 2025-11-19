import { calculatePasswordStrength } from '../utils/encryption';

export const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  const colors = {
    danger: 'bg-danger-500',
    warning: 'bg-yellow-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
  };

  const widths = {
    1: 'w-1/4',
    2: 'w-2/4',
    3: 'w-3/4',
    4: 'w-full',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Password Strength</span>
        <span className={`text-xs font-medium text-${strength.color}-400`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[strength.color]} ${widths[strength.score]} transition-all duration-300`}
        />
      </div>
    </div>
  );
};
