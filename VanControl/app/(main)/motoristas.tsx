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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import {
  motoristasService,
} from '../../services/api';

type MotoristaFormState = {
  nome: string;
  email: string;
  cpf: string;
  cnh: string;
  categoriaCnh: string;
  dataValidadeCnh: string;
  telefone: string;
  senha: string;
};

const CATEGORIAS_CNH = ['A', 'B', 'AB', 'C', 'D', 'E', 'AC', 'AD', 'AE'];

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  let formatted = part1;
  if (part2) formatted += `.${part2}`;
  if (part3) formatted += `.${part3}`;
  if (part4) formatted += `-${part4}`;
  return formatted;
}

function formatCnh(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  let formatted = part1;
  if (part2) formatted += `.${part2}`;
  if (part3) formatted += `.${part3}`;
  if (part4) formatted += `-${part4}`;
  return formatted;
}

function formatTelefone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const part1 = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const part2 = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);
  let formatted = ddd ? `(${ddd}` : '';
  if (ddd.length === 2) formatted += ') ';
  if (part1) formatted += part1;
  if (part2) formatted += `-${part2}`;
  return formatted;
}

function formatDataValidadeCnh(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  const month = digits.slice(0, 2);
  const year = digits.slice(2, 4);
  return year ? `${month}/${year}` : month;
}

function convertDataValidadeCnhToBackend(dataDisplay: string): string {
  const match = dataDisplay.match(/(\d{2})\/(\d{4})/);
  if (match) {
    return `${match[2]}/${match[1]}`;
  }
  return dataDisplay;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function MotoristasScreen() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState('Nenhum motorista cadastrado.');
  const [searchTerm, setSearchTerm] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState<MotoristaFormState>({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    cnh: '',
    categoriaCnh: '',
    dataValidadeCnh: '',
    telefone: '',
  });
  const [telefoneEdit, setTelefoneEdit] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  const loadMotoristas = useCallback(async () => {
    const clearErrorLocal = () => {
      setError(null);
      errorOpacity.setValue(0);
    };

    const showErrorLocal = (message: string) => {
      setError(message);
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    clearErrorLocal();
    setLoading(true);
    setEmptyMessage('Nenhum motorista cadastrado.');
    try {
      const data = await motoristasService.listar();
      setMotoristas(data ?? []);
    } catch (err) {
      setMotoristas([]);
      showErrorLocal(err instanceof Error ? err.message : 'Erro ao carregar motoristas');
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
  }, [fadeAnim, slideAnim, errorOpacity]);

  useEffect(() => {
    if (!authLoading && isAdmin) loadMotoristas();
  }, [authLoading, isAdmin, loadMotoristas]);

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
      nome: '',
      email: '',
      senha: '',
      cpf: '',
      cnh: '',
      categoriaCnh: '',
      dataValidadeCnh: '',
      telefone: '',
    });
  }

  async function handleSearch() {
    clearError();
    setSearching(true);
    try {
      const digits = onlyDigits(searchTerm);
      if (!digits) {
        await loadMotoristas();
        return;
      }
      if (digits.length !== 11) {
        showError('Informe um CPF valido para buscar.');
        return;
      }
      const data = await motoristasService.buscarPorCpf(digits);
      setMotoristas(data ? [data] : []);
      setEmptyMessage('Nenhum motorista encontrado para o CPF informado.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar motorista';
      const normalized = normalizeText(message);
      if (normalized.includes('nao encontrado')) {
        setMotoristas([]);
        setEmptyMessage('Nenhum motorista encontrado para o CPF informado.');
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

  function openEdit(motorista: any) {
    clearError();
    setEditTarget(motorista);
    setTelefoneEdit(motorista.telefone ?? '');
  }

  function closeEdit() {
    setEditTarget(null);
    setTelefoneEdit('');
  }

  function confirmDelete(motorista: any) {
    setDeleteTarget(motorista);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  function isValidCompetencia(value: string) {
    return /^[0-9]{4}\/[0-9]{2}$/.test(value);
  }

  async function handleCreate() {
    clearError();
    const cpfDigits = onlyDigits(form.cpf);
    const cnhDigits = onlyDigits(form.cnh);
    const telefoneFormatado = formatTelefone(form.telefone);

    if (!form.nome.trim()) {
      showError('Informe o nome do motorista.');
      return;
    }
    if (!form.email.trim()) {
      showError('Informe o email do motorista.');
      return;
    }
    if (cpfDigits.length !== 11) {
      showError('Informe um CPF valido.');
      return;
    }
    if (cnhDigits.length !== 11) {
      showError('Informe a CNH com 11 digitos.');
      return;
    }
    if (!CATEGORIAS_CNH.includes(form.categoriaCnh.trim().toUpperCase())) {
      showError('Informe uma categoria valida (ex: A, B, AB).');
      return;
    }
    const dataValidadeFormatted = form.dataValidadeCnh.trim();
    if (!/^(\d{2})\/(\d{4})$/.test(dataValidadeFormatted)) {
      showError('Validade da CNH deve estar no formato MM/yyyy.');
      return;
    }
    if (onlyDigits(telefoneFormatado).length < 10) {
      showError('Informe um telefone valido.');
      return;
    }
    if (!form.senha.trim()) {
      showError('Informe a senha.');
      return;
    }

    const payload: any = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      password: form.senha.trim(),
      cpf: cpfDigits,
      cnh: cnhDigits,
      categoriaCnh: form.categoriaCnh.trim().toUpperCase(),
      dataValidadeCnh: convertDataValidadeCnhToBackend(dataValidadeFormatted),
      telefone: telefoneFormatado,
    };

    setActionLoading(true);
    try {
      await motoristasService.cadastrar(payload);
      closeCreate();
      await loadMotoristas();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao cadastrar motorista');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateTelefone() {
    if (!editTarget) return;
    clearError();
    const telefoneFormatado = formatTelefone(telefoneEdit);
    if (onlyDigits(telefoneFormatado).length < 10) {
      showError('Informe um telefone valido.');
      return;
    }

    setActionLoading(true);
    try {
      await motoristasService.atualizarTelefone(editTarget.cpf, telefoneFormatado);
      closeEdit();
      await loadMotoristas();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao atualizar telefone');
    } finally {
      setActionLoading(false);
    }
  }

  async function runDelete() {
    if (!deleteTarget) return;
    clearError();
    setActionLoading(true);
    try {
      await motoristasService.deletar(deleteTarget.cpf);
      await loadMotoristas();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao remover motorista');
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

  if (!user) return null;

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0b1436', '#050a1e']} style={styles.header}>
          <View style={styles.glowAccent} />
          <Text style={styles.title}>Motoristas</Text>
          <Text style={styles.subtitle}>Acesso restrito para administradores.</Text>
        </LinearGradient>
        <View style={styles.blockedBox}>
          <Text style={styles.blockedText}>Voce nao tem permissao para acessar esta tela.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(main)')}>
            <Text style={styles.primaryButtonText}>Voltar ao inicio</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.title}>Motoristas</Text>
          <Text style={styles.subtitle}>Gerencie cadastros e atualize telefones rapidamente.</Text>
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Buscar por CPF"
              placeholderTextColor="#64748b"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={(value) => setSearchTerm(formatCpf(value))}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              keyboardType="numeric"
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
              onPress={loadMotoristas}
              activeOpacity={0.75}
            >
              <Text style={styles.headerActionText}>Atualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerActionButton, styles.headerActionGhost]}
              onPress={openCreate}
              activeOpacity={0.75}
            >
              <Text style={styles.headerActionText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {error && (
            <Animated.View style={[styles.errorBox, { opacity: errorOpacity }] }>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {motoristas.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            motoristas.map((motorista) => (
              <View key={motorista.cpf} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{motorista.nome}</Text>
                  <Text style={styles.cardCpf}>{formatCpf(motorista.cpf)}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Telefone</Text>
                  <Text style={styles.cardValue}>{motorista.telefone}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>CNH</Text>
                  <Text style={styles.cardValue}>{motorista.cnh}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Categoria</Text>
                  <Text style={styles.cardValue}>{motorista.categoriaCnh}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Validade</Text>
                  <Text style={styles.cardValue}>{motorista.dataValidadeCnh}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => openEdit(motorista)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.secondaryButtonText}>Editar telefone</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={() => confirmDelete(motorista)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.dangerButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </Animated.ScrollView>

      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={closeCreate}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrap}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Cadastrar motorista</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalLabel}>Nome completo</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.nome}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, nome: value }))}
                  placeholder="Nome do motorista"
                  placeholderTextColor="#64748b"
                />

                <Text style={styles.modalLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.email}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
                  placeholder="email@vancontrol.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.modalLabel}>CPF</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.cpf}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, cpf: formatCpf(value) }))}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />

                <Text style={styles.modalLabel}>CNH</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.cnh}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, cnh: formatCnh(value) }))}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />

                <Text style={styles.modalLabel}>Categoria CNH</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.categoriaCnh}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, categoriaCnh: value.toUpperCase() }))}
                  placeholder="A, B, AB..."
                  placeholderTextColor="#64748b"
                  autoCapitalize="characters"
                />

                <Text style={styles.modalLabel}>Validade CNH</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.dataValidadeCnh}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, dataValidadeCnh: formatDataValidadeCnh(value) }))}
                  placeholder="MM/yyyy"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />

                <Text style={styles.modalLabel}>Telefone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.telefone}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, telefone: formatTelefone(value) }))}
                  placeholder="(11) 91234-5678"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                />

                <Text style={styles.modalLabel}>Senha</Text>
                <TextInput
                  style={styles.modalInput}
                  value={form.senha}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, senha: value }))}
                  placeholder="Defina uma senha"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                />
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.ghostButton} onPress={closeCreate}>
                  <Text style={styles.ghostButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCreate}
                  disabled={actionLoading}
                >
                  <Text style={styles.primaryButtonText}>{actionLoading ? 'Salvando...' : 'Salvar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={!!editTarget} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardSmall}>
            <Text style={styles.modalTitle}>Atualizar telefone</Text>
            <Text style={styles.modalSubtitle}>{editTarget?.nome}</Text>
            <TextInput
              style={styles.modalInput}
              value={telefoneEdit}
              onChangeText={(value) => setTelefoneEdit(formatTelefone(value))}
              placeholder="(11) 91234-5678"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.ghostButton} onPress={closeEdit}>
                <Text style={styles.ghostButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUpdateTelefone}
                disabled={actionLoading}
              >
                <Text style={styles.primaryButtonText}>{actionLoading ? 'Salvando...' : 'Atualizar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={closeDeleteModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardSmall}>
            <Text style={styles.modalTitle}>Remover motorista</Text>
            <Text style={styles.modalSubtitle}>Tem certeza que deseja remover {deleteTarget?.nome}?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.ghostButton} onPress={closeDeleteModal}>
                <Text style={styles.ghostButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={runDelete}
                disabled={actionLoading}
              >
                <Text style={styles.dangerButtonText}>{actionLoading ? 'Removendo...' : 'Remover'}</Text>
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
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 18, position: 'relative', overflow: 'hidden' },
  glowAccent: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(34,197,94,0.12)' },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 18 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#e2e8f0', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  searchButton: { backgroundColor: '#22c55e', paddingHorizontal: 18, borderRadius: 12, justifyContent: 'center' },
  searchButtonText: { color: '#05140a', fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  headerActionButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  headerActionGhost: { backgroundColor: 'rgba(34,197,94,0.2)' },
  headerActionText: { color: '#e2e8f0', fontWeight: '600', fontSize: 12 },
  errorBox: { marginHorizontal: 24, marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 0.5, borderColor: 'rgba(239,68,68,0.5)' },
  errorText: { color: '#fecaca', fontWeight: '600', fontSize: 12 },
  emptyBox: { marginHorizontal: 24, marginTop: 18, padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)' },
  emptyText: { color: '#94a3b8', fontSize: 13 },
  card: { marginHorizontal: 24, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  cardCpf: { color: '#94a3b8', fontSize: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  cardLabel: { color: '#64748b', fontSize: 12 },
  cardValue: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryButton: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(37,99,235,0.2)', alignItems: 'center' },
  secondaryButtonText: { color: '#93c5fd', fontWeight: '600', fontSize: 12 },
  dangerButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.18)' },
  dangerButtonText: { color: '#fecaca', fontWeight: '600', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(5,10,30,0.82)', justifyContent: 'center', padding: 20 },
  modalWrap: { flex: 1, justifyContent: 'center' },
  modalCard: { backgroundColor: '#0b1436', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalCardSmall: { backgroundColor: '#0b1436', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 12 },
  modalLabel: { color: '#94a3b8', fontSize: 12, marginTop: 12, marginBottom: 6 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#e2e8f0', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  ghostButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  ghostButtonText: { color: '#cbd5e1', fontWeight: '600' },
  primaryButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#22c55e', alignItems: 'center' },
  primaryButtonText: { color: '#05140a', fontWeight: '700' },
  blockedBox: { margin: 24, padding: 18, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', gap: 14 },
  blockedText: { color: '#94a3b8', fontSize: 13 },
});
