import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import {
  veiculosService,
} from '../../services/api';

type VeiculoStatus = 'DISPONIVEL' | 'MANUTENCAO' | 'INATIVO';

type VeiculoFormState = {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  capacidade: string;
  renavam: string;
  status: VeiculoStatus;
};

const STATUS_OPTIONS: VeiculoStatus[] = ['DISPONIVEL', 'MANUTENCAO', 'INATIVO'];

const STATUS_LABELS: Record<VeiculoStatus, string> = {
  DISPONIVEL: 'Disponivel',
  MANUTENCAO: 'Manutencao',
  INATIVO: 'Inativo',
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatPlaca(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
}

function getStatusTheme(status: VeiculoStatus) {
  switch (status) {
    case 'DISPONIVEL':
      return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' };
    case 'MANUTENCAO':
      return { bg: 'rgba(251,191,36,0.15)', color: '#f59e0b' };
    default:
      return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
  }
}

export default function VeiculosScreen() {
  const { user, loading: authLoading } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MOTORISTA';
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState('Nenhum veiculo cadastrado.');
  const [searchTerm, setSearchTerm] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusTarget, setStatusTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState<VeiculoFormState>({
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    capacidade: '',
    renavam: '',
    status: 'DISPONIVEL',
  });
  const [statusValue, setStatusValue] = useState<VeiculoStatus>('DISPONIVEL');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  function showError(message: string) {
    setError(message);
    errorOpacity.setValue(0);
    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  function clearError() {
    setError(null);
    errorOpacity.setValue(0);
  }

  function resetForm() {
    setForm({
      placa: '',
      marca: '',
      modelo: '',
      ano: '',
      capacidade: '',
      renavam: '',
      status: 'DISPONIVEL',
    });
    setStatusValue('DISPONIVEL');
  }

  const loadVeiculos = useCallback(async () => {
    const localClearError = () => {
      setError(null);
      errorOpacity.setValue(0);
    };
    const localShowError = (message: string) => {
      setError(message);
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    localClearError();
    setLoading(true);
    setEmptyMessage('Nenhum veiculo cadastrado.');
    try {
      const data = await veiculosService.listar();
      setVeiculos(data);
    } catch (err) {
      setVeiculos([]);
      localShowError(err instanceof Error ? err.message : 'Erro ao carregar veiculos');
    } finally {
      setLoading(false);
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [errorOpacity, fadeAnim, slideAnim]);

  useEffect(() => {
    if (!authLoading) loadVeiculos();
  }, [authLoading, loadVeiculos]);

  async function handleSearch() {
    clearError();
    setSearching(true);
    try {
      const term = formatPlaca(searchTerm.trim());
      if (!term) {
        await loadVeiculos();
        return;
      }
      const data = await veiculosService.buscarPorPlaca(term);
      setVeiculos(data ? [data] : []);
      setEmptyMessage('Nenhum veiculo encontrado para a placa informada.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar veiculo';
      const normalized = normalizeText(message);
      if (normalized.includes('nao encontrado')) {
        setVeiculos([]);
        setEmptyMessage('Nenhum veiculo encontrado para a placa informada.');
      } else {
        showError(message);
      }
    } finally {
      setSearching(false);
    }
  }

  function openCreate() {
    clearError();
    resetForm();
    setCreateVisible(true);
  }

  function closeCreate() {
    setCreateVisible(false);
    clearError();
    resetForm();
  }

  function openStatus(veiculo: any) {
    clearError();
    setStatusTarget(veiculo);
    setStatusValue(veiculo.status as VeiculoStatus);
    setStatusVisible(true);
  }

  function closeStatus() {
    setStatusVisible(false);
    setStatusTarget(null);
    clearError();
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    clearError();
  }

  function confirmDelete(veiculo: any) {
    setDeleteTarget(veiculo);
  }

  function validatePlaca(placa: string) {
    const pattern = /^[A-Z]{3}-[0-9][A-Z0-9][0-9]{2}$/;
    return pattern.test(placa);
  }

  async function handleCreate() {
    clearError();
    const placa = formatPlaca(form.placa.trim());
    if (!placa || !validatePlaca(placa)) {
      showError('Informe uma placa valida no formato AAA-0A00.');
      return;
    }
    if (!form.marca.trim() || !form.modelo.trim()) {
      showError('Informe marca e modelo do veiculo.');
      return;
    }
    const ano = Number(form.ano);
    if (!Number.isInteger(ano) || ano <= 0) {
      showError('Informe um ano valido.');
      return;
    }
    const capacidade = Number(form.capacidade);
    if (!Number.isInteger(capacidade) || capacidade <= 0) {
      showError('Informe uma capacidade valida.');
      return;
    }
    const renavam = form.renavam.trim();
    if (!/^[0-9]{11}$/.test(renavam)) {
      showError('Renavam deve conter 11 digitos numericos.');
      return;
    }

    const payload: any = {
      placa,
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano,
      capacidade,
      renavam,
      status: form.status,
    };

    setActionLoading(true);
    try {
      await veiculosService.cadastrar(payload);
      closeCreate();
      await loadVeiculos();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao cadastrar veiculo');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusUpdate() {
    if (!statusTarget) return;
    clearError();
    setActionLoading(true);
    try {
      await veiculosService.atualizarStatus(statusTarget.placa, statusValue);
      closeStatus();
      await loadVeiculos();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  }

  async function runDelete() {
    if (!deleteTarget) return;
    clearError();
    setActionLoading(true);
    try {
      await veiculosService.deletar(deleteTarget.id);
      await loadVeiculos();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao remover veiculo');
    } finally {
      setActionLoading(false);
      closeDeleteModal();
    }
  }

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#0b1436', '#050a1e']} style={styles.header}>
          <View style={styles.glowAccent} />
          <Text style={styles.title}>Veiculos</Text>
          <Text style={styles.subtitle}>Consulte e gerencie a frota disponivel.</Text>
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Buscar por placa"
              placeholderTextColor="#64748b"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={(value) => setSearchTerm(formatPlaca(value))}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              activeOpacity={0.75}
              disabled={searching}
            >
              <Text style={styles.searchButtonText}>{searching ? '...' : 'Buscar'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={loadVeiculos}
              activeOpacity={0.75}
            >
              <Text style={styles.headerActionText}>Atualizar</Text>
            </TouchableOpacity>
            {searchTerm.trim() ? (
              <TouchableOpacity
                style={[styles.headerActionButton, styles.headerActionGhost]}
                onPress={() => {
                  setSearchTerm('');
                  loadVeiculos();
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.headerActionText}>Limpar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </LinearGradient>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {error ? (
            <Animated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {canManage ? (
            <View style={styles.manageCard}>
              <View>
                <Text style={styles.manageTitle}>Gestao de veiculos</Text>
                <Text style={styles.manageSubtitle}>
                  Cadastre novos veiculos ou atualize o status rapidamente.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={openCreate}
                activeOpacity={0.75}
              >
                <Text style={styles.primaryButtonText}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Frota disponivel</Text>
          {veiculos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum veiculo encontrado</Text>
              <Text style={styles.emptySubtitle}>{emptyMessage}</Text>
            </View>
          ) : (
            veiculos.map((veiculo) => {
              const theme = getStatusTheme(veiculo.status as VeiculoStatus);
              return (
                <View key={veiculo.placa} style={styles.veiculoCard}>
                  <View style={styles.veiculoHeader}>
                    <Text style={styles.placaText}>{veiculo.placa}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}
                    >
                      <Text style={[styles.statusText, { color: theme.color }]}
                      >
                        {STATUS_LABELS[veiculo.status as VeiculoStatus]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.veiculoModelo}>
                    {veiculo.modelo}
                  </Text>
                  <View style={styles.veiculoMetaRow}>
                    <Text style={styles.veiculoMeta}>Capacidade: {veiculo.capacidade}</Text>
                  </View>
                  {canManage ? (
                    <View style={styles.veiculoActions}>
                      <TouchableOpacity
                        style={styles.veiculoActionButton}
                        onPress={() => openStatus(veiculo)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.veiculoActionText}>Status</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.veiculoActionButton, styles.veiculoActionDanger]}
                        onPress={() => confirmDelete(veiculo)}
                        activeOpacity={0.75}
                        disabled={actionLoading}
                      >
                        <Text style={styles.veiculoActionText}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </Animated.View>
      </Animated.ScrollView>

      <Modal visible={createVisible} animationType="slide" onRequestClose={closeCreate}>
        <LinearGradient colors={['#0b1436', '#050a1e']} style={styles.fullScreen}>
          <View style={styles.fullHeader}>
            <Text style={styles.fullTitle}>Cadastrar veiculo</Text>
            <TouchableOpacity onPress={closeCreate} activeOpacity={0.75}>
              <Text style={styles.fullClose}>Fechar</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Animated.View style={[styles.errorBanner, { opacity: errorOpacity, marginTop: 0 }]}
            >
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalLabel}>Placa</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="AAA-0A00"
              placeholderTextColor="#64748b"
              value={form.placa}
              onChangeText={(value) => setForm((prev) => ({ ...prev, placa: formatPlaca(value) }))}
            />
            <Text style={styles.modalLabel}>Marca</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Mercedes"
              placeholderTextColor="#64748b"
              value={form.marca}
              onChangeText={(value) => setForm((prev) => ({ ...prev, marca: value }))}
            />
            <Text style={styles.modalLabel}>Modelo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Sprinter"
              placeholderTextColor="#64748b"
              value={form.modelo}
              onChangeText={(value) => setForm((prev) => ({ ...prev, modelo: value }))}
            />
            <Text style={styles.modalLabel}>Ano</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 2022"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={form.ano}
              onChangeText={(value) => setForm((prev) => ({ ...prev, ano: value }))}
            />
            <Text style={styles.modalLabel}>Capacidade</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 15"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={form.capacidade}
              onChangeText={(value) => setForm((prev) => ({ ...prev, capacidade: value }))}
            />
            <Text style={styles.modalLabel}>Renavam</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="11 digitos"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={form.renavam}
              onChangeText={(value) => setForm((prev) => ({ ...prev, renavam: value }))}
            />
            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => {
                const active = form.status === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.statusOption, active && styles.statusOptionActive]}
                    onPress={() => setForm((prev) => ({ ...prev, status: option }))}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.statusOptionText, active && styles.statusOptionTextActive]}>
                      {STATUS_LABELS[option]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonGhost]}
              onPress={closeCreate}
              activeOpacity={0.75}
              disabled={actionLoading}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreate}
              activeOpacity={0.75}
              disabled={actionLoading}
            >
              <Text style={styles.modalButtonText}>
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>

      <Modal visible={statusVisible} animationType="slide" onRequestClose={closeStatus}>
        <LinearGradient colors={['#0b1436', '#050a1e']} style={styles.fullScreen}>
          <View style={styles.fullHeader}>
            <Text style={styles.fullTitle}>Atualizar status</Text>
            <TouchableOpacity onPress={closeStatus} activeOpacity={0.75}>
              <Text style={styles.fullClose}>Fechar</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Animated.View style={[styles.errorBanner, { opacity: errorOpacity, marginTop: 0 }]}
            >
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.statusContent}>
            <Text style={styles.statusTargetLabel}>Veiculo</Text>
            <Text style={styles.statusTargetValue}>{statusTarget?.placa}</Text>
            <Text style={styles.statusTargetHint}>Selecione o novo status.</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => {
                const active = statusValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.statusOption, active && styles.statusOptionActive]}
                    onPress={() => setStatusValue(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.statusOptionText, active && styles.statusOptionTextActive]}>
                      {STATUS_LABELS[option]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonGhost]}
              onPress={closeStatus}
              activeOpacity={0.75}
              disabled={actionLoading}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleStatusUpdate}
              activeOpacity={0.75}
              disabled={actionLoading}
            >
              <Text style={styles.modalButtonText}>
                {actionLoading ? 'Salvando...' : 'Atualizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Remover veiculo</Text>
            <Text style={styles.modalBody}>
              Deseja remover o veiculo {deleteTarget?.placa}?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonGhost]}
                onPress={closeDeleteModal}
                activeOpacity={0.75}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={runDelete}
                activeOpacity={0.75}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonText}>
                  {actionLoading ? 'Excluindo...' : 'Excluir'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050a1e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll: { paddingBottom: 40, backgroundColor: '#060c22' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, position: 'relative', overflow: 'hidden' },
  glowAccent: { position: 'absolute', top: -70, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(14,165,233,0.18)' },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 10, color: '#e2e8f0', fontSize: 14 },
  searchButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  searchButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  headerActionButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
  headerActionGhost: { backgroundColor: 'rgba(14,165,233,0.12)', borderColor: 'rgba(14,165,233,0.3)' },
  headerActionText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  errorBanner: { marginHorizontal: 24, marginTop: 12, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 0.5, borderColor: 'rgba(239,68,68,0.4)', padding: 12, borderRadius: 12 },
  errorText: { color: '#fecaca', fontSize: 12, fontWeight: '600' },
  manageCard: { marginHorizontal: 24, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  manageTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '700' },
  manageSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 4, maxWidth: 200 },
  primaryButton: { backgroundColor: '#0ea5e9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 12, paddingHorizontal: 24, marginTop: 20 },
  emptyState: { marginHorizontal: 24, padding: 18, borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  emptyTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { color: '#94a3b8', fontSize: 12 },
  veiculoCard: { marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  veiculoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  placaText: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  veiculoModelo: { color: '#f8fafc', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  veiculoMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  veiculoMeta: { color: '#94a3b8', fontSize: 12 },
  veiculoActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  veiculoActionButton: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  veiculoActionDanger: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
  veiculoActionText: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  fullScreen: { flex: 1, paddingTop: 60 },
  fullHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  fullTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '700' },
  fullClose: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  formContent: { paddingHorizontal: 24, paddingBottom: 120 },
  statusContent: { paddingHorizontal: 24, paddingBottom: 120 },
  statusTargetLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  statusTargetValue: { color: '#f8fafc', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  statusTargetHint: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  modalLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  modalBody: { color: '#cbd5e1', fontSize: 13, marginBottom: 14 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 10, color: '#e2e8f0', fontSize: 14, marginBottom: 12 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statusOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  statusOptionActive: { backgroundColor: 'rgba(14,165,233,0.2)', borderColor: 'rgba(14,165,233,0.4)' },
  statusOptionText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  statusOptionTextActive: { color: '#e0f2fe' },
  formActions: { position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(3,6,14,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 18, backgroundColor: '#0b1329', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', padding: 20 },
  modalTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 6 },
  modalButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  modalButtonDanger: { backgroundColor: 'rgba(239,68,68,0.9)' },
  modalButtonGhost: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
  modalButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
