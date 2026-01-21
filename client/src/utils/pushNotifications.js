const VAPID_PUBLIC_KEY = 'BPt5RmrEgAE4yB5jipE3A1Y4kbjPVBkvKN_0HS0dQfoBr9pVgt03n2oMxPQdyTEAiYKPixtTiQzIUeBGOMHqa7M'; // Should match server

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
          // If no SW ready, maybe register one? usually main.jsx does it.
          // But let's assume it's registered.
          console.error('Service Worker not ready');
          return;
      }

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log('User Subscribed:', subscription);

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if available (e.g. from localStorage)
           // 'Authorization': `Bearer ${token}` 
           // Since we use httpOnly cookies for session, credentials: 'include' is key if using fetch, 
           // but here we are using a simple fetch. 
           // If we use axios withCredentials: true, it works.
        },
      });
      
      return subscription;

    } catch (error) {
        if (Notification.permission === 'denied') {
            console.warn('Permission for notifications was denied');
        } else {
            console.error('Failed to subscribe the user: ', error);
        }
        throw error;
    }
  } else {
      console.warn('Push messaging is not supported');
  }
}
