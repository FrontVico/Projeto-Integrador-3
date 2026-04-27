import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8080'; // Android emulator
// const BASE_URL = 'http://localhost:8080'; // Web
// const BASE_URL = 'http://SEU_IP:8080';   // Celular físico

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('@vancontrol:token');
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem('@vancontrol:token', token);
}

export async function clearToken() {
  await AsyncStorage.removeItem('@vancontrol:token');
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Erro ${response.status}`);
  return data as T;
}

export const authService = {
  async login(email: string, password: string) {
    const data = await request<{ token: string; name: string }>('/auth/login', {
      method: 'POST', body: { email, password }, auth: false,
    });
    await saveToken(data.token);
    return data;
  },
  async register(payload: { name: string; email: string; password: string; cpf: string; telefone: string; instituicaoEnsino: string; turno: string; endereco: string; cep: string }) {
    const data = await request<{ token: string; name: string }>('/auth/register', {
      method: 'POST', body: payload, auth: false,
    });
    await saveToken(data.token);
    return data;
  },
  async logout() { await clearToken(); },
};

export const rotasService = {
  listar: () => request<any[]>('/rotas'),
  buscarPorDestino: (destino: string) => request<any>(`/rotas/${encodeURIComponent(destino)}`),
  criar: (payload: any) => request('/rotas', { method: 'POST', body: payload }),
  atualizarDescricao: (id: string, novaDescricao: string) => request(`/rotas/${id}/descricao`, { method: 'PATCH', body: { novaDescricao } }),
  deletar: (id: string) => request(`/rotas?id=${id}`, { method: 'DELETE' }),
};

export const veiculosService = {
  listar: () => request<any[]>('/veiculos'),
  buscarPorPlaca: (placa: string) => request<any>(`/veiculos/${placa}`),
  cadastrar: (payload: any) => request('/veiculos', { method: 'POST', body: payload }),
  atualizarStatus: (placa: string, status: string) => request('/veiculos/status', { method: 'PUT', body: { placa, status } }),
  deletar: (placa: string) => request(`/veiculos?placa=${placa}`, { method: 'DELETE' }),
};

export const motoristasService = {
  listar: () => request<any[]>('/motoristas'),
  buscarPorCpf: (cpf: string) => request<any>(`/motoristas/${cpf}`),
  cadastrar: (payload: any) => request('/motoristas', { method: 'POST', body: payload }),
  atualizarTelefone: (cpf: string, novoTelefone: string) => request('/motoristas', { method: 'PUT', body: { cpf, novoTelefone } }),
  deletar: (cpf: string) => request(`/motoristas?cpf=${cpf}`, { method: 'DELETE' }),
};

export const passageirosService = {
  listar: () => request<any[]>('/passageiros'),
  buscarPorCpf: (cpf: string) => request<any>(`/passageiros/${cpf}`),
  atualizar: (cpf: string, payload: any) => request(`/passageiros/${cpf}`, { method: 'PUT', body: payload }),
  deletar: (cpf: string) => request(`/passageiros/${cpf}`, { method: 'DELETE' }),
};

export const viagensService = {
  listar: () => request<any[]>('/viagens'),
  buscarPorCodigo: (codigo: string) => request<any>(`/viagens/${codigo}`),
  criar: (payload: any) => request('/viagens', { method: 'POST', body: payload }),
  atualizarStatus: (codigo: string) => request(`/viagens/${codigo}`, { method: 'PUT' }),
  deletar: (codigo: string) => request(`/viagens/${codigo}`, { method: 'DELETE' }),
};

export const pagamentosService = {
  buscar: (id: string) => request<any>(`/pagamentos/${id}`),
  listarPorPassageiro: (id: string) => request<any[]>(`/pagamentos/passageiro/${id}`),
  listarPorCompetencia: (competencia: string) => request<any[]>(`/pagamentos?competencia=${encodeURIComponent(competencia)}`),
  meusPagamentos: () => request<any[]>('/pagamentos/meus-pagamentos'),
  criar: (payload: any) => request('/pagamentos', { method: 'POST', body: payload }),
  atualizarStatus: (id: string, status: string, dataPagamento?: string) => request(`/pagamentos/${id}/status`, { method: 'PATCH', body: { status, dataPagamento } }),
  deletar: (id: string) => request(`/pagamentos/${id}`, { method: 'DELETE' }),
};
