import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, TextInput, Alert, Platform, Modal, Pressable } from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthUser } from '../../hooks/useAuth';
import { veiculosService } from '../../services/api';

type Veiculo = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidade: number;
  status?: string;
};

const allowedRoles = ['ADMIN', 'MOTORISTA'];

interface Props { user: AuthUser }

export default function VeiculosMotoristaScreen({ user }: Props) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [searchPlaca, setSearchPlaca] = useState('');
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [createPlaca, setCreatePlaca] = useState('');
  const [createMarca, setCreateMarca] = useState('');
  const [createModelo, setCreateModelo] = useState('');
  const [createAno, setCreateAno] = useState('');
  const [createCapacidade, setCreateCapacidade] = useState('');
  const [createRenavam, setCreateRenavam] = useState('');
  const [createStatus, setCreateStatus] = useState('DISPONIVEL');
  const [createLoading, setCreateLoading] = useState(false);

  const STATUS_OPTIONS = ['DISPONIVEL', 'MANUTENCAO', 'INATIVO'];

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [modalPendingPlaca, setModalPendingPlaca] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  };

  const loadVeiculos = useCallback(async () => {
    setError(null); setLoading(true); setMessage(null);
    try { const data = await veiculosService.listar(); setVeiculos(Array.isArray(data) ? data : []); }
    catch (e) { setError((e as Error).message || 'Não foi possível carregar os veículos.'); }
    finally { setLoading(false); animateIn(); }
  }, [fadeAnim, slideAnim]);

  useEffect(() => { loadVeiculos(); }, [loadVeiculos]);

  const handleSearch = async () => {
    if (!searchPlaca.trim()) { loadVeiculos(); return; }
    setError(null); setSearching(true); setMessage(null);
    try { const data = await veiculosService.buscarPorPlaca(searchPlaca.trim().toUpperCase()); setVeiculos(data ? [data] : []); }
    catch (e) { setError((e as Error).message || 'Falha ao buscar veículo por placa.'); }
    finally { setSearching(false); }
  };

  const handleClearSearch = () => { setSearchPlaca(''); loadVeiculos(); };

  const validatePlaca = (placa: string) => {
    return /^[A-Z]{3}-[0-9][A-Z0-9][0-9]{2}$/.test(placa);
  };

  const handleCreate = async () => {
    const placa = createPlaca.trim().toUpperCase();
    const marca = createMarca.trim();
    const modelo = createModelo.trim();
    const ano = Number(createAno);
    const capacidade = Number(createCapacidade);
    const renavam = createRenavam.trim();
    const status = createStatus.trim().toUpperCase();

    if (!placa || !marca || !modelo || !createAno || !createCapacidade || !renavam) {
      setError('Preencha todos os campos do cadastro.');
      return;
    }
    if (!validatePlaca(placa)) {
      setError('Placa inválida. Use o formato AAA-1A23.');
      return;
    }
    if (Number.isNaN(ano) || ano <= 1900) {
      setError('Informe um ano válido.');
      return;
    }
    if (Number.isNaN(capacidade) || capacidade <= 0) {
      setError('Informe uma capacidade válida.');
      return;
    }
    if (!/^[0-9]{11}$/.test(renavam)) {
      setError('Renavam deve ter 11 dígitos numéricos.');
      return;
    }

    setError(null); setCreateLoading(true); setMessage(null);
    try {
      await veiculosService.cadastrar({ placa, marca, modelo, ano, capacidade, renavam, status });
      setMessage('Veículo cadastrado com sucesso.');
      setCreatePlaca(''); setCreateMarca(''); setCreateModelo(''); setCreateAno(''); setCreateCapacidade(''); setCreateRenavam(''); setCreateStatus('DISPONIVEL');
      await loadVeiculos();
    } catch (e) {
      setError((e as Error).message || 'Erro ao cadastrar veículo.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = (placa: string) => {
    if (Platform.OS === 'web') {
      setModalPendingPlaca(placa.trim().toUpperCase());
      setStatusModalVisible(true);
      return;
    }

    Alert.alert('Atualizar status', 'Escolha o novo status do veículo:', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Manutenção', onPress: () => confirmUpdateStatus(placa, 'MANUTENCAO') },
      { text: 'Disponível', onPress: () => confirmUpdateStatus(placa, 'DISPONIVEL') },
      { text: 'Inativo', onPress: () => confirmUpdateStatus(placa, 'INATIVO') },
    ]);
  };

  const confirmUpdateStatus = (placa: string, status: string) => {
    const placaAtual = placa.trim().toUpperCase();
    const statusAtual = status.trim().toUpperCase();
    setError(null); setActionLoading(true); setMessage(null);
    console.log(`[DEBUG] Atualizando status: placa=${placaAtual}, status=${statusAtual}`);
    veiculosService.atualizarStatus(placaAtual, statusAtual)
      .then(async (response) => {
        console.log('[DEBUG] Status atualizado:', response);
        setMessage('Status atualizado com sucesso.');
        await loadVeiculos();
      })
      .catch((e) => {
        console.error('[DEBUG] Erro ao atualizar status:', e);
        setError((e as Error).message || 'Erro ao atualizar status.');
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const performStatusUpdate = (status: string) => {
    if (!modalPendingPlaca) return;
    confirmUpdateStatus(modalPendingPlaca, status);
    setStatusModalVisible(false);
    setModalPendingPlaca(null);
  };

  const performDelete = async () => {
    if (!modalPendingPlaca) return;
    const placaToDelete = modalPendingPlaca;
    setDeleteModalVisible(false);
    setModalPendingPlaca(null);
    setError(null); setActionLoading(true); setMessage(null);
    console.log(`[DEBUG] Deletando veículo (web modal): placa=${placaToDelete}`);
    try {
      await veiculosService.deletar(placaToDelete);
      setMessage('Veículo deletado com sucesso.');
      await loadVeiculos();
    } catch (e) {
      console.error('[DEBUG] Erro ao deletar veículo:', e);
      setError((e as Error).message || 'Erro ao deletar veículo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (placa: string) => {
    const placaAtual = placa.trim().toUpperCase();
    if (Platform.OS === 'web') {
      setModalPendingPlaca(placaAtual);
      setDeleteModalVisible(true);
      return;
    }

    Alert.alert('Deletar veículo', 'Deseja remover este veículo permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => {
          setError(null); setActionLoading(true); setMessage(null);
          console.log(`[DEBUG] Deletando veículo: placa=${placaAtual}`);
          veiculosService.deletar(placaAtual)
            .then(async (response) => {
              console.log('[DEBUG] Veículo deletado:', response);
              setMessage('Veículo deletado com sucesso.');
              await loadVeiculos();
            })
            .catch((e) => {
              console.error('[DEBUG] Erro ao deletar veículo:', e);
              setError((e as Error).message || 'Erro ao deletar veículo.');
            })
            .finally(() => {
              setActionLoading(false);
            });
        },
      },
    ]);
  };

  if (loading) return (<View style={styles.center}><ActivityIndicator color="#0ea5e9" size="large" /></View>);
  if (!allowedRoles.includes(user.role ?? '')) return (<View style={styles.center}><Text style={styles.lockTitle}>Acesso restrito</Text><Text style={styles.lockSubtitle}>Somente administradores e motoristas podem acessar esta área.</Text></View>);

  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[ '#050a1e', '#07152f' ]} style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroLabel}>Veículos</Text>
        <Text style={styles.heroTitle}>Administração de veículos</Text>
        <Text style={styles.heroSubtitle}>Consulte veículos e atualize status conforme necessário.</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statValue}>{veiculos.length}</Text>
            <Text style={styles.statLabel}>Veículos</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }] }>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Buscar por placa</Text>
          <View style={styles.inputRow}>
            <TextInput value={searchPlaca} onChangeText={setSearchPlaca} placeholder="Digite a placa" placeholderTextColor="#94a3b8" style={styles.input} returnKeyType="search" onSubmitEditing={handleSearch} />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} activeOpacity={0.75} disabled={searching}><Text style={styles.primaryButtonText}>{searching ? 'Buscando...' : 'Buscar'}</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClearSearch} activeOpacity={0.75}><Text style={styles.secondaryButtonText}>Mostrar todos</Text></TouchableOpacity>
        </View>

        {allowedRoles.includes(user.role ?? '') ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Cadastrar veículo</Text>
            <TextInput value={createPlaca} onChangeText={(value) => setCreatePlaca(value.toUpperCase())} placeholder="Placa" placeholderTextColor="#94a3b8" style={styles.input} />
            <TextInput value={createMarca} onChangeText={setCreateMarca} placeholder="Marca" placeholderTextColor="#94a3b8" style={styles.input} />
            <TextInput value={createModelo} onChangeText={setCreateModelo} placeholder="Modelo" placeholderTextColor="#94a3b8" style={styles.input} />
            <View style={styles.inlineInputs}>
              <TextInput value={createAno} onChangeText={setCreateAno} placeholder="Ano" placeholderTextColor="#94a3b8" keyboardType="numeric" style={[styles.input, styles.smallInput]} />
              <TextInput value={createCapacidade} onChangeText={setCreateCapacidade} placeholder="Capacidade" placeholderTextColor="#94a3b8" keyboardType="numeric" style={[styles.input, styles.smallInput]} />
            </View>
            <TextInput value={createRenavam} onChangeText={setCreateRenavam} placeholder="Renavam" placeholderTextColor="#94a3b8" keyboardType="numeric" style={styles.input} />
            <View style={styles.inputRow}>
              <TextInput value={createStatus} onChangeText={setCreateStatus} placeholder="Status" placeholderTextColor="#94a3b8" style={styles.input} />
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} activeOpacity={0.75} disabled={createLoading}><Text style={styles.primaryButtonText}>{createLoading ? 'Cadastrando...' : 'Cadastrar'}</Text></TouchableOpacity>
            </View>
          </View>
        ) : null}

        {message ? (<View style={[styles.messageCard, styles.successCard]}><Text style={styles.messageTitle}>{message}</Text></View>) : null}
        {error ? (<View style={[styles.messageCard, styles.errorCard]}><Text style={styles.messageTitle}>Atenção</Text><Text style={styles.messageText}>{error}</Text></View>) : null}

        {veiculos.length === 0 ? (
          <View style={styles.messageCard}><Text style={styles.messageTitle}>Nenhum veículo encontrado</Text><Text style={styles.messageText}>Use a pesquisa para localizar um veículo.</Text></View>
        ) : (
          veiculos.map(v => (
            <View key={v.placa} style={styles.routeCard}>
              <View style={styles.routeHeader}><Text style={styles.routeTitle}>{v.placa} — {v.marca} {v.modelo}</Text><View style={styles.routeTag}><Text style={styles.routeTagText}>{v.status}</Text></View></View>
              <Text style={styles.routeDescription}>Ano: {v.ano} • Capacidade: {v.capacidade} passageiros</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity style={[styles.primaryButton, styles.smallButton]} onPress={() => handleUpdateStatus(v.placa)} activeOpacity={0.75} disabled={actionLoading}><Text style={styles.primaryButtonText}>{actionLoading ? 'Processando...' : 'Atualizar status'}</Text></TouchableOpacity>
                {allowedRoles.includes(user.role ?? '') ? (
                  <TouchableOpacity style={[styles.secondaryButton, styles.smallButton]} onPress={() => handleDelete(v.placa)} activeOpacity={0.75} disabled={actionLoading}><Text style={styles.secondaryButtonText}>Excluir</Text></TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))
        )}

        {/* Status selection modal (web) */}
        <Modal visible={statusModalVisible} transparent animationType="fade" onRequestClose={() => { setStatusModalVisible(false); setModalPendingPlaca(null); }}>
          <Pressable style={styles.modalOverlay} onPress={() => { setStatusModalVisible(false); setModalPendingPlaca(null); }}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Atualizar status</Text>
              <Text style={styles.modalText}>Selecione o novo status para o veículo {modalPendingPlaca}</Text>
              <View style={styles.modalButtons}>
                {STATUS_OPTIONS.map(s => (
                  <TouchableOpacity key={s} style={styles.modalButton} onPress={() => performStatusUpdate(s)}><Text style={styles.modalButtonText}>{s}</Text></TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setStatusModalVisible(false); setModalPendingPlaca(null); }}><Text style={styles.modalButtonText}>Cancelar</Text></TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Delete confirmation modal (web) */}
        <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => { setDeleteModalVisible(false); setModalPendingPlaca(null); }}>
          <Pressable style={styles.modalOverlay} onPress={() => { setDeleteModalVisible(false); setModalPendingPlaca(null); }}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Confirmar exclusão</Text>
              <Text style={styles.modalText}>Deseja realmente deletar o veículo {modalPendingPlaca}?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.dangerButton]} onPress={performDelete}><Text style={styles.modalButtonText}>Confirmar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setDeleteModalVisible(false); setModalPendingPlaca(null); }}><Text style={styles.modalButtonText}>Cancelar</Text></TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>

      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060c22' },
  content: { paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e', padding: 28 },
  hero: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 26, position: 'relative', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(37,99,235,0.16)' },
  heroLabel: { fontSize: 11, fontWeight: '700', color: '#38bdf8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8, lineHeight: 34 },
  heroSubtitle: { fontSize: 14, color: '#94a3b8', lineHeight: 20, maxWidth: '90%' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  statCardBlue: { borderColor: '#2563eb' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.9 },
  body: { paddingHorizontal: 24, paddingTop: 20, gap: 16 },
  sectionCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 18, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12 },
  inlineInputs: { flexDirection: 'row', gap: 12 },
  smallInput: { flex: 1 },
  primaryButton: { borderRadius: 16, backgroundColor: '#2563eb', paddingVertical: 14, alignItems: 'center' },
  secondaryButton: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#eff6ff', fontWeight: '700' },
  secondaryButtonText: { color: '#cbd5e1', fontWeight: '700' },
  messageCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 18 },
  successCard: { borderColor: 'rgba(34,197,94,0.25)', backgroundColor: 'rgba(34,197,94,0.08)' },
  errorCard: { borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.08)' },
  messageTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  messageText: { fontSize: 13, color: '#cbd5e1', lineHeight: 20 },
  routeCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 20, gap: 16 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc' },
  routeTag: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(37,99,235,0.15)' },
  routeTagText: { fontSize: 11, fontWeight: '700', color: '#7dd3fc' },
  routeDescription: { fontSize: 13, color: '#cbd5e1', lineHeight: 20 },
  rowButtons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  smallButton: { flex: 1, paddingVertical: 12 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  lockSubtitle: { fontSize: 14, lineHeight: 20, color: '#94a3b8', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '88%', maxWidth: 520, borderRadius: 16, backgroundColor: '#071425', padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  modalText: { fontSize: 14, color: '#cbd5e1', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', gap: 12, marginBottom: 8, flexWrap: 'wrap' },
  modalButton: { flex: 1, borderRadius: 12, paddingVertical: 12, backgroundColor: '#2563eb', alignItems: 'center' },
  modalButtonText: { color: '#eff6ff', fontWeight: '700' },
  cancelButton: { backgroundColor: 'rgba(255,255,255,0.06)' },
  dangerButton: { backgroundColor: 'rgba(239,68,68,0.9)' },
});
