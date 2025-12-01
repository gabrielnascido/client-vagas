<script setup>
import { ref } from 'vue'
import { parseAndTranslateApiError } from '@/utils/apiUtils'

const emit = defineEmits(['connected'])

const serverIp = ref('localhost')
const serverPort = ref(21234)
const feedback = ref({ message: '', type: '' })

async function handleConnect() {
  const tempApiUrl = `http://${serverIp.value}:${serverPort.value}`
  feedback.value = { message: 'Tentando conectar...', type: '' }
  
  try {
    const response = await fetch(tempApiUrl + '/login', { method: 'OPTIONS' })
    
    emit('connected', tempApiUrl)
  } catch (error) {
    feedback.value = { message: parseAndTranslateApiError(error.message), type: 'error' }
  }
}
</script>

<template>
  <fieldset class="form-container">
    <legend>Conectar ao Servidor</legend>
    <form @submit.prevent="handleConnect" class="connect-form">
      <input type="text" v-model="serverIp" placeholder="IP do Servidor" required />
      <input type="number" v-model="serverPort" placeholder="Porta" required />
      <button type="submit" class="primary">Conectar</button>
    </form>
    <div v-if="feedback.message" :class="['response', feedback.type]">
      <p v-html="feedback.message"></p>
    </div>
  </fieldset>
</template>

<style scoped>
.connect-form { display: flex; gap: 10px; align-items: center; }
.connect-form input { flex-grow: 1; margin-bottom: 0; }
.connect-form button { flex-shrink: 0; }
</style>