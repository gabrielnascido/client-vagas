export const fieldNames = {
  name: 'Nome',
  username: 'Nome de Usuário',
  password: 'Senha',
  phone: 'Telefone',
  email: 'Email',
  experience: 'Experiência',
  education: 'Educação',
  business: 'Ramo da Empresa',
  street: 'Endereço',
  number: 'Número',
  city: 'Cidade',
  state: 'Estado',
  // Campos de vagas
  title: 'Título da Vaga',
  area: 'Área',
  description: 'Descrição',
  salary: 'Salário',
  contact: 'Contato',
  message: 'Mensagem',
  user_id: 'ID do Usuário'
};

export const errorCodes = {
  required: 'é um campo obrigatório.',
  invalid_format: 'possui um formato inválido.',
  too_short: 'é muito curto.',
  too_long: 'é muito longo.',
  invalid_length: 'possui um tamanho inválido.',
  immutable_field: 'não pode ser alterado.',
  must_be_positive_int: 'deve ser um número inteiro positivo.',
  must_be_number: 'deve ser um número.',
  "Username already exists": "Este nome de usuário já está em uso.",
  "Company name already exists": "Este nome de empresa já está em uso.",
  "Invalid credentials": "Usuário ou senha inválidos.",
  "Invalid token": "Token inválido ou ausente. Por favor, faça o login novamente.",
  "Forbidden": "Você não tem permissão para esta ação.",
  "User not found": "Usuário não encontrado.",
  "Company not found": "Empresa não encontrada.",
  "Job not found": "Vaga não encontrada.",
  "Job or User not found": "Vaga ou usuário não encontrado.",
  "Cannot delete company with active jobs": "Não é possível excluir empresa com vagas ativas.",
  "Failed to fetch": "Falha de conexão. Verifique se o servidor está no ar."
};

export function parseAndTranslateApiError(errorData) {
  if (typeof errorData === 'string') {
      return errorCodes[errorData] || errorData;
  }
  
  if (errorData.details && Array.isArray(errorData.details)) {
    return errorData.details.map(detail => {
      const field = fieldNames[detail.field] || detail.field;
      const error = errorCodes[detail.error] || detail.error;
      return `<b>${field}</b>: ${error}`;
    }).join('<br>');
  }

  if (errorData.message) {
    return errorCodes[errorData.message] || errorData.message;
  }
  
  return "Ocorreu um erro desconhecido.";
}