import CryptoJS from 'crypto-js';

export const encryptVault = (vaultData, masterPassword) => {
  try {
    const jsonString = JSON.stringify(vaultData);
    const encrypted = CryptoJS.AES.encrypt(jsonString, masterPassword).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt vault');
  }
};

export const decryptVault = (encryptedData, masterPassword) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, masterPassword);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      throw new Error('Invalid password');
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt vault - incorrect password');
  }
};

export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

export const generateSecurePassword = (length = 16, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true
  } = options;

  let charset = '';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset.length === 0) {
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }

  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
};

export const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  if (strength <= 2) return { score: 1, label: 'Weak', color: 'danger' };
  if (strength <= 4) return { score: 2, label: 'Fair', color: 'warning' };
  if (strength <= 5) return { score: 3, label: 'Good', color: 'primary' };
  return { score: 4, label: 'Strong', color: 'success' };
};
