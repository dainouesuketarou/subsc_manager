'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface GuestSubscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate: Date;
  subscribedAt: string;
  updatedAt: string;
}

interface GuestSubscriptionContextType {
  subscriptions: GuestSubscription[];
  addSubscription: (
    subscription: Omit<GuestSubscription, 'id' | 'subscribedAt' | 'updatedAt'>
  ) => void;
  updateSubscription: (
    id: string,
    subscription: Partial<GuestSubscription>
  ) => void;
  deleteSubscription: (id: string) => void;
  clearAllSubscriptions: () => void;
}

const GuestSubscriptionContext = createContext<
  GuestSubscriptionContextType | undefined
>(undefined);

export const useGuestSubscriptions = () => {
  const context = useContext(GuestSubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useGuestSubscriptions must be used within a GuestSubscriptionProvider'
    );
  }
  return context;
};

interface GuestSubscriptionProviderProps {
  children: ReactNode;
}

export const GuestSubscriptionProvider: React.FC<
  GuestSubscriptionProviderProps
> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<GuestSubscription[]>([]);

  useEffect(() => {
    // ローカルストレージからゲストサブスクリプションを復元
    const savedSubscriptions = localStorage.getItem('guestSubscriptions');
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, []);

  const saveToLocalStorage = (newSubscriptions: GuestSubscription[]) => {
    localStorage.setItem(
      'guestSubscriptions',
      JSON.stringify(newSubscriptions)
    );
  };

  const addSubscription = (
    subscription: Omit<GuestSubscription, 'id' | 'subscribedAt' | 'updatedAt'>
  ) => {
    const newSubscription: GuestSubscription = {
      ...subscription,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subscribedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSubscriptions = [...subscriptions, newSubscription];
    setSubscriptions(updatedSubscriptions);
    saveToLocalStorage(updatedSubscriptions);
  };

  const updateSubscription = (
    id: string,
    updates: Partial<GuestSubscription>
  ) => {
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === id
        ? { ...sub, ...updates, updatedAt: new Date().toISOString() }
        : sub
    );
    setSubscriptions(updatedSubscriptions);
    saveToLocalStorage(updatedSubscriptions);
  };

  const deleteSubscription = (id: string) => {
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id);
    setSubscriptions(updatedSubscriptions);
    saveToLocalStorage(updatedSubscriptions);
  };

  const clearAllSubscriptions = () => {
    setSubscriptions([]);
    localStorage.removeItem('guestSubscriptions');
  };

  const value: GuestSubscriptionContextType = {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    clearAllSubscriptions,
  };

  return (
    <GuestSubscriptionContext.Provider value={value}>
      {children}
    </GuestSubscriptionContext.Provider>
  );
};
