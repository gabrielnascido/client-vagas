import { ref } from 'vue'

export function useLocation() {
  const estados = ref([])
  const cidades = ref([])
  const loading = ref(false)

  async function carregarEstados() {
    try {
      loading.value = true
      const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      const data = await res.json()
      estados.value = data.sort((a, b) => a.nome.localeCompare(b.nome))
    } catch (error) {
      console.error("Erro ao carregar estados", error)
    } finally {
      loading.value = false
    }
  }

  async function carregarCidades(ufSigla) {
    cidades.value = [] 
    if (!ufSigla) return

    try {
      loading.value = true
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSigla}/municipios`)
      const data = await res.json()
      cidades.value = data.sort((a, b) => a.nome.localeCompare(b.nome))
    } catch (error) {
      console.error("Erro ao carregar cidades", error)
    } finally {
      loading.value = false
    }
  }

  return {
    estados,
    cidades,
    loading,
    carregarEstados,
    carregarCidades
  }
}