<template>
  <ul v-if="visible" class="context-menu" :style="{ top: y + 'px', left: x + 'px' }">
    <li v-for="(act, index) in actions" :key="index" class="context-menu-item" @click="act.action()">
      {{ act.icon }}<span class="context-menu-label">{{ act.label }}</span>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

export type MenuItem = {
  icon: string
  label: string
  action: () => void
}

const { visible, x, y, actions } = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  actions: {
    type: Array as PropType<MenuItem[]>,
    default: [],
  },
})
</script>

<style scoped>
.context-menu {
  position: absolute;
  z-index: 1000;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 150px;
  list-style: none;
}

.context-menu-item {
  padding: 8px 12px;
  cursor: pointer;
}

.context-menu-item:hover {
  background-color: #f0f0f0;
}

.context-menu-label {
  margin-left: 8px;
}
</style>
