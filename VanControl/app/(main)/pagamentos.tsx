import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import {
  pagamentosService,
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

type CreateFormState = {
  cpf: string;
  competencia: string;
  valor: string;
  dataVencimento: string;
};

type StatusFormState = {
  status: string;
  dataPagamento: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
};

export default function PagamentosScreen() {
  const { user, loading: authLoading } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MOTORISTA';
  const canDelete = user?.role === 'ADMIN';
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competencia, setCompetencia] = useState(currentCompetencia());
  const [cpfSearch, setCpfSearch] = useState('');
  const [codigoSearch, setCodigoSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [showVencimentoPicker, setShowVencimentoPicker] = useState(false);
  const [showPagamentoPicker, setShowPagamentoPicker] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [vencimentoDate, setVencimentoDate] = useState<Date | null>(null);
  const [pagamentoDate, setPagamentoDate] = useState<Date | null>(null);
  const [form, setForm] = useState<CreateFormState>({
    cpf: '',
    competencia: currentCompetencia(),
    valor: '',
    dataVencimento: '',
  });
  const [statusForm, setStatusForm] = useState<StatusFormState>({
    status: 'PAGO',
    dataPagamento: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  const loadInitial = useCallback(async () => {
    const clearErrorLocal = () => {
      setError(null);
      errorOpacity.setValue(0);
    };

    const showErrorLocal = (message: string) => {
      setError(message);
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    };

    clearErrorLocal();
    setLoading(true);
    try {
      if (user?.role === 'PASSAGEIRO') {
        const data = await pagamentosService.meusPagamentos();
        setPagamentos(data ?? []);
      } else if (canManage) {
        const data = await pagamentosService.listarPorCompetencia(
          competencia.trim() || currentCompetencia(),
        );
        setPagamentos(data ?? []);
      } else {
        setPagamentos([]);
      }
    } catch (err) {
      setPagamentos([]);
      showErrorLocal(err instanceof Error ? err.message : 'Erro ao carregar pagamentos');
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
  }, [competencia, canManage, user?.role, fadeAnim, slideAnim, errorOpacity]);

  useEffect(() => {
    if (!authLoading) loadInitial();
  }, [authLoading, loadInitial]);

  function showError(message: string) {
    setError(message);
    errorOpacity.setValue(0);
    Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }

  function clearError() {
    setError(null);
    errorOpacity.setValue(0);
  }

  async function handleSearchCompetencia() {
    clearError();
    const value = competencia.trim();
    if (!isCompetenciaValid(value)) {
      showError('Informe a competencia no formato mês/ano.');
      return;
    }
    setSearching(true);
    try {
      const data = await pagamentosService.listarPorCompetencia(value);
      setPagamentos(data ?? []);
    } catch (err) {
      setPagamentos([]);
      showError(err instanceof Error ? err.message : 'Erro ao buscar pagamentos');
    } finally {
      setSearching(false);
    }
  }

  async function handleSearchCpf() {
    clearError();
    const digits = onlyDigits(cpfSearch);
    if (digits.length !== 11) {
      showError('Informe um CPF valido para buscar.');
      return;
    }
    setSearching(true);
    try {
      const data = await pagamentosService.listarPorPassageiro(digits);
      setPagamentos(data ?? []);
    } catch (err) {
      setPagamentos([]);
      showError(err instanceof Error ? err.message : 'Erro ao buscar pagamentos');
    } finally {
      setSearching(false);
    }
  }

  async function handleSearchCodigo() {
    clearError();
    const codigo = codigoSearch.trim();
    if (!codigo) {
      showError('Informe o codigo do pagamento para buscar.');
      return;
    }
    setSearching(true);
    try {
      const data = await pagamentosService.buscar(codigo);
      setPagamentos(data ? [data] : []);
    } catch (err) {
      setPagamentos([]);
      showError(err instanceof Error ? err.message : 'Erro ao buscar pagamento');
    } finally {
      setSearching(false);
    }
  }

  function openCreate() {
    clearError();
    setForm({
      cpf: '',
      competencia: currentCompetencia(),
      valor: '',
      dataVencimento: '',
    });
    setVencimentoDate(null);
    setModalVisible(true);
  }

  function closeCreate() {
    setModalVisible(false);
    setShowVencimentoPicker(false);
  }

  function openStatusModal(pagamento: any) {
    if (!pagamento.codigoPagamento) {
      showError('Pagamento sem identificador para atualizar.');
      return;
    }
    setEditTarget(pagamento);
    const dataPagamento = pagamento.dataPagamento ?? '';
    setStatusForm({ status: pagamento.status, dataPagamento });
    setPagamentoDate(dataPagamento ? parseISODate(dataPagamento) : null);
    setShowPagamentoPicker(false);
    setStatusModalVisible(true);
  }

  function closeStatusModal() {
    setEditTarget(null);
    setStatusModalVisible(false);
    setShowPagamentoPicker(false);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  function handleVencimentoChange(_: unknown, selectedDate?: Date) {
    if (Platform.OS !== 'ios') setShowVencimentoPicker(false);
    if (!selectedDate) return;
    setVencimentoDate(selectedDate);
    setForm((prev) => ({ ...prev, dataVencimento: formatDateISO(selectedDate) }));
  }

  function handlePagamentoChange(_: unknown, selectedDate?: Date) {
    if (Platform.OS !== 'ios') setShowPagamentoPicker(false);
    if (!selectedDate) return;
    setPagamentoDate(selectedDate);
    setStatusForm((prev) => ({ ...prev, dataPagamento: formatDateISO(selectedDate) }));
  }

  async function handleCreate() {
    clearError();
    const cpfDigits = onlyDigits(form.cpf);
    if (cpfDigits.length !== 11) {
      showError('Informe um CPF valido.');
      return;
    }
    if (!isCompetenciaValid(form.competencia.trim())) {
      showError('Competencia invalida. Use mês/ano.');
      return;
    }
    const valorNumber = Number(form.valor.replace(',', '.'));
    if (!valorNumber || valorNumber <= 0) {
      showError('O valor deve ser maior que zero.');
      return;
    }
    if (!isDateValid(form.dataVencimento.trim())) {
      showError('Data de vencimento invalida.');
      return;
    }

    setActionLoading(true);
    try {
      await pagamentosService.criar({
        cpf: cpfDigits,
        competencia: form.competencia.trim(),
        valor: valorNumber,
        dataVencimento: form.dataVencimento.trim(),
      });
      closeCreate();
      await loadInitial();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao cadastrar pagamento');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateStatus() {
    clearError();
    if (!editTarget?.codigoPagamento) {
      showError('Pagamento sem identificador para atualizar.');
      return;
    }
    if (!isDateValid(statusForm.dataPagamento.trim())) {
      showError('Data de pagamento invalida.');
      return;
    }

    setActionLoading(true);
    try {
      await pagamentosService.atualizarStatus(
        editTarget.codigoPagamento,
        statusForm.status,
        statusForm.dataPagamento.trim()
      );
      closeStatusModal();
      await loadInitial();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    clearError();
    if (!deleteTarget?.codigoPagamento) {
      showError('Pagamento sem identificador para excluir.');
      return;
    }
    setActionLoading(true);
    try {
      await pagamentosService.deletar(deleteTarget.codigoPagamento);
      closeDeleteModal();
      await loadInitial();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao excluir pagamento');
    } finally {
      setActionLoading(false);
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
          <Text style={styles.title}>Pagamentos</Text>
          <Text style={styles.subtitle}>
            {user?.role === 'PASSAGEIRO'
              ? 'Acompanhe seus pagamentos e vencimentos.'
              : 'Gerencie pagamentos por competencia ou CPF.'}
          </Text>

          {canManage ? (
            <View style={styles.searchBlock}>
              <Text style={styles.searchLabel}>Buscar por competencia</Text>
              <View style={styles.searchRow}>
                <TextInput
                  placeholder="mês/ano"
                  placeholderTextColor="#64748b"
                  style={styles.searchInput}
                  value={competencia}
                  onChangeText={(value) => setCompetencia(formatCompetencia(value))}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchCompetencia}
                  activeOpacity={0.75}
                  disabled={searching}
                >
                  <Text style={styles.searchButtonText}>{searching ? '...' : 'Buscar'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.searchLabel, { marginTop: 12 }]}>Buscar por CPF</Text>
              <View style={styles.searchRow}>
                <TextInput
                  placeholder="000.000.000-00"
                  placeholderTextColor="#64748b"
                  style={styles.searchInput}
                  value={cpfSearch}
                  onChangeText={(value) => setCpfSearch(formatCpf(value))}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchCpf}
                  activeOpacity={0.75}
                  disabled={searching}
                >
                  <Text style={styles.searchButtonText}>{searching ? '...' : 'Buscar'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.searchLabel, { marginTop: 12 }]}>Buscar por codigo</Text>
              <View style={styles.searchRow}>
                <TextInput
                  placeholder="Informe o codigo"
                  placeholderTextColor="#64748b"
                  style={styles.searchInput}
                  value={codigoSearch}
                  onChangeText={(value) => setCodigoSearch(value)}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchCodigo}
                  activeOpacity={0.75}
                  disabled={searching}
                >
                  <Text style={styles.searchButtonText}>{searching ? '...' : 'Buscar'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={loadInitial}
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
            </View>
          ) : (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={loadInitial}
                activeOpacity={0.75}
              >
                <Text style={styles.headerActionText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {error ? (
            <Animated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <Text style={styles.sectionTitle}>
            {user?.role === 'PASSAGEIRO' ? 'Meus pagamentos' : 'Resultados'}
          </Text>
          {pagamentos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum pagamento encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Ajuste os filtros ou tente novamente mais tarde.
              </Text>
            </View>
          ) : (
            pagamentos.map((pagamento, index) => {
              const valorLabel = formatValor(pagamento.valor);
              const statusStyle = statusBadgeStyle(pagamento.status);
              return (
                <View key={pagamento.codigoPagamento ?? `${pagamento.competencia}-${index}`} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardName}>{pagamento.nome ?? 'Passageiro'}</Text>
                      <Text style={styles.cardCompetencia}>Competencia: {pagamento.competencia ?? '—'}</Text>
                    </View>
                    <View style={[styles.statusBadge, statusStyle.badge]}>
                      <Text style={[styles.statusText, statusStyle.text]}>
                        {STATUS_LABELS[pagamento.status as string] ?? pagamento.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Codigo</Text>
                    <Text style={styles.cardValue}>{pagamento.codigoPagamento ?? '—'}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Valor</Text>
                    <Text style={styles.cardValue}>{valorLabel}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Vencimento</Text>
                    <Text style={styles.cardValue}>
                      {pagamento.dataVencimento
                        ? formatDateDisplay(pagamento.dataVencimento)
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Pagamento</Text>
                    <Text style={styles.cardValue}>
                      {pagamento.dataPagamento
                        ? formatDateDisplay(pagamento.dataPagamento)
                        : '—'}
                    </Text>
                  </View>
                  {canManage ? (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => openStatusModal(pagamento)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.cardActionText}>Atualizar status</Text>
                      </TouchableOpacity>
                      {canDelete ? (
                        <TouchableOpacity
                          style={[styles.cardActionButton, styles.cardActionDanger]}
                          onPress={() => setDeleteTarget(pagamento)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.cardActionText}>Excluir</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </Animated.View>
      </Animated.ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeCreate}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cadastrar pagamento</Text>
            <Text style={styles.modalLabel}>CPF do passageiro</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="000.000.000-00"
              placeholderTextColor="#64748b"
              value={form.cpf}
              onChangeText={(value) => setForm((prev) => ({ ...prev, cpf: formatCpf(value) }))}
              keyboardType="numeric"
            />
            <Text style={styles.modalLabel}>Competencia</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="MM/yyyy"
              placeholderTextColor="#64748b"
              value={form.competencia}
              onChangeText={(value) => setForm((prev) => ({ ...prev, competencia: formatCompetencia(value) }))}
            />
            <Text style={styles.modalLabel}>Valor</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0.00"
              placeholderTextColor="#64748b"
              value={form.valor}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, valor: formatCurrencyInput(value) }))
              }
              keyboardType="numeric"
            />
            <Text style={styles.modalLabel}>Data de vencimento</Text>
            <TouchableOpacity
              style={styles.modalInputButton}
              onPress={() => setShowVencimentoPicker(true)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.modalInputText,
                  !form.dataVencimento && styles.modalPlaceholder,
                ]}
              >
                {form.dataVencimento
                  ? formatDateDisplay(form.dataVencimento)
                  : 'Selecionar data'}
              </Text>
            </TouchableOpacity>
            {showVencimentoPicker ? (
              <View style={styles.datePickerWrap}>
                {Platform.OS === 'web' ? (
                  <Calendar
                    onDayPress={(day) => {
                      setVencimentoDate(new Date(day.dateString));
                      setForm((prev) => ({ ...prev, dataVencimento: day.dateString }));
                    }}
                    markedDates={
                      form.dataVencimento
                        ? { [form.dataVencimento]: { selected: true, selectedColor: '#2563eb' } }
                        : undefined
                    }
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      dayTextColor: '#e2e8f0',
                      monthTextColor: '#e2e8f0',
                      textSectionTitleColor: '#94a3b8',
                      arrowColor: '#94a3b8',
                      todayTextColor: '#38bdf8',
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={vencimentoDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleVencimentoChange}
                  />
                )}
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.datePickerConfirm}
                    onPress={() => setShowVencimentoPicker(false)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirmar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <View style={styles.modalActions}>
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
          </View>
        </View>
      </Modal>

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeStatusModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Atualizar status</Text>
            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusRow}>
              {(Object.keys(STATUS_LABELS) as string[]).map((status) => {
                const active = statusForm.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, active && styles.statusOptionActive]}
                    onPress={() => setStatusForm((prev) => ({ ...prev, status }))}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.statusOptionText, active && styles.statusOptionTextActive]}>
                      {STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.modalLabel}>Data de pagamento</Text>
            <TouchableOpacity
              style={styles.modalInputButton}
              onPress={() => setShowPagamentoPicker(true)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.modalInputText,
                  !statusForm.dataPagamento && styles.modalPlaceholder,
                ]}
              >
                {statusForm.dataPagamento
                  ? formatDateDisplay(statusForm.dataPagamento)
                  : 'Selecionar data'}
              </Text>
            </TouchableOpacity>
            {showPagamentoPicker ? (
              <View style={styles.datePickerWrap}>
                {Platform.OS === 'web' ? (
                  <Calendar
                    onDayPress={(day) => {
                      setPagamentoDate(parseISODate(day.dateString));
                      setStatusForm((prev) => ({ ...prev, dataPagamento: day.dateString }));
                    }}
                    markedDates={
                      statusForm.dataPagamento
                        ? {
                            [statusForm.dataPagamento]: {
                              selected: true,
                              selectedColor: '#2563eb',
                            },
                          }
                        : undefined
                    }
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      dayTextColor: '#e2e8f0',
                      monthTextColor: '#e2e8f0',
                      textSectionTitleColor: '#94a3b8',
                      arrowColor: '#94a3b8',
                      todayTextColor: '#38bdf8',
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={pagamentoDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handlePagamentoChange}
                  />
                )}
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.datePickerConfirm}
                    onPress={() => setShowPagamentoPicker(false)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirmar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonGhost]}
                onPress={closeStatusModal}
                activeOpacity={0.75}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleUpdateStatus}
                activeOpacity={0.75}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonText}>
                  {actionLoading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Remover pagamento</Text>
            <Text style={styles.modalBody}>
              Deseja remover o pagamento de {deleteTarget?.nome ?? 'passageiro'}?
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
                onPress={handleDelete}
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

function currentCompetencia() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${month}/${now.getFullYear()}`;
}

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

function formatCompetencia(value: string) {
  const digits = onlyDigits(value).slice(0, 6);
  const month = digits.slice(0, 2);
  const year = digits.slice(2, 6);
  return year ? `${month}/${year}` : month;
}

function isCompetenciaValid(value: string) {
  return /^(0[1-9]|1[0-2])\/\d{4}$/.test(value);
}

function isDateValid(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateISO(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(iso: string) {
  const parts = iso.split('-');
  if (parts.length !== 3) return new Date(iso);
  const [year, month, day] = parts.map((value) => Number(value));
  return new Date(year, month - 1, day);
}

function formatDateDisplay(iso: string) {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function formatValor(valor: number | string) {
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return `R$ ${valor.toFixed(2)}`;
  }
  const normalized = typeof valor === 'string' ? valor.replace(',', '.') : '';
  const asNumber = Number(normalized);
  if (Number.isFinite(asNumber)) {
    return `R$ ${asNumber.toFixed(2)}`;
  }
  return `R$ ${valor ?? '0,00'}`;
}

function formatCurrencyInput(value: string) {
  const digits = onlyDigits(value);
  if (digits.length === 0) return '';
  const padded = digits.padStart(3, '0');
  const rawInteger = padded.slice(0, -2);
  const integerPart = rawInteger.replace(/^0+(?=\d)/, '');
  const decimalPart = padded.slice(-2);
  return `${integerPart}.${decimalPart}`;
}

function statusBadgeStyle(status: string) {
  switch (status) {
    case 'PAGO':
      return { badge: { backgroundColor: 'rgba(34,197,94,0.15)' }, text: { color: '#22c55e' } };
    case 'VENCIDO':
      return { badge: { backgroundColor: 'rgba(239,68,68,0.15)' }, text: { color: '#ef4444' } };
    case 'CANCELADO':
      return { badge: { backgroundColor: 'rgba(148,163,184,0.2)' }, text: { color: '#94a3b8' } };
    default:
      return { badge: { backgroundColor: 'rgba(245,158,11,0.15)' }, text: { color: '#f59e0b' } };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050a1e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll: { paddingBottom: 40, backgroundColor: '#060c22' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, position: 'relative', overflow: 'hidden' },
  glowAccent: { position: 'absolute', top: -70, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(167,139,250,0.18)' },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 14 },
  searchBlock: { gap: 6 },
  searchLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 12, paddingHorizontal: 24, marginTop: 20 },
  emptyState: { marginHorizontal: 24, padding: 18, borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  emptyTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { color: '#94a3b8', fontSize: 12 },
  card: { marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardName: { color: '#f8fafc', fontSize: 15, fontWeight: '700' },
  cardCompetencia: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardLabel: { color: '#94a3b8', fontSize: 12 },
  cardValue: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cardActionButton: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  cardActionDanger: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
  cardActionText: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(3,6,14,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 18, backgroundColor: '#0b1329', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', padding: 20 },
  modalTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  modalBody: { color: '#cbd5e1', fontSize: 13, marginBottom: 14 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 10, color: '#e2e8f0', fontSize: 14, marginBottom: 12 },
  modalInputButton: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  modalInputText: { color: '#e2e8f0', fontSize: 14 },
  modalPlaceholder: { color: '#64748b' },
  datePickerWrap: { marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' },
  datePickerConfirm: { alignSelf: 'flex-end', marginTop: 8, backgroundColor: 'rgba(37,99,235,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 0.5, borderColor: 'rgba(37,99,235,0.4)' },
  datePickerConfirmText: { color: '#bfdbfe', fontSize: 12, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 6 },
  modalButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  modalButtonDanger: { backgroundColor: 'rgba(239,68,68,0.9)' },
  modalButtonGhost: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
  modalButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statusOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)' },
  statusOptionActive: { backgroundColor: 'rgba(14,165,233,0.2)', borderColor: 'rgba(14,165,233,0.35)' },
  statusOptionText: { color: '#cbd5e1', fontSize: 11, fontWeight: '600' },
  statusOptionTextActive: { color: '#e0f2fe' },
});
