<script setup>
import { ref } from 'vue'
import ConnectServer from './components/ConnectServer.vue'
import AuthManager from './components/AuthManager.vue'
import UserProfile from './components/UserProfile.vue'
import JobsManager from './components/JobsManager.vue'
import UserApplications from './components/UserApplications.vue'

const apiUrl = ref('')
const jwtToken = ref(null)
const userId = ref(null)
const userRole = ref(null)
const currentTab = ref('profile') 

function handleConnected(url) {
  apiUrl.value = url
}

function handleLoginSuccess(authData) {
  jwtToken.value = authData.token
  userId.value = authData.userId
  userRole.value = authData.role
}

async function handleLogout() {
  try {
    if (apiUrl.value && jwtToken.value) {
      await fetch(`${apiUrl.value}/logout`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken.value}` 
        },
      })
    }
  } catch (error) {
    console.warn("Aviso: O backend não respondeu ao logout ou já estava desconectado.", error)
  } finally {
    jwtToken.value = null
    userId.value = null
    userRole.value = null
    currentTab.value = 'profile'
  }
}
</script>

<template>
  <main>
    <h1>Cliente da API de Vagas</h1>

    <ConnectServer 
      v-if="!apiUrl" 
      @connected="handleConnected" 
    />

    <AuthManager 
      v-else-if="!jwtToken" 
      :api-url="apiUrl" 
      @login-success="handleLoginSuccess" 
    />

    <div v-else>
      <nav class="nav-tabs">
        <button :class="{ active: currentTab === 'profile' }" @click="currentTab = 'profile'">Meu Perfil</button>
        <button :class="{ active: currentTab === 'jobs' }" @click="currentTab = 'jobs'">Vagas</button>
        
        <button 
          v-if="userRole === 'comum'" 
          :class="{ active: currentTab === 'apps' }" 
          @click="currentTab = 'apps'"
        >
          Minhas Candidaturas
        </button>
      </nav>

      <UserProfile 
        v-if="currentTab === 'profile'"
        :api-url="apiUrl"
        :token="jwtToken"
        :user-id="userId"
        :user-role="userRole"
        @logout="handleLogout"
        @account-deleted="handleLogout"
      />

      <JobsManager 
        v-if="currentTab === 'jobs'"
        :api-url="apiUrl"
        :token="jwtToken"
        :user-id="userId"
        :user-role="userRole"
      />
      
      <UserApplications
        v-if="currentTab === 'apps'"
        :api-url="apiUrl"
        :token="jwtToken"
        :user-id="userId"
      />
    </div>
  </main>
</template>

<style>
/* --- Variáveis Globais --- */
:root {
  --color-primary: #007bff;
  --color-primary-dark: #0056b3;
  --color-secondary: #6c757d;
  --color-secondary-dark: #5a6268;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-background: #f8f9fa;
  --color-white: #ffffff;
  --color-border: #ced4da;
  --color-shadow: rgba(0, 0, 0, 0.1);
}

/* --- Estilos Gerais de Layout --- */
main {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px; 
  margin: 40px auto;
  padding: 30px;
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--color-shadow);
}

h1 {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: 30px;
  font-size: 2em;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 10px;
}

h3 {
  color: #343a40;
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

/* --- Containers de Formulário --- */
.form-container {
  margin-top: 25px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 25px;
  background-color: var(--color-white);
  box-shadow: 0 2px 8px var(--color-shadow);
}

legend {
  font-weight: 600;
  font-size: 1.3em;
  padding: 0 15px;
  color: #343a40;
}

/* --- Inputs e Labels --- */
input, select {
  margin-bottom: 15px;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  transition: border-color 0.3s, box-shadow 0.3s;
  font-size: 1em;
}

input:focus, select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

/* --- Botões --- */
button {
  padding: 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  color: var(--color-white);
  font-weight: 600;
  transition: background-color 0.3s, opacity 0.3s, transform 0.2s;
  font-size: 1em;
}

button:last-child {
  margin-right: 0;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Classes de Cores para Botões */
.primary { background-color: var(--color-primary); }
.primary:hover { background-color: var(--color-primary-dark); }

.secondary { background-color: var(--color-secondary); }
.secondary:hover { background-color: var(--color-secondary-dark); }

.action-btn { background-color: #355e81; }

.danger, .delete { background-color: var(--color-danger); }
.danger:hover, .delete:hover { background-color: #c82333; }

.full-width {
  width: 100%;
  margin-right: 0;
  margin-top: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.button-group button {
  flex-grow: 1;
}

/* --- Mensagens de Feedback --- */
.response {
  margin-top: 15px;
  padding: 15px;
  border-radius: 8px;
  font-weight: 500;
  line-height: 1.4;
}

.response p { margin: 0; }
.success { background-color: #d4edda; border: 1px solid var(--color-success); color: #155724; }
.error { background-color: #f8d7da; border: 1px solid var(--color-danger); color: #721c24; }

/* --- Links e Navegação --- */
a {
  cursor: pointer;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.switch-view {
  margin-top: 15px;
  text-align: center;
  font-size: 0.95em;
}

/* --- ESTILO NOVO: Abas de Navegação --- */
.nav-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 0; /* Cola na div de baixo */
  padding-left: 10px;
}

.nav-tabs button {
  flex: 1;
  background: #e9ecef;
  color: #495057;
  border-radius: 8px 8px 0 0;
  margin-right: 2px;
  border: 1px solid transparent;
  padding: 12px;
}

.nav-tabs button:hover {
  background-color: #dde2e6;
  transform: none; /* Remove o pulinho das abas */
}

.nav-tabs button.active {
  background: var(--color-primary);
  color: white;
  border-bottom: 2px solid var(--color-primary-dark);
}


</style>