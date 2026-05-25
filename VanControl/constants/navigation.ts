// Constantes compartilhadas para sincronizar ícones, labels e cores em toda a aplicação

export type Role = 'ADMIN' | 'MOTORISTA' | 'PASSAGEIRO';

export type NavigationItem = {
  icon: string;
  label: string;
  color: string;
  route?: string;
  sub?: string; // Descrição para o menu de perfil
  allowedRoles?: Role[];
};

export const NAVIGATION_ITEMS: Record<string, NavigationItem> = {
  ROTAS: {
    icon: 'map-outline',
    label: 'Rotas',
    color: '#2563eb',
    route: '/(main)/rotas',
    sub: 'Gerenciar rotas do sistema',
    allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'],
  },
  VIAGENS: {
    icon: 'navigate-outline',
    label: 'Viagens',
    color: '#f59e0b',
    route: '/(main)/viagens',
    sub: 'Histórico e andamento',
    allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'],
  },
  PAGAMENTOS: {
    icon: 'card-outline',
    label: 'Pagamentos',
    color: '#a78bfa',
    route: '/(main)/pagamentos',
    sub: 'Cobranças e recebimentos',
    allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'],
  },
  VEICULOS: {
    icon: 'bus-outline',
    label: 'Veículos',
    color: '#0ea5e9',
    route: '/(main)/veiculos',
    sub: 'Frota cadastrada',
    allowedRoles: ['ADMIN', 'MOTORISTA'],
  },
  MOTORISTAS: {
    icon: 'people-outline',
    label: 'Motoristas',
    color: '#22c55e',
    route: '/(main)/motoristas',
    sub: 'Equipe de motoristas',
    allowedRoles: ['ADMIN'],
  },
  PASSAGEIROS: {
    icon: 'school-outline',
    label: 'Passageiros',
    color: '#f472b6',
    route: '/(main)/passageiros',
    sub: 'Alunos cadastrados no sistema',
    allowedRoles: ['ADMIN'],
  },
};

// Para usar no dashboard ou menu de gestão rápida
export const QUICK_ACCESS_ITEMS = [
  NAVIGATION_ITEMS.ROTAS,
  NAVIGATION_ITEMS.VEICULOS,
  NAVIGATION_ITEMS.MOTORISTAS,
  NAVIGATION_ITEMS.VIAGENS,
  NAVIGATION_ITEMS.PAGAMENTOS,
  NAVIGATION_ITEMS.PASSAGEIROS,
];
