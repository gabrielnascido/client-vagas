<script setup>
import { ref } from 'vue'
import { parseAndTranslateApiError } from '@/utils/apiUtils'

const props = defineProps(['apiUrl'])
const emit = defineEmits(['login-success'])

const currentView = ref('login')
const feedback = ref({ message: '', type: '' })

// Formulários
const loginForm = ref({ username: '', password: '' })
const registerUserForm = ref({ name: '', username: '', password: '', phone: '', email: '', experience: '', education: '' })
const registerCompanyForm = ref({ name: '', business: '', username: '', password: '', street: '', number: '', city: '', state: '', email: '', phone: '' })

function showMessage(msg, isError = false) {
  feedback.value = { message: msg, type: isError ? 'error' : 'success' }
}

async function handleLogin() {
  try {
    const response = await fetch(`${props.apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value),
    })
    
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw err
    }
    
    const data = await response.json()
    // decodifica o payload do JWT para pegar ID e Role
    const payload = JSON.parse(atob(data.token.split('.')[1]))
    
    emit('login-success', {
      token: data.token,
      userId: payload.sub,
      role: payload.role
    })
  } catch (error) {
    showMessage(`Erro no login: ${parseAndTranslateApiError(error)}`, true)
  }
}

// --- FUNÇÃO ESPECÍFICA PARA USUÁRIO ---
async function handleRegisterUser() {
  try {
    const response = await fetch(`${props.apiUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerUserForm.value), 
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Cadastro de Candidato realizado! Faça login.')
    registerUserForm.value = {}
    setTimeout(() => {
        currentView.value = 'login'
        feedback.value = {}
    }, 2000)
  } catch (error) {
    showMessage(`Erro no cadastro:<br>${parseAndTranslateApiError(error)}`, true)
  }
}

// --- FUNÇÃO ESPECÍFICA PARA EMPRESA ---
async function handleRegisterCompany() {
  try {
    const response = await fetch(`${props.apiUrl}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerCompanyForm.value),
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Cadastro de Empresa realizado! Faça login.')
    registerCompanyForm.value = {} 
    setTimeout(() => {
        currentView.value = 'login'
        feedback.value = {}
    }, 2000)
  } catch (error) {
    showMessage(`Erro no cadastro:<br>${parseAndTranslateApiError(error)}`, true)
  }
}
</script>

<template>
  <div>
    <fieldset v-if="currentView === 'radioRegister'" class="form-container">
      <legend>Tipo de conta</legend>
      <div class="button-group">
        <button @click="currentView = 'registerCompany'" class="action-btn">Empresa</button>
        <button @click="currentView = 'registerUser'" class="secondary">Candidato</button>
      </div>
      <p class="switch-view">Já tem conta? <a @click="currentView = 'login'">Login</a></p>
    </fieldset>

    <fieldset v-if="currentView === 'login'" class="form-container">
      <legend>Autenticação</legend>
      <form @submit.prevent="handleLogin">
        <input v-model="loginForm.username" type="text" placeholder="Usuário" required />
        <input v-model="loginForm.password" type="password" placeholder="Senha" required />
        <button type="submit" class="primary full-width">Entrar</button>
      </form>
      <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
      <p class="switch-view">Não tem conta? <a @click="currentView = 'radioRegister'">Cadastre-se</a></p>
    </fieldset>

    <fieldset v-if="currentView === 'registerUser'" class="form-container">
      <legend>Novo Candidato</legend>
      <form @submit.prevent="handleRegisterUser">
        <input v-model="registerUserForm.name" placeholder="Nome Completo" required />
        <input v-model="registerUserForm.username" placeholder="Username" required />
        <input v-model="registerUserForm.password" type="password" placeholder="Senha" required />
        <input v-model="registerUserForm.email" type="email" placeholder="Email" />
        <input v-model="registerUserForm.phone" placeholder="Telefone" required />
        <input v-model="registerUserForm.experience" placeholder="Experiência" />
        <input v-model="registerUserForm.education" placeholder="Educação" />
        <button type="submit" class="primary full-width">Cadastrar</button>
      </form>
      <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
      <p class="switch-view"><a @click="currentView = 'login'">Voltar para Login</a></p>
    </fieldset>

    <fieldset v-if="currentView === 'registerCompany'" class="form-container">
        <legend>Nova Empresa</legend>
        <form @submit.prevent="handleRegisterCompany">
            <input v-model="registerCompanyForm.name" placeholder="Razão Social" required />
            <input v-model="registerCompanyForm.business" placeholder="Ramo" required />
            <input v-model="registerCompanyForm.username" placeholder="Username" required />
            <input v-model="registerCompanyForm.password" type="password" placeholder="Senha" required />
            <input v-model="registerCompanyForm.email" type="email" placeholder="Email" required />
            <input v-model="registerCompanyForm.phone" placeholder="Telefone" required />
            <input v-model="registerCompanyForm.street" placeholder="Rua" required />
            <input v-model="registerCompanyForm.number" placeholder="Número" required />
            <input v-model="registerCompanyForm.city" placeholder="Cidade" required />
            <input v-model="registerCompanyForm.state" placeholder="Estado (UF)" required maxlength="2"/>
            <button type="submit" class="primary full-width">Cadastrar Empresa</button>
        </form>
        <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
        <p class="switch-view"><a @click="currentView = 'login'">Voltar para Login</a></p>
    </fieldset>
  </div>
</template>