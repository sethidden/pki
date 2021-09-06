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
import keypair, {KeypairResults} from 'keypair'
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

class Keypair {
  #keypair : KeypairResults;
  #privateRsa : forge.pki.rsa.PrivateKey;
  #publicRsa : forge.pki.rsa.PublicKey;

  constructor(keypair: KeypairResults) {
    this.#keypair = keypair; 
    this.#publicRsa = forge.pki.publicKeyFromPem(keypair.public);
    this.#privateRsa = forge.pki.privateKeyFromPem(keypair.private);
  }

  get publicKeyRsa() {
    return this.#publicRsa;
  }

  get privateKeyRsa() {
    return this.#privateRsa;
  }
}

const kp = new Keypair(keypair());

const publicKey = {
  element: ref(null),
  rsa: kp.publicKeyRsa,
}
const privateKey = {
  element: ref(null),
  rsa: kp.privateKeyRsa,
}

const text = {
  element: ref(null),
  encryptedWith: ref<Encryptions>('plain'),
  initial: 'Hello world!'
}

const isEncrypted = computed(() => text.encryptedWith.value !== 'plain');

const content = computed(() => {
  const messageDigest = forge.md.sha256.create();
  messageDigest.update(text.initial, 'utf8')

  return R.cond<any, any>([
    [R.equals('withPrivate'), R.always(kp.privateKeyRsa.sign(messageDigest))],
    [R.equals('withPublic'), R.always(kp.publicKeyRsa.encrypt(text.initial))],
    [R.equals('plain'), R.always(text.initial)]
  ])(text.encryptedWith.value);
})

const onDragAndDropOnText = R.curry(useDragAndDrop)(text.element);
const setEncryptedValue = (key: Key) => () => {text.encryptedWith.value = getEncryptionState(key, text.encryptedWith.value)}

const publicKeyDragger = 
  onDragAndDropOnText(publicKey.element, setEncryptedValue('public'));

const privateKeyDragger = 
  onDragAndDropOnText(privateKey.element, setEncryptedValue('private'))

const isAnyDragged = computed(() => R.all(R.equals(true))([publicKeyDragger.isDragging.value , privateKeyDragger.isDragging.value]));
</script>
