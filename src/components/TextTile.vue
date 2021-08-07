
<template>
  <span 
    ref="publicKeyElement" 
    class="
      flex
      border-2 
      p-8
      bg-white
      rounded-lg
      border-dashed
    "
    :class="props.attention ? ['bg-red-200 animate-pulse'] : ['']"
  >
    <component :is="encrypted ? IconLock : IconUnlockAlt"/>
    <slot/>
  </span>
 
</template>

<script setup>
import IconLock from 'virtual:vite-icons/fa-solid/lock'
import IconUnlockAlt from 'virtual:vite-icons/fa-solid/unlock-alt'
const props = defineProps({
  attention: Boolean,
  encrypted: Boolean,
})
</script>
