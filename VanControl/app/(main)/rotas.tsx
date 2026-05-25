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
import { Ionicons } from '@expo/vector-icons';
import { rotasService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, RESPONSIVE } from '../../constants/colors';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui/CommonComponents';

type RotaFormState = {
    descricao: string;
    destino: string;
    distancia: string;
    tempoEstimado: string;
};

export default function RotasScreen() {
    const { user, loading: authLoading } = useAuth();
    const canManage = user?.role === 'ADMIN' || user?.role === 'MOTORISTA';
    const [rotas, setRotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editTarget, setEditTarget] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [novaDescricao, setNovaDescricao] = useState('');
    const [form, setForm] = useState<RotaFormState>({
        descricao: '',
        destino: '',
        distancia: '',
        tempoEstimado: '',
    });

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
        setForm({ descricao: '', destino: '', distancia: '', tempoEstimado: '' });
        setNovaDescricao('');
    }

    const loadRotas = useCallback(async () => {
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
        try {
            const data = await rotasService.listar();
            setRotas(data);
        } catch (err) {
            setRotas([]);
            localShowError(err instanceof Error ? err.message : 'Erro ao carregar rotas');
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
        if (!authLoading) loadRotas();
    }, [authLoading, loadRotas]);

    async function handleSearch() {
        clearError();
        setSearching(true);
        try {
            const term = searchTerm.trim();
            const data = await rotasService.listar();
            const filtered = term
                ? data.filter(r => r.destino.toLowerCase().includes(term.toLowerCase()))
                : data;
            setRotas(filtered);
        } catch (err) {
            setRotas([]);
            showError(err instanceof Error ? err.message : 'Erro ao buscar rotas');
        } finally {
            setSearching(false);
        }
    }

    function openCreate() {
        resetForm();
        setEditTarget(null);
        setModalVisible(true);
    }

    function openEdit(rota: any) {
        setEditTarget(rota);
        setNovaDescricao(rota.descricaoOrigem ?? '');
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        resetForm();
        setEditTarget(null);
    }

    function closeDeleteModal() {
        setDeleteTarget(null);
    }

    async function runDelete(rota: any) {
        clearError();
        setActionLoading(true);
        try {
            await rotasService.deletar(rota.id);
            await loadRotas();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Erro ao remover rota');
        } finally {
            setActionLoading(false);
            closeDeleteModal();
        }
    }

    async function handleSave() {
        clearError();
        if (editTarget) {
            if (!novaDescricao.trim()) {
                showError('Informe a nova descricao da rota.');
                return;
            }
            setActionLoading(true);
            try {
                await rotasService.atualizarDescricao(editTarget.id, novaDescricao.trim());
                closeModal();
                await loadRotas();
            } catch (err) {
                showError(err instanceof Error ? err.message : 'Erro ao atualizar rota');
            } finally {
                setActionLoading(false);
            }
            return;
        }

        if (!form.descricao.trim() || !form.destino.trim() || !form.tempoEstimado.trim()) {
            showError('Preencha todos os campos obrigatorios.');
            return;
        }

        const distanciaNumber = Number(form.distancia.replace(',', '.'));
        if (!distanciaNumber || distanciaNumber <= 0) {
            showError('A distancia deve ser maior que zero.');
            return;
        }

        if (!/^[0-2][0-9]:[0-5][0-9]$/.test(form.tempoEstimado.trim())) {
            showError('Tempo estimado deve estar no formato HH:mm.');
            return;
        }

        setActionLoading(true);
        try {
            await rotasService.criar({
                descricao: form.descricao.trim(),
                destino: form.destino.trim(),
                distancia: distanciaNumber,
                tempoEstimado: form.tempoEstimado.trim(),
            });
            closeModal();
            await loadRotas();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Erro ao cadastrar rota');
        } finally {
            setActionLoading(false);
        }
    }

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    return (
        <Animated.ScrollView
            style={[styles.container, { opacity: fadeAnim }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <LinearGradient colors={COLORS.gradient.hero} style={styles.header}>
                <View style={styles.glowCircle} />
                <View style={styles.glowCircle2} />
                
                <Text style={styles.headerTitle}>Rotas</Text>
                <Text style={styles.headerSubtitle}>Consulte destinos e gerencie as rotas ativas</Text>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={16} color={COLORS.purple.medium} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Buscar por ponto de partida"
                        placeholderTextColor={COLORS.neutral.text.secondary}
                        style={styles.searchInput}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchTerm.trim() && (
                        <TouchableOpacity onPress={() => { setSearchTerm(''); loadRotas(); }}>
                            <Ionicons name="close-circle" size={16} color={COLORS.neutral.text.secondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={loadRotas} disabled={searching}>
                        <Ionicons name="refresh-outline" size={14} color={COLORS.purple.light} />
                        <Text style={styles.actionButtonText}>Atualizar</Text>
                    </TouchableOpacity>
                    {canManage && (
                        <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]} onPress={openCreate}>
                            <Ionicons name="add-outline" size={14} color={COLORS.neutral.white} />
                            <Text style={[styles.actionButtonText, { color: COLORS.neutral.white }]}>Cadastrar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* Error Banner */}
            {error && (
                <Animated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
                    <Ionicons name="alert-circle-outline" size={16} color={COLORS.status.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}

            {/* Content */}
            <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}>
                {rotas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <EmptyState 
                            icon="map-outline"
                            title="Nenhuma rota encontrada"
                            description="Ajuste a busca ou cadastre uma nova rota"
                        />
                    </View>
                ) : (
                    <View>
                        <Text style={styles.sectionLabel}>Rotas disponíveis ({rotas.length})</Text>
                        {rotas.map((rota) => (
                            <View key={rota.id} style={styles.card}>
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleBox}>
                                        <Text style={styles.cardTitle}>{rota.descricao}</Text>
                                        <Text style={styles.cardCode}>#{rota.codigoRota}</Text>
                                    </View>
                                    <View style={styles.cardBadge}>
                                        <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.status.success} />
                                    </View>
                                </View>

                                {/* Card Info */}
                                <Text style={styles.cardDescription}>{rota.descricaoOrigem}</Text>

                                <View style={styles.cardMeta}>
                                    <MetaItem icon="pin-outline" label="Ponto de partida" value={rota.destino} />
                                    <MetaItem icon="navigate-outline" label="Distância" value={`${rota.distancia} km`} />
                                    <MetaItem icon="timer-outline" label="Tempo" value={rota.tempoEstimado} />
                                </View>

                                {/* Actions */}
                                {canManage && (
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity 
                                            style={styles.actionButtonCard} 
                                            onPress={() => openEdit(rota)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="create-outline" size={14} color={COLORS.purple.light} />
                                            <Text style={styles.actionButtonCardText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.actionButtonCard, styles.actionButtonCardDanger]} 
                                            onPress={() => setDeleteTarget(rota)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash-outline" size={14} color={COLORS.status.danger} />
                                            <Text style={[styles.actionButtonCardText, { color: COLORS.status.danger }]}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </Animated.View>

            {/* Create/Edit Modal */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editTarget ? 'Atualizar descrição' : 'Cadastrar rota'}
                            </Text>

                            {editTarget ? (
                                <>
                                    <Text style={styles.modalLabel}>Nova descrição</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Descrição da rota"
                                        placeholderTextColor={COLORS.neutral.text.secondary}
                                        value={novaDescricao}
                                        onChangeText={setNovaDescricao}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.modalLabel}>Descrição</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Ex: Zona Norte - Centro"
                                        placeholderTextColor={COLORS.neutral.text.secondary}
                                        value={form.descricao}
                                        onChangeText={(value) => setForm((prev) => ({ ...prev, descricao: value }))}
                                    />
                                    <Text style={styles.modalLabel}>Ponto de partida</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Ex: Centro"
                                        placeholderTextColor={COLORS.neutral.text.secondary}
                                        value={form.destino}
                                        onChangeText={(value) => setForm((prev) => ({ ...prev, destino: value }))}
                                    />
                                    <Text style={styles.modalLabel}>Distância (km)</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Ex: 12.5"
                                        placeholderTextColor={COLORS.neutral.text.secondary}
                                        keyboardType="decimal-pad"
                                        value={form.distancia}
                                        onChangeText={(value) => setForm((prev) => ({ ...prev, distancia: value }))}
                                    />
                                    <Text style={styles.modalLabel}>Tempo estimado (HH:mm)</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Ex: 00:45"
                                        placeholderTextColor={COLORS.neutral.text.secondary}
                                        value={form.tempoEstimado}
                                        onChangeText={(value) => setForm((prev) => ({ ...prev, tempoEstimado: value }))}
                                    />
                                </>
                            )}

                            <View style={styles.modalActions}>
                                <Button 
                                    label="Cancelar" 
                                    onPress={closeModal} 
                                    variant="secondary"
                                    disabled={actionLoading}
                                    style={{ flex: 1 }}
                                />
                                <Button 
                                    label={actionLoading ? 'Salvando...' : 'Salvar'} 
                                    onPress={handleSave} 
                                    variant="primary"
                                    loading={actionLoading}
                                    disabled={actionLoading}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Modal */}
            <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconBox}>
                            <Ionicons name="alert-circle-outline" size={32} color={COLORS.status.danger} />
                        </View>
                        <Text style={styles.modalTitle}>Confirmar exclusão</Text>
                        <Text style={styles.modalBody}>
                            Deseja remover a rota "{deleteTarget?.descricao}"?
                        </Text>
                        <View style={styles.modalActions}>
                            <Button 
                                label="Cancelar" 
                                onPress={() => setDeleteTarget(null)} 
                                variant="secondary"
                                disabled={actionLoading}
                                style={{ flex: 1 }}
                            />
                            <Button 
                                label={actionLoading ? 'Excluindo...' : 'Excluir'} 
                                onPress={() => deleteTarget && runDelete(deleteTarget)} 
                                variant="danger"
                                loading={actionLoading}
                                disabled={actionLoading}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </Animated.ScrollView>
    );
}

// Meta Item Component
function MetaItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon as any} size={12} color={COLORS.purple.medium} />
      <View style={styles.metaContent}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    paddingBottom: SPACING.xxxl,
  },

  // Header
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: RESPONSIVE.getPadding(),
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(167,139,250,0.13)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  headerTitle: {
    fontSize: RESPONSIVE.getHeaderSize(),
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.secondary,
    marginBottom: SPACING.lg,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.neutral.text.primary,
    fontSize: FONT_SIZES.base,
  },

  // Header Actions
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
  },
  actionButtonPrimary: {
    backgroundColor: 'rgba(167,139,250,0.3)',
    borderColor: 'rgba(167,139,250,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLORS.neutral.text.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: RESPONSIVE.getPadding(),
    marginTop: SPACING.md,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(239,68,68,0.4)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    flex: 1,
    color: '#fecaca',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Body
  body: {
    paddingHorizontal: RESPONSIVE.getPadding(),
    paddingTop: SPACING.lg,
    gap: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.text.primary,
  },
  cardCode: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.text.secondary,
    marginTop: SPACING.xs,
  },
  cardBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.secondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cardMeta: {
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.neutral.borderLight,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.text.secondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  metaValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: SPACING.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButtonCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  actionButtonCardDanger: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  actionButtonCardText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.purple.light,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Empty
  emptyContainer: {
    paddingVertical: SPACING.xxxl,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalScroll: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    paddingVertical: SPACING.xl,
    paddingHorizontal: RESPONSIVE.getPadding(),
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.3)',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.neutral.text.primary,
    fontSize: FONT_SIZES.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});