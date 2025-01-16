
  <!-- components/Notifications.vue -->
  <script setup lang="ts">
  import { useNuxtApp } from '#app'
  
  const { $notifications } = useNuxtApp()
  const notifications = $notifications.list
  const removeNotification = $notifications.remove
  </script>
<template>
  <div class="notifications-container">
    <TransitionGroup name="notification">
      <div class="z-9999 text-[#94a3b8]">
        <div v-for="notification in notifications" :key="notification.id" :class="notification.type" class="z-9999 text-lg w-full flex items-center justify-center py-px">
            <div class="bg-[#182235] text-[#94a3b8] px-4 py-2 z-9999 rounded-full flex items-center space-x-2 border border-[#2680eb]">
                <icon :name="notification.icon"></icon>
                <span class="message z-9999">{{ notification.message }}</span>
                <button class="text-[#94a3b8] focus:outline-none" @click="removeNotification(notification.id)">
                    <icon name="material-symbols:close-rounded"></icon>
                </button>
            </div>
        </div>
    </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  /* Very high z-index to ensure it's above all other elements */
  z-index: 9999;
  /* Pointer events to ensure clicks work */
  pointer-events: auto;
  /* Maximum width for notifications */
  max-width: 400px;
  /* Ensure it's above modal overlays */
  isolation: isolate;
}

.notification {
  padding: 12px 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  
  /* Prevent text selection */
  user-select: none;
  
  /* Ensure notification is clickable */
  pointer-events: auto;
}

.message {
  flex-grow: 1;
  margin-right: 8px;
}

.close-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.success {
  color: white;
}

.error {
  background: rgba(244, 67, 54, 0.95);
  color: white;
}

.info {
  background: rgba(33, 150, 243, 0.95);
  color: white;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
  