<script setup>
import { ref, onMounted } from 'vue'
import { parseAndTranslateApiError } from '@/utils/apiUtils'

const props = defineProps(['apiUrl', 'token', 'userId'])

const applications = ref([])
const isLoading = ref(true)
const feedback = ref({ message: '', type: '' })

function showMessage(msg, isError = false) {
  feedback.value = { message: msg, type: isError ? 'error' : 'success' }
  setTimeout(() => { feedback.value = { message: '', type: '' } }, 5000)
}

async function fetchApplications() {
  isLoading.value = true
  try {
    const response = await fetch(`${props.apiUrl}/users/${props.userId}/jobs`, {
      headers: { 'Authorization': `Bearer ${props.token}` }
    })
    
    if (!response.ok) throw await response.json()
    
    const data = await response.json()
    applications.value = data.items || []
  } catch (error) {
    showMessage(`Erro ao carregar candidaturas: ${parseAndTranslateApiError(error)}`, true)
    applications.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div class="form-container">
    <h3>Minhas Candidaturas</h3>
    
    <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
    
    <p v-if="isLoading">Carregando suas candidaturas...</p>
    <p v-else-if="applications.length === 0">Você ainda não se candidatou a nenhuma vaga.</p>
    
    <div v-else class="applications-list">
      <div v-for="app in applications" :key="app.job_id" class="application-card">
        <h4>{{ app.title }}</h4>
        <p><strong>Empresa:</strong> {{ app.company }}</p>
        <p><strong>Área:</strong> {{ app.area }}</p>
        <p><strong>Local:</strong> {{ app.city }}, {{ app.state }}</p>
        <p v-if="app.salary"><strong>Salário:</strong> R$ {{ app.salary.toFixed(2) }}</p>
        <p><strong>Contato:</strong> {{ app.contact }}</p>
        
        <div v-if="app.feedback" class="feedback-received">
          <strong>📩 Feedback da Empresa:</strong>
          <p>{{ app.feedback }}</p>
        </div>
        <div v-else class="no-feedback">
          <p>⏳ Aguardando retorno da empresa...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.applications-list {
  display: grid;
  gap: 15px;
}

.application-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.application-card h4 {
  margin-top: 0;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 5px;
}

.application-card p {
  margin: 8px 0;
  font-size: 0.95em;
}

.feedback-received {
  margin-top: 15px;
  padding: 15px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
}

.feedback-received strong {
  color: #155724;
  display: block;
  margin-bottom: 8px;
}

.feedback-received p {
  margin: 0;
  color: #155724;
  font-style: italic;
}

.no-feedback {
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  text-align: center;
}

.no-feedback p {
  margin: 0;
  color: #856404;
  font-size: 0.9em;
}
</style>