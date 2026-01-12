
export const notificationService = {
  requestPermission: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return 'denied';
    }
    return await Notification.requestPermission();
  },

  send: (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://picsum.photos/128/128'
      });
    }
  },

  checkPermission: (): NotificationPermission => {
    return Notification.permission;
  }
};
