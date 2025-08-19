'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { SubscriptionData } from '../../types/subscription';

interface GuestSubscriptionContextType {
  subscriptions: SubscriptionData[];
  addSubscription: (
    subscription: Omit<
      SubscriptionData,
      'id' | 'userId' | 'createdAt' | 'updatedAt' | 'subscribedAt'
    >
  ) => void;
  updateSubscription: (
    id: string,
    subscription: Partial<SubscriptionData>
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
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);

  useEffect(() => {
    // ローカルストレージからゲストサブスクリプションを復元
    const savedSubscriptions = localStorage.getItem('guestSubscriptions');
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, []);

  const saveToLocalStorage = (newSubscriptions: SubscriptionData[]) => {
    localStorage.setItem(
      'guestSubscriptions',
      JSON.stringify(newSubscriptions)
    );
  };

  const addSubscription = (
    subscription: Omit<
      SubscriptionData,
      'id' | 'userId' | 'createdAt' | 'updatedAt' | 'subscribedAt'
    >
  ) => {
    const now = new Date();
    const newSubscription: SubscriptionData = {
      ...subscription,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'guest',
      createdAt: now,
      updatedAt: now,
      subscribedAt: now,
    };

    const updatedSubscriptions = [...subscriptions, newSubscription];
    setSubscriptions(updatedSubscriptions);
    saveToLocalStorage(updatedSubscriptions);
  };

  const updateSubscription = (
    id: string,
    updates: Partial<SubscriptionData>
  ) => {
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === id ? { ...sub, ...updates, updatedAt: new Date() } : sub
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
