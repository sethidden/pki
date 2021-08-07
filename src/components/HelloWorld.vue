<template>
<div class="flex flex-row mb-10 w-100">
  <KeyTile :ref="el => publicKey.element.value = el" :style="publicKeyDragger.dragPosition.value" class="mr-auto select-none z-10">
    <span class="flex flex-row gap-1">
      <IconKey />
      <IconGlobe class="text-green-500" />
      Public key
    </span>
  </KeyTile>
  <KeyTile :ref="el => privateKey.element.value = el" :style="privateKeyDragger.dragPosition.value" class="ml-auto select-none z-10">
    <span class="flex flex-row gap-1">
      <IconKey />
      <IconUserSecret />
      Private key
    </span>
  </KeyTile>
</div>
<TextTile :ref="el => text.element.value = el" :attention="isAnyDragged" class="z-0">
  {{ text.content.value }}
</TextTile>
</template>

<script setup lang="ts">
import IconKey from 'virtual:vite-icons/fa-solid/key'
import IconGlobe from 'virtual:vite-icons/fa-solid/globe'
import IconUserSecret from 'virtual:vite-icons/fa-solid/user-secret'
import KeyTile from './KeyTile.vue'
import TextTile from './TextTile.vue'
import {useMouseInElement, useMousePressed} from '@vueuse/core'
import {useDragAndDrop} from '../logics/useDragAndDrop'
import { computed, ref } from 'vue'

const publicKey = {
  element: ref(null),
  onCrypt: () => {text.content.value = '3ncrypt3d (with public)'},
}
const privateKey = {
  element: ref(null),
  onCrypt: () => {text.content.value = '3ncrypt3d (with private)'},
}
const text = {
  element: ref(null),
  content: ref('Hello World!'),
}

const publicKeyDragger = useDragAndDrop(publicKey.element, text.element, publicKey.onCrypt )
const privateKeyDragger = useDragAndDrop(privateKey.element, text.element, privateKey.onCrypt)

const isAnyDragged = computed(() => [publicKeyDragger.isDragging.value , privateKeyDragger.isDragging.value].some(x=>x))
</script>
