import { useState } from 'react';
import { generateSecurePassword } from '../utils/encryption';
import { useClipboard } from '../hooks/useClipboard';
import { ArrowPathIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export const PasswordGenerator = ({ onGenerate }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { copyToClipboard } = useClipboard();

  const handleGenerate = () => {
    const password = generateSecurePassword(length, options);
    setGeneratedPassword(password);
    if (onGenerate) {
      onGenerate(password);
    }
  };

  const handleCopy = () => {
    if (generatedPassword) {
      copyToClipboard(generatedPassword, 'Password copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={generatedPassword}
          readOnly
          placeholder="Generated password will appear here"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary-500"
        />
        <button
          onClick={handleCopy}
          disabled={!generatedPassword}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Copy password"
        >
          <ClipboardDocumentIcon className="w-5 h-5 text-gray-300" />
        </button>
        <button
          onClick={handleGenerate}
          className="p-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          title="Generate password"
        >
          <ArrowPathIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Length: {length}
          </label>
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">Symbols (!@#$)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
