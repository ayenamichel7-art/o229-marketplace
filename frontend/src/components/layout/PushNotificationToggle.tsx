'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { toast } from 'sonner';

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      setIsLoading(false);
    }

    checkSubscription();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        toast.info('Notifications désactivées');
      } else {
        await subscribeToPush();
        setIsSubscribed(true);
        toast.success('Notifications activées !', {
          description: 'Vous recevrez désormais des alertes pour vos annonces.'
        });
      }
    } catch (error: any) {
      console.error('Push Toggle Error:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de configurer les notifications.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!('PushManager' in window)) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`btn btn-circle btn-sm ${isSubscribed ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-ghost text-base-content/40'}`}
      title={isSubscribed ? 'Désactiver les notifications' : 'Activer les notifications push'}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : isSubscribed ? (
        <BellRing size={18} />
      ) : (
        <Bell size={18} />
      )}
    </button>
  );
}
