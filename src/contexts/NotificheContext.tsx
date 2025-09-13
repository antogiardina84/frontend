// frontend/src/contexts/NotificheContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notifica } from '../types';

interface NotificheContextType {
  notifiche: Notifica[];
  aggiungiNotifica: (notifica: Omit<Notifica, 'id' | 'timestamp' | 'letta'>) => void;
  rimuoviNotifica: (id: string) => void;
  marcaComeLetta: (id: string) => void;
  marcaTutteComeLette: () => void;
}

const NotificheContext = createContext<NotificheContextType | undefined>(undefined);

export const useNotifiche = () => {
  const context = useContext(NotificheContext);
  if (!context) {
    throw new Error('useNotifiche deve essere usato all\'interno di NotificheProvider');
  }
  return context;
};

interface NotificheProviderProps {
  children: ReactNode;
}

export const NotificheProvider: React.FC<NotificheProviderProps> = ({ children }) => {
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);

  const aggiungiNotifica = (notifica: Omit<Notifica, 'id' | 'timestamp' | 'letta'>) => {
    const nuovaNotifica: Notifica = {
      ...notifica,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      letta: false,
    };
    
    setNotifiche(prev => [nuovaNotifica, ...prev]);
    
    // Auto-rimuovi dopo 5 secondi per notifiche di successo
    if (notifica.tipo === 'success') {
      setTimeout(() => {
        rimuoviNotifica(nuovaNotifica.id);
      }, 5000);
    }
  };

  const rimuoviNotifica = (id: string) => {
    setNotifiche(prev => prev.filter(n => n.id !== id));
  };

  const marcaComeLetta = (id: string) => {
    setNotifiche(prev => 
      prev.map(n => n.id === id ? { ...n, letta: true } : n)
    );
  };

  const marcaTutteComeLette = () => {
    setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
  };

  return (
    <NotificheContext.Provider value={{
      notifiche,
      aggiungiNotifica,
      rimuoviNotifica,
      marcaComeLetta,
      marcaTutteComeLette,
    }}>
      {children}
    </NotificheContext.Provider>
  );
};