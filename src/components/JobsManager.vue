<script setup>
import { ref, onMounted, computed } from 'vue'
import { parseAndTranslateApiError } from '@/utils/apiUtils'
import { useLocation } from '@/composables/useLocation.js'

const props = defineProps(['apiUrl', 'token', 'userId', 'userRole'])

const currentView = ref('list') // 'list', 'create', 'edit', 'details', 'candidates'
const jobs = ref([])
const selectedJob = ref(null)
const candidates = ref([])
const feedback = ref({ message: '', type: '' })
const isLoading = ref(false)

const { estados, cidades, carregarEstados, carregarCidades } = useLocation()

onMounted(() => {
  carregarEstados()
})

function carregarCidadesNew() {
  carregarCidades(jobForm.value.state)
}

function carregarCidadesSearch() {
  searchFilters.value.city = ''
  carregarCidades(searchFilters.value.state)
}

// Formulários
const jobForm = ref({
  title: '',
  area: '',
  description: '',
  state: '',
  city: '',
  salary: ''
})

const searchFilters = ref({
  title: '',
  area: '',
  company: '',
  state: '',
  city: '',
  salary_range: { min: null, max: null }
})

const feedbackMessages = ref({})

// Lista de áreas conforme o protocolo
const areaOptions = [
  'Administração', 'Agricultura', 'Artes', 'Atendimento ao Cliente',
  'Comercial', 'Comunicação', 'Construção Civil', 'Consultoria',
  'Contabilidade', 'Design', 'Educação', 'Engenharia', 'Finanças',
  'Jurídica', 'Logística', 'Marketing', 'Produção', 'Recursos Humanos',
  'Saúde', 'Segurança', 'Tecnologia da Informação', 'Telemarketing',
  'Vendas', 'Outros'
]

function showMessage(msg, isError = false) {
  feedback.value = { message: msg, type: isError ? 'error' : 'success' }
  setTimeout(() => { feedback.value = { message: '', type: '' } }, 10000)
}

function resetJobForm() {
  jobForm.value = {
    title: '',
    area: '',
    description: '',
    state: '',
    city: '',
    salary: ''
  }

  cidades.value = []
}

// ============ LISTAR VAGAS ============
async function fetchJobs() {
  isLoading.value = true
  try {
    const endpoint = props.userRole === 'company' 
      ? `/companies/${props.userId}/jobs`
      : '/jobs/search'
    
    const body = { filters: [buildFilterObject()] }
    
    const response = await fetch(`${props.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.token}`
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        jobs.value = []
        return
      }
      throw await response.json()
    }
    
    const data = await response.json()
    jobs.value = data.items || []
  } catch (error) {
    showMessage(`Erro ao carregar vagas: ${parseAndTranslateApiError(error)}`, true)
    jobs.value = []
  } finally {
    isLoading.value = false
  }
}

function buildFilterObject() {
  const filter = {}
  if (searchFilters.value.title) filter.title = searchFilters.value.title
  if (searchFilters.value.area) filter.area = searchFilters.value.area
  if (searchFilters.value.company) filter.company = searchFilters.value.company
  if (searchFilters.value.state) filter.state = searchFilters.value.state
  if (searchFilters.value.city) filter.city = searchFilters.value.city
  
  const hasMinSalary = searchFilters.value.salary_range.min && searchFilters.value.salary_range.min > 0
  const hasMaxSalary = searchFilters.value.salary_range.max && searchFilters.value.salary_range.max > 0
  
  if (hasMinSalary || hasMaxSalary) {
    filter.salary_range = {
      min: hasMinSalary ? parseFloat(searchFilters.value.salary_range.min) : null,
      max: hasMaxSalary ? parseFloat(searchFilters.value.salary_range.max) : null
    }
  }
  
  return filter
}

async function handleSearch() {
  await fetchJobs()
}

function clearFilters() {
  searchFilters.value = {
    title: '',
    area: '',
    company: '',
    state: '',
    city: '',
    salary_range: { min: null, max: null }
  }
  fetchJobs()
}

// ============ VER DETALHES DA VAGA ============
async function viewJobDetails(jobId) {
  isLoading.value = true
  try {
    const response = await fetch(`${props.apiUrl}/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${props.token}` }
    })
    
    if (!response.ok) throw await response.json()
    
    selectedJob.value = await response.json()
    currentView.value = 'details'

    carregarCidades(jobForm.value.state)

  } catch (error) {
    showMessage(`Erro ao carregar vaga: ${parseAndTranslateApiError(error)}`, true)
  } finally {
    isLoading.value = false
  }
}

// ============ CRIAR VAGA (EMPRESA) ============
async function handleCreateJob() {
  try {
    const payload = {
      ...jobForm.value,
      salary: jobForm.value.salary ? parseFloat(jobForm.value.salary) : null
    }
    
    const response = await fetch(`${props.apiUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.token}`
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Vaga criada com sucesso!')
    resetJobForm()
    currentView.value = 'list'
    fetchJobs()
  } catch (error) {
    showMessage(`Erro ao criar vaga: ${parseAndTranslateApiError(error)}`, true)
  }
}

// ============ EDITAR VAGA (EMPRESA) ============
async function startEditJob(job) {
  selectedJob.value = job
  
  // 1. Preenche os dados do formulário
  jobForm.value = {
    title: job.title,
    area: job.area,
    description: job.description,
    state: job.state,
    city: job.city,
    salary: job.salary || ''
  }

  if (job.state) {
    await carregarCidades(job.state) 
  }

  currentView.value = 'edit'
}

async function handleUpdateJob() {
  try {
    const payload = {
      ...jobForm.value,
      salary: jobForm.value.salary ? parseFloat(jobForm.value.salary) : null
    }
    
    const response = await fetch(`${props.apiUrl}/jobs/${selectedJob.value.job_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.token}`
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Vaga atualizada com sucesso!')
    resetJobForm()
    currentView.value = 'list'
    fetchJobs()
  } catch (error) {
    showMessage(`Erro ao atualizar vaga: ${parseAndTranslateApiError(error)}`, true)
  }
}

// ============ DELETAR VAGA (EMPRESA) ============
async function handleDeleteJob(jobId) {
  if (!confirm('Tem certeza que deseja excluir esta vaga?')) return
  
  try {
    const response = await fetch(`${props.apiUrl}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${props.token}` }
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Vaga excluída com sucesso!')
    fetchJobs()
  } catch (error) {
    showMessage(`Erro ao excluir vaga: ${parseAndTranslateApiError(error)}`, true)
  }
}

// ============ CANDIDATAR-SE (USUÁRIO COMUM) ============
async function applyToJob(jobId) {
  if (!confirm('Deseja se candidatar a esta vaga?')) return
  
  isLoading.value = true
  try {
    const userResponse = await fetch(`${props.apiUrl}/users/${props.userId}`, {
      headers: { 'Authorization': `Bearer ${props.token}` }
    })
    
    if (!userResponse.ok) throw await userResponse.json()
    
    const userData = await userResponse.json()
    
    const applicationData = {
      name: userData.name,
      email: userData.email || '',
      phone: userData.phone || '',
      education: userData.education || '',
      experience: userData.experience || ''
    }
    
    const response = await fetch(`${props.apiUrl}/jobs/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.token}`
      },
      body: JSON.stringify(applicationData)
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Candidatura enviada com sucesso!')
  } catch (error) {
    showMessage(`Erro ao candidatar: ${parseAndTranslateApiError(error)}`, true)
  } finally {
    isLoading.value = false
  }
}

// ============ VER CANDIDATOS (EMPRESA) ============
async function viewCandidates(jobId) {
  isLoading.value = true
  selectedJob.value = jobs.value.find(j => j.job_id === jobId)
  
  try {
    const response = await fetch(`${props.apiUrl}/companies/${props.userId}/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${props.token}` }
    })
    
    if (!response.ok) throw await response.json()
    
    const data = await response.json()
    candidates.value = data.items || []
    currentView.value = 'candidates'
  } catch (error) {
    showMessage(`Erro ao carregar candidatos: ${parseAndTranslateApiError(error)}`, true)
  } finally {
    isLoading.value = false
  }
}

// ============ ENVIAR FEEDBACK (EMPRESA) ============
async function sendFeedback(candidateId) {
  const message = feedbackMessages.value[candidateId]

  if (!message || !message.trim()) {
    showMessage('Digite uma mensagem de feedback.', true)
    return
  }
  
  try {
    const response = await fetch(`${props.apiUrl}/jobs/${selectedJob.value.job_id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.token}`
      },
      body: JSON.stringify({
        user_id: candidateId,
        message: message
      })
    })
    
    if (!response.ok) throw await response.json()
    
    showMessage('Feedback enviado com sucesso!')
    
    feedbackMessages.value[candidateId] = ''

    //voltar para a lista de vagas
    currentView.value = 'list'
    fetchJobs()


  } catch (error) {
    showMessage(`Erro ao enviar feedback: ${parseAndTranslateApiError(error)}`, true)
  }
}

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="jobs-container">
    <div v-if="feedback.message" :class="['response', feedback.type]" v-html="feedback.message"></div>

    <!-- ============ VIEW: LISTA DE VAGAS ============ -->
    <div v-if="currentView === 'list'" class="form-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
        <h3 style="margin:0; border:0;">
          {{ userRole === 'company' ? 'Minhas Vagas' : 'Buscar Vagas' }}
        </h3>
        <button v-if="userRole === 'company'" @click="currentView = 'create'" class="primary">
          + Nova Vaga
        </button>
      </div>

      <!-- Filtros de Busca -->
      <div class="search-filters">
        <input v-model="searchFilters.title" placeholder="Título da vaga" />
        <select v-model="searchFilters.area">
          <option value="">Todas as áreas</option>
          <option v-for="area in areaOptions" :key="area" :value="area">{{ area }}</option>
        </select>
        <input v-if="userRole === 'comum'" v-model="searchFilters.company" placeholder="Nome da empresa" />
                <div class="input-group">
            <select v-model="searchFilters.state" @change="carregarCidadesSearch" required style="">
            <option disabled value="">Selecione o Estado</option>
            <option v-for="uf in estados" :key="uf.id" :value="uf.sigla">
                {{ uf.sigla }} - {{ uf.nome }}
            </option>
            </select>
        </div>

        <div class="input-group">
            <select v-model="searchFilters.city" required style="">
            <option disabled value="">Selecione a Cidade</option>
            <option v-for="city in cidades" :key="city.id" :value="city.nome">
                {{ city.nome }}
            </option>
            </select>
        </div>

        <input v-model="searchFilters.salary_range.min" type="number" placeholder="Salário mín." />
        <input v-model="searchFilters.salary_range.max" type="number" placeholder="Salário máx." />
        
        <div class="button-group">
          <button @click="handleSearch" class="primary">Buscar</button>
          <button @click="clearFilters" class="secondary">Limpar Filtros</button>
        </div>
      </div>

      <!-- Lista de Vagas -->
      <p v-if="isLoading">Carregando vagas...</p>
      <p v-else-if="jobs.length === 0">Nenhuma vaga encontrada.</p>
      
      <div v-else class="jobs-list">
        <div v-for="job in jobs" :key="job.job_id" class="job-card">
          <h4>{{ job.title }}</h4>
          <p><strong>Área:</strong> {{ job.area }}</p>
          <p><strong>Empresa:</strong> {{ job.company }}</p>
          <p><strong>Local:</strong> {{ job.city }}, {{ job.state }}</p>
          <p v-if="job.description"><strong>Descrição:</strong> {{ job.description }}</p> 
          <p><strong>Salário:</strong> 
              <span v-if="job.salary">R$ {{ job.salary.toFixed(2) }}</span>
              <span v-else>Não informado</span> </p>
          
          <div class="button-group">
            <button @click="viewJobDetails(job.job_id)" class="secondary">Ver Detalhes</button>
            
            <template v-if="userRole === 'company'">
              <button @click="startEditJob(job)" class="primary">Editar</button>
              <button @click="viewCandidates(job.job_id)" class="action-btn">Ver Candidatos</button>
              <button @click="handleDeleteJob(job.job_id)" class="delete">Excluir</button>
            </template>
            
            <button v-if="userRole === 'comum'" @click="applyToJob(job.job_id)" class="action-btn">
              Candidatar-se
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ VIEW: CRIAR VAGA ============ -->
    <div v-if="currentView === 'create'" class="form-container">
      <h3>Nova Vaga</h3>
      <form @submit.prevent="handleCreateJob">
        <label>Título *</label>
        <input v-model="jobForm.title" required />
        
        <label>Área *</label>
        <select v-model="jobForm.area" required>
          <option value="">Selecione uma área</option>
          <option v-for="area in areaOptions" :key="area" :value="area">{{ area }}</option>
        </select>
        
        <label>Descrição *</label>
        <textarea v-model="jobForm.description" rows="5" required></textarea>
        
        <div class="input-group">
            <label>Estado (UF) *</label>
            <select v-model="jobForm.state" @change="carregarCidadesNew" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <option disabled value="">Selecione o Estado</option>
            <option v-for="uf in estados" :key="uf.id" :value="uf.sigla">
                {{ uf.sigla }} - {{ uf.nome }}
            </option>
            </select>
        </div>

        <div class="input-group">
            <label>Cidade *</label>
            <select v-model="jobForm.city" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <option disabled value="">Selecione a Cidade</option>
            <option v-for="city in cidades" :key="city.id" :value="city.nome">
                {{ city.nome }}
            </option>
            </select>
        </div>
        
        <label>Salário</label>
        <input v-model="jobForm.salary" type="number" step="0.01" placeholder="Opcional" />
        
        <div class="button-group">
          <button type="submit" class="primary">Criar Vaga</button>
          <button type="button" @click="currentView = 'list'; resetJobForm()" class="secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- ============ VIEW: EDITAR VAGA ============ -->
    <div v-if="currentView === 'edit'" class="form-container">
      <h3>Editar Vaga</h3>
      <form @submit.prevent="handleUpdateJob">
        <label>Título *</label>
        <input v-model="jobForm.title" required />
        
        <label>Área *</label>
        <select v-model="jobForm.area" required>
          <option value="">Selecione uma área</option>
          <option v-for="area in areaOptions" :key="area" :value="area">{{ area }}</option>
        </select>
        
        <label>Descrição *</label>
        <textarea v-model="jobForm.description" rows="5" required></textarea>
        
                <div class="input-group">
            <label>Estado (UF) *</label>
            <select v-model="jobForm.state" @change="carregarCidadesNew" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <option disabled value="">Selecione o Estado</option>
            <option v-for="uf in estados" :key="uf.id" :value="uf.sigla">
                {{ uf.sigla }} - {{ uf.nome }}
            </option>
            </select>
        </div>

        <div class="input-group">
            <label>Cidade *</label>
            <select v-model="jobForm.city" required style="width: 100%; padding: 12px 10px; margin-bottom: 1.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <option disabled value="">Selecione a Cidade</option>
            <option v-for="city in cidades" :key="city.id" :value="city.nome">
                {{ city.nome }}
            </option>
            </select>
        </div>

        
        <label>Salário</label>
        <input v-model="jobForm.salary" type="number" step="0.01" />
        
        <div class="button-group">
          <button type="submit" class="primary">Salvar Alterações</button>
          <button type="button" @click="currentView = 'list'; resetJobForm()" class="secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- ============ VIEW: DETALHES DA VAGA ============ -->
    <div v-if="currentView === 'details' && selectedJob" class="form-container">
      <h3>{{ selectedJob.title }}</h3>
      <p><strong>Área:</strong> {{ selectedJob.area }}</p>
      <p><strong>Empresa:</strong> {{ selectedJob.company }}</p>
      <p><strong>Localização:</strong> {{ selectedJob.city }}, {{ selectedJob.state }}</p>
      <p><strong>Salário:</strong> 
          <span v-if="selectedJob.salary"> R$ {{ selectedJob.salary.toFixed(2) }}</span>
          <span v-else> Não informado</span> </p>
      <p><strong>Descrição:</strong></p>
      <p style="white-space: pre-wrap;">{{ selectedJob.description }}</p>
      
      <div class="button-group">
        <button v-if="userRole === 'comum'" @click="applyToJob(selectedJob.job_id)" class="primary">
          Candidatar-se
        </button>
        <button @click="currentView = 'list'" class="secondary">Voltar</button>
      </div>
    </div>

    <!-- ============ VIEW: CANDIDATOS (EMPRESA) ============ -->
    <div v-if="currentView === 'candidates'" class="form-container">
      <h3>Candidatos - {{ selectedJob?.title }}</h3>
      
      <p v-if="isLoading">Carregando candidatos...</p>
      <p v-else-if="candidates.length === 0">Nenhum candidato ainda.</p>
      
      <div v-else class="candidates-list">
        <div v-for="candidate in candidates" :key="candidate.user_id" class="candidate-card">
          <h4>{{ candidate.name }}</h4>
          <p><strong>Email:</strong> {{ candidate.email || 'Não informado'}}</p>
          <p><strong>Telefone:</strong> {{ candidate.phone || 'Não informado' }}</p>
          <p><strong>Educação:</strong> {{ candidate.education || 'Não informado' }}</p>
          <p><strong>Experiência:</strong> {{ candidate.experience || 'Não informado' }}</p>
          
          <div class="feedback-section">
            <label>Enviar Feedback:</label>
            <textarea 
              v-model="feedbackMessages[candidate.user_id]" 
              placeholder="Digite seu feedback para o candidato..."
              rows="3"
            ></textarea>
            <button @click="sendFeedback(candidate.user_id)" class="primary">Enviar Feedback</button>
          </div>
        </div>
      </div>
      
      <button @click="currentView = 'list'" class="secondary full-width" style="margin-top: 15px;">
        Voltar para Vagas
      </button>
    </div>
  </div>
</template>

<style scoped>
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 15px;
}

textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

.search-filters {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-filters input,
.search-filters select {
  margin-bottom: 10px;
}

.jobs-list {
  display: grid;
  gap: 15px;
}

.job-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.job-card h4 {
  margin-top: 0;
  color: var(--color-primary);
}

.job-card p {
  margin: 5px 0;
  font-size: 0.95em;
}

.candidates-list {
  display: grid;
  gap: 15px;
}

.candidate-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.candidate-card h4 {
  margin-top: 0;
  color: #343a40;
}

.feedback-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.feedback-section label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}
</style>