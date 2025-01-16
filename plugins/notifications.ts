// plugins/notifications.ts
import { defineNuxtPlugin, useState } from '#app'

export interface Notification {
  id: number
  message: string
  icon?: string
  type: 'success' | 'error' | 'info'
  timeout?: number
}

export default defineNuxtPlugin((nuxtApp) => {
  const notifications = useState<Notification[]>('notifications', () => [])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now()
    const newNotification = { ...notification, id }
    notifications.value.push(newNotification)

    if (notification.timeout) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.timeout)
    }

    return id
  }

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    provide: {
      notifications: {
        add: addNotification,
        remove: removeNotification,
        list: notifications
      }
    }
  }
})