import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, TextInput, Alert, Platform, Modal, Pressable } from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthUser } from '../../hooks/useAuth';
import { rotasService } from '../../services/api';

type Rota = {
  codigoRota: string;
  descricao: string;
  destino: string;
  distancia: number;
  tempoEstimado: string;
};

const allowedRoles = ['ADMIN', 'MOTORISTA'];

interface Props {
  user: AuthUser;
}

export default function RotasAdminScreen({ user }: Props) {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [searchDestino, setSearchDestino] = useState('');
  const [searching, setSearching] = useState(false);

  const [createDestino, setCreateDestino] = useState('');
  const [createDescricao, setCreateDescricao] = useState('');
  const [createDistancia, setCreateDistancia] = useState('');
  const [createTempo, setCreateTempo] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [activeEdit, setActiveEdit] = useState<string | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [modalPendingCodigo, setModalPendingCodigo] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  };

  const loadRotas = useCallback(async () => {
    setError(null);
    setLoading(true);
    setMessage(null);

    try {
      const data = await rotasService.listar();
      setRotas(Array.isArray(data) ? data : []);
    } catch (exception) {
      setError((exception as Error).message || 'Não foi possível carregar as rotas.');
    } finally {
      setLoading(false);
      animateIn();
    }
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    loadRotas();
  }, [loadRotas]);

  const handleSearch = async () => {
    if (!searchDestino.trim()) {
      loadRotas();
      return;
    }

    setError(null);
    setSearching(true);
    setMessage(null);

    try {
      const data = await rotasService.buscarPorDestino(searchDestino.trim());
      setRotas(Array.isArray(data) ? data : []);
    } catch (exception) {
      setError((exception as Error).message || 'Falha ao buscar rotas por destino.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchDestino('');
    loadRotas();
  };

  const handleCreateRoute = async () => {
    const destino = createDestino.trim();
    const descricao = createDescricao.trim();
    const distancia = Number(createDistancia.replace(',', '.'));
    const tempoEstimado = createTempo.trim();

    if (!destino || !descricao || !createDistancia || !tempoEstimado) {
      setError('Preencha todos os campos de criação de rota.');
      return;
    }

    if (Number.isNaN(distancia) || distancia <= 0) {
      setError('Informe uma distância válida maior que zero.');
      return;
    }

    setError(null);
    setCreateLoading(true);
    setMessage(null);

    try {
      await rotasService.criar({ destino, descricao, distancia, tempoEstimado });
      setMessage('Rota criada com sucesso.');
      setCreateDestino('');
      setCreateDescricao('');
      setCreateDistancia('');
      setCreateTempo('');
      await loadRotas();
    } catch (exception) {
      setError((exception as Error).message || 'Erro ao criar rota.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStartEdit = (rota: Rota) => {
    setActiveEdit(rota.codigoRota);
    setEditDescricao(rota.descricao ?? '');
    setMessage(null);
    setError(null);
  };

  const handleUpdateDescricao = async (codigoRota: string) => {
    if (!editDescricao.trim()) {
      setError('Informe a nova descrição antes de atualizar.');
      return;
    }

    setError(null);
    setActionLoading(true);
    setMessage(null);

    try {
      await rotasService.atualizarDescricao(codigoRota, editDescricao.trim());
      setMessage('Descrição atualizada com sucesso.');
      setActiveEdit(null);
      setEditDescricao('');
      await loadRotas();
    } catch (exception) {
      setError((exception as Error).message || 'Erro ao atualizar descrição.');
    } finally {
      setActionLoading(false);
    }
  };

  const performDelete = async () => {
    if (!modalPendingCodigo) return;

    const codigoRota = modalPendingCodigo;
    setDeleteModalVisible(false);
    setModalPendingCodigo(null);
    setError(null);
    setActionLoading(true);
    setMessage(null);
    console.log('[DEBUG] performDelete web', codigoRota);

    try {
      await rotasService.deletar(codigoRota);
      setMessage('Rota deletada com sucesso.');
      await loadRotas();
    } catch (exception) {
      console.error('[DEBUG] erro delete rota', exception);
      setError((exception as Error).message || 'Erro ao deletar rota.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (codigoRota: string) => {
    if (Platform.OS === 'web') {
      setModalPendingCodigo(codigoRota);
      setDeleteModalVisible(true);
      return;
    }

    Alert.alert(
      'Deletar rota',
      'Deseja remover esta rota permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            setError(null);
            setActionLoading(true);
            setMessage(null);
            try {
              await rotasService.deletar(codigoRota);
              setMessage('Rota deletada com sucesso.');
              await loadRotas();
            } catch (exception) {
              setError((exception as Error).message || 'Erro ao deletar rota.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  if (!allowedRoles.includes(user.role ?? '')) {
    return (
      <View style={styles.center}>
        <Text style={styles.lockTitle}>Acesso restrito</Text>
        <Text style={styles.lockSubtitle}>Somente administradores e motoristas podem acessar esta área.</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={['#050a1e', '#07152f']} style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroLabel}>Rotas</Text>
        <Text style={styles.heroTitle}>Administração de rotas</Text>
        <Text style={styles.heroSubtitle}>
          Crie, busque, atualize e delete rotas do sistema.
        </Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statValue}>{rotas.length}</Text>
            <Text style={styles.statLabel}>Rotas</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCyan]}>
            <Text style={styles.statValue}>{rotas.filter((item) => item.destino).length}</Text>
            <Text style={styles.statLabel}>Destinos</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}> 
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Buscar por destino</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={searchDestino}
              onChangeText={setSearchDestino}
              placeholder="Digite o destino"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} activeOpacity={0.75} disabled={searching}>
              <Text style={styles.primaryButtonText}>{searching ? 'Buscando...' : 'Buscar'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClearSearch} activeOpacity={0.75}>
            <Text style={styles.secondaryButtonText}>Mostrar todas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cadastrar rota</Text>
          <TextInput
            value={createDestino}
            onChangeText={setCreateDestino}
            placeholder="Destino"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <TextInput
            value={createDescricao}
            onChangeText={setCreateDescricao}
            placeholder="Descrição"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            multiline
          />
          <View style={styles.inlineInputs}>
            <TextInput
              value={createDistancia}
              onChangeText={setCreateDistancia}
              placeholder="Distância (km)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              style={[styles.input, styles.smallInput]}
            />
            <TextInput
              value={createTempo}
              onChangeText={setCreateTempo}
              placeholder="Tempo estimado"
              placeholderTextColor="#94a3b8"
              style={[styles.input, styles.smallInput]}
            />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoute} activeOpacity={0.75} disabled={createLoading}>
            <Text style={styles.primaryButtonText}>{createLoading ? 'Criando...' : 'Criar rota'}</Text>
          </TouchableOpacity>
        </View>

        {message ? (
          <View style={[styles.messageCard, styles.successCard]}>
            <Text style={styles.messageTitle}>{message}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.messageCard, styles.errorCard]}>
            <Text style={styles.messageTitle}>Atenção</Text>
            <Text style={styles.messageText}>{error}</Text>
          </View>
        ) : null}

        {rotas.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Nenhuma rota encontrada</Text>
            <Text style={styles.messageText}>Use a pesquisa ou cadastre uma nova rota para começar.</Text>
          </View>
        ) : (
          rotas.map((rota) => (
            <View key={rota.codigoRota} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeTitle}>{rota.destino}</Text>
                <View style={styles.routeTag}>
                  <Text style={styles.routeTagText}>{rota.codigoRota}</Text>
                </View>
              </View>
              <Text style={styles.routeDescription}>{rota.descricao || 'Descrição não informada.'}</Text>
              <View style={styles.routeFooter}>
                <View style={styles.pill}><Text style={styles.pillText}>{rota.distancia?.toFixed(1)} km</Text></View>
                <View style={styles.pill}><Text style={styles.pillText}>{rota.tempoEstimado || '—'} h</Text></View>
              </View>

              {activeEdit === rota.codigoRota ? (
                <View style={styles.editSection}>
                  <TextInput
                    value={editDescricao}
                    onChangeText={setEditDescricao}
                    placeholder="Nova descrição"
                    placeholderTextColor="#94a3b8"
                    style={[styles.input, styles.editInput]}
                    multiline
                  />
                  <View style={styles.rowButtons}>
                    <TouchableOpacity
                      style={[styles.primaryButton, styles.smallButton]}
                      onPress={() => handleUpdateDescricao(rota.codigoRota)}
                      activeOpacity={0.75}
                      disabled={actionLoading}
                    >
                      <Text style={styles.primaryButtonText}>{actionLoading ? 'Salvando...' : 'Salvar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.secondaryButton, styles.smallButton]}
                      onPress={() => setActiveEdit(null)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.secondaryButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.smallButton]}
                    onPress={() => handleStartEdit(rota)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.primaryButtonText}>Editar descrição</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.smallButton]}
                    onPress={() => handleDelete(rota.codigoRota)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.secondaryButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => { setDeleteModalVisible(false); setModalPendingCodigo(null); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Confirmar exclusão</Text>
              <Text style={styles.modalText}>Deseja realmente deletar a rota {modalPendingCodigo}?</Text>
              <View style={styles.modalButtons}>
                <Pressable style={[styles.modalButton, styles.dangerButton]} onPress={performDelete}>
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => { setDeleteModalVisible(false); setModalPendingCodigo(null); }}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </View>
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
  statCardCyan: { borderColor: '#0ea5e9' },
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
  routeFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)' },
  pillText: { fontSize: 12, fontWeight: '700', color: '#e2e8f0' },
  editSection: { gap: 12 },
  editInput: { minHeight: 90, textAlignVertical: 'top' },
  rowButtons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  smallButton: { flex: 1, paddingVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '88%', maxWidth: 520, borderRadius: 16, backgroundColor: '#071425', padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#cbd5e1', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  modalButton: { flex: 1, borderRadius: 12, paddingVertical: 12, backgroundColor: '#2563eb', alignItems: 'center' },
  modalButtonText: { color: '#eff6ff', fontWeight: '700' },
  cancelButton: { backgroundColor: 'rgba(255,255,255,0.06)' },
  dangerButton: { backgroundColor: 'rgba(239,68,68,0.9)' },
  lockTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  lockSubtitle: { fontSize: 14, lineHeight: 20, color: '#94a3b8', textAlign: 'center' },
});
