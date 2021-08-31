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
<TextTile :ref="el => text.element.value = el" :attention="isAnyDragged" :encrypted="isEncrypted" class="z-0">
  {{ content }}
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
import keypair from 'keypair'
import forge from 'node-forge';
import * as R from 'ramda'

type Key = 'public' | 'private'
type Encryptions = "withPublic" | "withPrivate" | "plain"


const getEncryptionState = (appliedKey: Key, currentEncryptionState: Encryptions) => 
  R.cond<any, Encryptions>([
    [
      R.equals(['public', 'plain']),
      R.always('withPublic')
    ],
    [
      R.equals(['public', 'withPublic']), 
      R.always('withPublic')
    ],
    [
      R.equals(['public', 'withPrivate']), 
      R.always('plain')
    ],
    [
      R.equals(['private', 'plain']), 
      R.always('withPrivate')
    ],
    [
      R.equals(['private', 'withPublic']), 
      R.always('plain')
    ],
    [
      R.equals(['private', 'withPrivate']), 
      R.always('withPrivate')
    ],
  ])([appliedKey, currentEncryptionState]);

const keys = keypair();

const publicKey = {
  element: ref(null),
  rsa: forge.pki.publicKeyFromPem(keys.public),
}
const privateKey = {
  element: ref(null),
  rsa: forge.pki.privateKeyFromPem(keys.private),
}

const text = {
  element: ref(null),
  encryptedWith: ref<Encryptions>('plain'),
}
const initialText = "Hello world!"

const isEncrypted = computed(() => text.encryptedWith.value !== 'plain');

const content = computed(() => {
  const messageDigest = forge.md.sha256.create();
  messageDigest.update(initialText, 'utf8')

  return R.cond<any, any>([
    [R.equals('withPrivate'), R.always(privateKey.rsa.sign(messageDigest))],
    [R.equals('withPublic'), R.always(publicKey.rsa.encrypt(initialText))],
    [R.equals('plain'), R.always(initialText)]
  ])(text.encryptedWith.value);
})

const onDragAndDropOnText = R.curry(useDragAndDrop)(text.element);
const publicKeyDragger = 
  onDragAndDropOnText
    (publicKey.element, () => {text.encryptedWith.value = getEncryptionState('public', text.encryptedWith.value)});

const privateKeyDragger = 
  onDragAndDropOnText
    (privateKey.element, () => {text.encryptedWith.value = getEncryptionState('private', text.encryptedWith.value)})

const isAnyDragged = computed(() => [publicKeyDragger.isDragging.value , privateKeyDragger.isDragging.value].some(x=>x))
</script>
