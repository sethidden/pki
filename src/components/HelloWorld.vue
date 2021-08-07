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

type Encryptions = "public" | "private" | null

const keys = keypair();
const rsa_public = forge.pki.publicKeyFromPem(keys.public)
const rsa_private = forge.pki.privateKeyFromPem(keys.private)

const publicKey = {
  element: ref(null),
  onCrypt: () => {
    //this is just moronic, but I just want to see the basic premise of the app work
    // TODO: Actually decrypt instead of storing the plaintext in initialText
    const currentEncryptionState = text.encryptedWith;
    if(currentEncryptionState.value === 'private') {
      currentEncryptionState.value = null;
    } else {
      currentEncryptionState.value = 'public';
    }
   },
}
const privateKey = {
  element: ref(null),
  onCrypt: () => {
    const currentEncryptionState = text.encryptedWith;
    if(currentEncryptionState.value === 'public') {
      currentEncryptionState.value = null;
    } else {
      currentEncryptionState.value = 'private';
    }
  },
}
const text = {
  element: ref(null),
  encryptedWith: ref<Encryptions>(null),
}
const isEncrypted = computed(() => text.encryptedWith.value !== null)
const initialText = "Hello world!"
const content = computed(() => {

  //lmao WHAT
  const messageDigest = forge.md.sha256.create();
  messageDigest.update(initialText, 'utf8')

  const mapEncryptionToMessage = new Map<Encryptions, string>([
    //encrypt with private key = sign, though "encrypt with private key" is an oxymoron
    ['private', rsa_private.sign(messageDigest)],
    // holy shit, encrypting several times with the same plaintext
    // and the same public key generates different ciphertext
    // for each try
    // https://crypto.stackexchange.com/questions/26249/why-are-rsa-ciphertexts-different-for-the-same-plaintext?newreg=2e75fccbf99b4399829892ed1d66ed77
    ['public', rsa_public.encrypt(initialText)],
    [null, initialText]
  ])
  const value = mapEncryptionToMessage.get(text.encryptedWith.value);
  return value;
})

const publicKeyDragger = useDragAndDrop(publicKey.element, text.element, publicKey.onCrypt )
const privateKeyDragger = useDragAndDrop(privateKey.element, text.element, privateKey.onCrypt)

const isAnyDragged = computed(() => [publicKeyDragger.isDragging.value , privateKeyDragger.isDragging.value].some(x=>x))
</script>
