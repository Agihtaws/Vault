import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create((set) => ({
  address: null,
  isConnected: false,
  chainId: null,
  setAddress: (address) => set({ address, isConnected: !!address }),
  setChainId: (chainId) => set({ chainId }),
  disconnect: () => set({ address: null, isConnected: false, chainId: null }),
}));

export const useVaultStore = create((set, get) => ({
  vault: null,
  isUnlocked: false,
  masterPasswordHash: null,
  masterPassword: null, 
  currentCID: null,
  lastUpdated: null,
  
  setVault: (vault) => set({ vault, isUnlocked: true }),
  
  updateVault: (vault) => set({ vault }),
  
  setMasterPasswordHash: (hash) => set({ masterPasswordHash: hash }),
  
  setMasterPassword: (password) => set({ masterPassword: password }), // Add this
  
  setCID: (cid) => set({ currentCID: cid }),
  
  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
  
  lockVault: () => set({ 
    vault: null, 
    isUnlocked: false, 
    masterPasswordHash: null,
    masterPassword: null 
  }),
  
  addPassword: (passwordEntry) => {
    const { vault } = get();
    if (!vault) return;
    
    const updatedVault = {
      ...vault,
      passwords: [...vault.passwords, passwordEntry],
    };
    
    set({ vault: updatedVault });
    return updatedVault;
  },
  
  updatePassword: (id, updatedEntry) => {
    const { vault } = get();
    if (!vault) return;
    
    const updatedVault = {
      ...vault,
      passwords: vault.passwords.map(p => 
        p.id === id ? { ...p, ...updatedEntry, updatedAt: Date.now() } : p
      ),
    };
    
    set({ vault: updatedVault });
    return updatedVault;
  },
  
  deletePassword: (id) => {
    const { vault } = get();
    if (!vault) return;
    
    const updatedVault = {
      ...vault,
      passwords: vault.passwords.filter(p => p.id !== id),
    };
    
    set({ vault: updatedVault });
    return updatedVault;
  },
  
  getPasswordById: (id) => {
    const { vault } = get();
    if (!vault) return null;
    return vault.passwords.find(p => p.id === id);
  },
  
  searchPasswords: (query) => {
    const { vault } = get();
    if (!vault) return [];
    
    const lowerQuery = query.toLowerCase();
    return vault.passwords.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.username.toLowerCase().includes(lowerQuery) ||
      p.url.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  },
  
  getPasswordsByCategory: (category) => {
    const { vault } = get();
    if (!vault) return [];
    return vault.passwords.filter(p => p.category === category);
  },
}));


export const useUIStore = create((set) => ({
  theme: 'dark',
  isLoading: false,
  loadingMessage: '',
  notification: null,
  modal: null,
  
  setTheme: (theme) => set({ theme }),
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  
  setLoading: (isLoading, message = '') => set({ 
    isLoading, 
    loadingMessage: message 
  }),
  
  showNotification: (notification) => set({ notification }),
  
  hideNotification: () => set({ notification: null }),
  
  openModal: (modal) => set({ modal }),
  
  closeModal: () => set({ modal: null }),
}));

export const useVerificationStore = create((set) => ({
  isVerified: false,
  verificationStatus: null,
  currentVersion: null,
  
  setVerified: (isVerified, status) => set({ 
    isVerified, 
    verificationStatus: status 
  }),
  
  setCurrentVersion: (version) => set({ currentVersion: version }),
  
  resetVerification: () => set({ 
    isVerified: false, 
    verificationStatus: null,
    currentVersion: null 
  }),
}));

export const useSessionStore = create(
  persist(
    (set) => ({
      autoLockMinutes: 15,
      clearClipboardSeconds: 30,
      lastActivity: Date.now(),
      
      setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
      
      setClearClipboardSeconds: (seconds) => set({ clearClipboardSeconds: seconds }),
      
      updateActivity: () => set({ lastActivity: Date.now() }),
      
      shouldLock: (autoLockMinutes) => {
        const now = Date.now();
        const lastActivity = useSessionStore.getState().lastActivity;
        const diff = now - lastActivity;
        return diff > autoLockMinutes * 60 * 1000;
      },
    }),
    {
      name: 'vaultlink-session',
    }
  )
);
