<script setup>
import { ref, onMounted } from 'vue'
import { parseAndTranslateApiError } from '@/utils/apiUtils'
import FloatingInput from './FloatingInput.vue';
import { useLocation } from '@/composables/useLocation.js'

const props = defineProps(['apiUrl'])
const emit = defineEmits(['login-success'])

const currentView = ref('login')
const feedback = ref({ message: '', type: '' })

const loginForm = ref({ username: '', password: '' })
const registerUserForm = ref({ name: '', username: '', password: '', phone: '', email: '', experience: '', education: '' })
const registerCompanyForm = ref({ name: '', business: '', username: '', password: '', street: '', number: '', city: '', state: '', email: '', phone: '' })

const { estados, cidades, carregarEstados, carregarCidades } = useLocation()

onMounted(() => {
  carregarEstados()
})

function carregarCidadesMain() {
  carregarCidades(registerCompanyForm.value.state)
}

function showMessage(msg, isError = false) {
  feedback.value = { message: msg, type: isError ? 'error' : 'success' }
}

// LOGIN
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

// REGISTER USER
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

// REGISTER COMPANY
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
        
        <FloatingInput 
          id="login-username" 
          label="Usuário" 
          v-model="loginForm.username" 
          required 
        />
        
        <FloatingInput 
          id="login-password" 
          label="Senha" 
          type="password" 
          v-model="loginForm.password" 
          required 
        />

        <button type="submit" class="primary full-width">Entrar</button>
      </form>
      <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
      <p class="switch-view">Não tem conta? <a @click="currentView = 'radioRegister'">Cadastre-se</a></p>
    </fieldset>

    <fieldset v-if="currentView === 'registerUser'" class="form-container">
      <legend>Novo Candidato</legend>
      <form @submit.prevent="handleRegisterUser">
        
        <FloatingInput id="cand-name" label="Nome Completo" v-model="registerUserForm.name" required />
        <FloatingInput id="cand-user" label="Username" v-model="registerUserForm.username" pattern="[A-Za-z0-9]+" required />
        <FloatingInput id="cand-pass" label="Senha" type="password" v-model="registerUserForm.password" pattern="[A-Za-z0-9]+" required />
        <FloatingInput id="cand-email" label="Email" type="email" v-model="registerUserForm.email" />
        <FloatingInput id="cand-phone" label="Telefone" v-model="registerUserForm.phone" />
        <FloatingInput id="cand-exp" label="Experiência" v-model="registerUserForm.experience" />
        <FloatingInput id="cand-edu" label="Educação" v-model="registerUserForm.education" />

        <button type="submit" class="primary full-width">Cadastrar</button>
      </form>
      <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
      <p class="switch-view"><a @click="currentView = 'login'">Voltar para Login</a></p>
    </fieldset>

    <fieldset v-if="currentView === 'registerCompany'" class="form-container">
      <legend>Nova Empresa</legend>
      <form @submit.prevent="handleRegisterCompany">
        
        <FloatingInput id="comp-name" label="Razão Social" v-model="registerCompanyForm.name" required />
        <FloatingInput id="comp-bus" label="Ramo" v-model="registerCompanyForm.business" required />
        <FloatingInput id="comp-user" label="Username" v-model="registerCompanyForm.username" pattern="[A-Za-z0-9]+" required />
        <FloatingInput id="comp-pass" label="Senha" type="password" v-model="registerCompanyForm.password" pattern="[A-Za-z0-9]+" required />
        <FloatingInput id="comp-email" label="Email" type="email" v-model="registerCompanyForm.email" required />
        <FloatingInput id="comp-phone" label="Telefone" v-model="registerCompanyForm.phone" required />
        <FloatingInput id="comp-street" label="Rua" v-model="registerCompanyForm.street" required />
        <FloatingInput id="comp-num" pattern="[0-9]+" label="Número" v-model="registerCompanyForm.number" required />

        <div class="input-group">
            <label>Estado:</label>
            <select v-model="registerCompanyForm.state" @change="carregarCidadesMain" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <option disabled value="">Selecione o Estado</option>
            <option v-for="uf in estados" :key="uf.id" :value="uf.sigla">
                {{ uf.sigla }} - {{ uf.nome }}
            </option>
            </select>
        </div>

        <div class="input-group">
            <label>Cidade:</label>
            <select v-model="registerCompanyForm.city" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <option disabled value="">Selecione a Cidade</option>
            <option v-for="city in cidades" :key="city.id" :value="city.nome">
                {{ city.nome }}
            </option>
            </select>
        </div>

        <button type="submit" class="primary full-width">Cadastrar Empresa</button>
      </form>

      <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>
      <p class="switch-view"><a @click="currentView = 'login'">Voltar para Login</a></p>
    </fieldset>
  </div>
</template>