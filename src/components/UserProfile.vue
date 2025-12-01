<script setup>
import { ref, onMounted } from 'vue'
import { parseAndTranslateApiError } from '@/utils/apiUtils'
import { useLocation } from '@/composables/useLocation'

const props = defineProps(['apiUrl', 'token', 'userId', 'userRole'])
const emit = defineEmits(['logout', 'account-deleted'])

const editForm = ref({})
const isLoading = ref(true)
const feedback = ref({ message: '', type: '' })

const { estados, cidades, carregarEstados, carregarCidades } = useLocation()

onMounted(async () => {
  
  await carregarEstados()
  
  await fetchUserData()
})

function carregarCidadesMain() {
  editForm.value.city = ''
  carregarCidades(editForm.value.state)
}

function showMessage(msg, isError = false) {
  feedback.value = { message: msg, type: isError ? 'error' : 'success' }
}

async function fetchUserData() {
  const endpoint = props.userRole === 'comum' ? `/users/${props.userId}` : `/companies/${props.userId}`;
  
  isLoading.value = true;
  try {
    const response = await fetch(`${props.apiUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${props.token}` },
    })
    if (!response.ok) throw await response.json()
    const data = await response.json()
    
    editForm.value = { ...data, password: '' }

    if (editForm.value.state) {
        await carregarCidades(editForm.value.state)
    }
  } catch (error) {
    showMessage(`Erro ao carregar: ${parseAndTranslateApiError(error)}`, true)
  } finally {
    isLoading.value = false;
  }
}

async function handleUpdate() {
  const endpoint = props.userRole === 'comum' ? `/users/${props.userId}` : `/companies/${props.userId}`;
  
  const updateData = { ...editForm.value }
  delete updateData.id 
  
  if(!updateData.password) delete updateData.password
  if(!updateData.username) delete updateData.username

  try {
    const response = await fetch(`${props.apiUrl}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${props.token}` },
      body: JSON.stringify(updateData),
    })
    if (!response.ok) throw await response.json()
    showMessage('Dados atualizados com sucesso!')
  } catch (error) {
    showMessage(`Erro na atualização: ${parseAndTranslateApiError(error)}`, true)
  }
}

async function handleDelete() {
  if (!confirm('TEM CERTEZA? AÇÃO IRREVERSÍVEL.')) return
  const endpoint = props.userRole === 'comum' ? `/users/${props.userId}` : `/companies/${props.userId}`;
  try {
    await fetch(`${props.apiUrl}${endpoint}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${props.token}` },
    })
    emit('account-deleted')
  } catch (error) {
    showMessage(`Erro: ${parseAndTranslateApiError(error)}`, true)
  }
}

onMounted(() => {
    fetchUserData();
})
</script>

<template>
  <div class="form-container">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
        <h3 style="margin:0; border:0;">Meus Dados</h3>
        
        <button 
          type="button" 
          @click="$emit('logout')"
          class="secondary" 
          style="font-size: 0.9em; padding: 5px 15px;"
        >Sair</button>
    </div>
    
    <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>

    <p v-if="isLoading">Carregando seus dados...</p>

    <form v-else @submit.prevent="handleUpdate" class="edit-form">
        <label>Nome:</label> <input v-model="editForm.name" required />
        
        <template v-if="userRole === 'comum'">
            <label>Experiência:</label> <input v-model="editForm.experience" />
            <label>Educação:</label> <input v-model="editForm.education" />
            <label>Email:</label> <input v-model="editForm.email" />
            <label>Telefone:</label> <input v-model="editForm.phone" />
        </template>
        
        <template v-if="userRole === 'company'">
             <label>Ramo:</label> <input v-model="editForm.business" />
             <label>Endereço:</label> <input v-model="editForm.street" />
             <label>Número:</label> <input v-model="editForm.number" pattern="[0-9]+" />

            <div class="input-group">
                <label>Estado:</label>
                <select v-model="editForm.state" @change="carregarCidadesMain" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
                <option disabled value="">Selecione o Estado</option>
                <option v-for="uf in estados" :key="uf.id" :value="uf.sigla">
                    {{ uf.sigla }} - {{ uf.nome }}
                </option>
                </select>
            </div>

            <div class="input-group">
                <label>Cidade:</label>
                <select v-model="editForm.city" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
                <option disabled value="">Selecione a Cidade</option>
                <option v-for="city in cidades" :key="city.id" :value="city.nome">
                    {{ city.nome }}
                </option>
                </select>
            </div>
        
            <label>Email:</label> <input v-model="editForm.email" required/>
            <label>Telefone:</label> <input v-model="editForm.phone" required/>
        </template>

        <label>Nova Senha:</label> <input v-model="editForm.password" type="password" placeholder="Opcional" />

        <div class="button-group">
            <button type="submit" class="primary">Salvar</button>
            <button @click="handleDelete" type="button" class="delete">Excluir Conta</button>
        </div>
    </form>
  </div>
</template>