<template>
<div class="flex">
  <span ref="publicKeyElement" :style="publicDragPosition">
    <IconKey />
    <IconGlobe />
    Public key
  </span>
  <span ref="privateKeyElement" :style="privateDragPosition">
    <IconKey />
    <IconUserSecret />
    Private key
  </span>
</div>
<div ref="textElement">{{ textContent }}</div>
</template>

<script setup lang="ts">
import IconKey from 'virtual:vite-icons/fa-solid/key'
import IconGlobe from 'virtual:vite-icons/fa-solid/globe'
import IconUserSecret from 'virtual:vite-icons/fa-solid/user-secret'
import {useMouseInElement, useMousePressed} from '@vueuse/core'
import {useDragAndDrop} from '../logics/useDragAndDrop'
import { computed, ref, watch } from 'vue'

const publicKeyElement = ref(null)
const privateKeyElement = ref(null)
const textElement = ref(null)
const textContent = ref('Hello World!')

const {dragPosition: publicDragPosition} = useDragAndDrop(publicKeyElement, textElement, () => {textContent.value = '3ncrypt3d (with public)'} )
const {dragPosition: privateDragPosition} = useDragAndDrop(privateKeyElement, textElement, () => (textContent.value = '3ncrypt3d (with private)') )
</script>

<style>
* {
  user-select: none;
}
.flex {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
