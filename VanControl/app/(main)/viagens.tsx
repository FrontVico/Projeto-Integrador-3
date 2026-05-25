import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../hooks/useAuth';
import { viagensService } from '../../services/api';

interface Viagem {
  codigoViagem: string;
  codigoRota: string;
  placaVeiculo: string;
  cpfMotorista: string;
  dataViagem: string;
  horarioSaidaPrevisto: string;
  horarioChegadaPrevisto: string;
  viagemConcuida: boolean;
}

interface ViagemDetalhes extends Viagem {
  capacidade?: number;
  ocupacao?: number;
  passageiros?: { nome: string; cpf: string; email: string }[];
}

type ConfirmacaoDetalhes = null | 'concluir' | 'deletar' | 'participar' | 'sair';
type ConfirmacaoPassageiro = { cpf: string; nome: string } | null;

// ─── Funções de Formatação ───────────────────────────────────────────────────

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

function formatDateISO(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(iso: string) {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function ViagensScreen() {
  const { user } = useAuth();
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchCodigoViagem, setSearchCodigoViagem] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalPassageiros, setModalPassageiros] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState<ViagemDetalhes | null>(null);
  const [passageiros, setPassageiros] = useState<any[]>([]);
  const [capacidadeVeiculo, setCapacidadeVeiculo] = useState(0);
  const [ocupacaoVeiculo, setOcupacaoVeiculo] = useState(0);
  const [loadingPassageiros, setLoadingPassageiros] = useState(false);

  // Date picker states
  const [showDataViagemPicker, setShowDataViagemPicker] = useState(false);
  const [dataViagemDate, setDataViagemDate] = useState<Date | null>(null);
  const [showHorarioSaidaPicker, setShowHorarioSaidaPicker] = useState(false);
  const [horarioSaidaDate, setHorarioSaidaDate] = useState<Date | null>(null);
  const [showHorarioChegadaPicker, setShowHorarioChegadaPicker] = useState(false);
  const [horarioChegadaDate, setHorarioChegadaDate] = useState<Date | null>(null);

  // Estados de confirmação inline (substituem Alert.alert dentro de modais)
  const [confirmacaoDetalhes, setConfirmacaoDetalhes] = useState<ConfirmacaoDetalhes>(null);
  const [confirmacaoPassageiro, setConfirmacaoPassageiro] = useState<ConfirmacaoPassageiro>(null);

  // Loading states para cada ação
  const [loadingAcao, setLoadingAcao] = useState(false);

  // Form para criar viagem (apenas MOTORISTA/ADMIN)
  const [form, setForm] = useState({
    codigoRota: '',
    placaVeiculo: '',
    cpfMotorista: user?.sub || '',
    dataViagem: '',
    horarioSaidaPrevisto: '',
    horarioChegadaPrevisto: '',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sub]);

  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Se o campo está vazio, recarregar todas as viagens
    if (!searchCodigoViagem.trim()) {
      fetchData();
      return;
    }

    // Debounce de 500ms para não fazer muitas requisições
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await viagensService.buscarPorCodigo(searchCodigoViagem);
        setViagens(data || []);
      } catch (e: any) {
        Alert.alert('Erro', 'Falha ao buscar viagem: ' + e.message);
        setViagens([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCodigoViagem]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'PASSAGEIRO') {
        const data = await viagensService.listarPassageirosPorCpf(user.sub);
        setViagens(data || []);
      } else {
        const data = await viagensService.listar();
        setViagens(data || []);
      }
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao carregar viagens: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ─── Handlers de Data ────────────────────────────────────────────────────────

  const handleDataViagemChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDataViagemPicker(false);
    if (!selectedDate) return;
    setDataViagemDate(selectedDate);
    setForm((prev) => ({ ...prev, dataViagem: formatDateISO(selectedDate) }));
  };

  const handleHorarioSaidaChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowHorarioSaidaPicker(false);
    if (!selectedDate) return;
    setHorarioSaidaDate(selectedDate);
    const hours = `${selectedDate.getHours()}`.padStart(2, '0');
    const minutes = `${selectedDate.getMinutes()}`.padStart(2, '0');
    setForm((prev) => ({ ...prev, horarioSaidaPrevisto: `${hours}:${minutes}` }));
  };

  const handleHorarioChegadaChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowHorarioChegadaPicker(false);
    if (!selectedDate) return;
    setHorarioChegadaDate(selectedDate);
    const hours = `${selectedDate.getHours()}`.padStart(2, '0');
    const minutes = `${selectedDate.getMinutes()}`.padStart(2, '0');
    setForm((prev) => ({ ...prev, horarioChegadaPrevisto: `${hours}:${minutes}` }));
  };

  const handleVisualizarDetalhes = (viagem: Viagem) => {
    setViagemSelecionada(viagem);
    setConfirmacaoDetalhes(null); // reseta confirmação ao abrir
    setModalDetalhes(true);
  };

  const handleFecharDetalhes = () => {
    setConfirmacaoDetalhes(null);
    setModalDetalhes(false);
  };

  const handleListarPassageiros = async (codigoViagem: string) => {
    setLoadingPassageiros(true);
    try {
      const data = await viagensService.listarPassageiros(codigoViagem);
      setPassageiros(data?.passageiros || []);
      setCapacidadeVeiculo(data?.capacidade || 0);
      setOcupacaoVeiculo(data?.ocupacao || 0);
      setConfirmacaoPassageiro(null); // reseta confirmação ao abrir
      setModalPassageiros(true);
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao carregar passageiros: ' + e.message);
    } finally {
      setLoadingPassageiros(false);
    }
  };

  // ─── Participar da viagem ────────────────────────────────────────────────────

  const handleConfirmarParticipar = async () => {
    if (!viagemSelecionada) return;
    setLoadingAcao(true);
    try {
      await viagensService.associarPassageiro(viagemSelecionada.codigoViagem, user!.sub);
      setConfirmacaoDetalhes(null);
      setModalDetalhes(false);
      Alert.alert('Sucesso', 'Você foi adicionado à viagem!');
      fetchData();
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao participar da viagem: ' + e.message);
      setConfirmacaoDetalhes(null);
    } finally {
      setLoadingAcao(false);
    }
  };

  // ─── Sair da viagem ──────────────────────────────────────────────────────────

  const handleConfirmarSair = async () => {
    if (!viagemSelecionada) return;
    setLoadingAcao(true);
    try {
      await viagensService.removerPassageiro(viagemSelecionada.codigoViagem, user!.sub);
      setConfirmacaoDetalhes(null);
      setModalDetalhes(false);
      Alert.alert('Sucesso', 'Você saiu da viagem!');
      fetchData();
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao sair da viagem: ' + e.message);
      setConfirmacaoDetalhes(null);
    } finally {
      setLoadingAcao(false);
    }
  };

  // ─── Remover passageiro ──────────────────────────────────────────────────────

  const handleConfirmarRemoverPassageiro = async () => {
    if (!confirmacaoPassageiro || !viagemSelecionada) return;
    setLoadingAcao(true);
    try {
      await viagensService.removerPassageiro(
        viagemSelecionada.codigoViagem,
        confirmacaoPassageiro.cpf
      );
      setConfirmacaoPassageiro(null);
      Alert.alert('Sucesso', 'Passageiro removido!');
      handleListarPassageiros(viagemSelecionada.codigoViagem);
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao remover passageiro: ' + e.message);
      setConfirmacaoPassageiro(null);
    } finally {
      setLoadingAcao(false);
    }
  };

  // ─── Criar viagem ────────────────────────────────────────────────────────────

  const handleCriarViagem = async () => {
    if (
      !form.codigoRota ||
      !form.placaVeiculo ||
      !form.cpfMotorista ||
      !form.dataViagem ||
      !form.horarioSaidaPrevisto ||
      !form.horarioChegadaPrevisto
    ) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    // Validar CPF (enviar sem formatação)
    const cpfDigits = onlyDigits(form.cpfMotorista);
    if (cpfDigits.length !== 11) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    try {
      // Enviar CPF sem formatação
      const formToSend = {
        ...form,
        cpfMotorista: cpfDigits,
      };
      await viagensService.criar(formToSend);
      Alert.alert('Sucesso', 'Viagem criada com sucesso!');
      setForm({
        codigoRota: '',
        placaVeiculo: '',
        cpfMotorista: user?.sub || '',
        dataViagem: '',
        horarioSaidaPrevisto: '',
        horarioChegadaPrevisto: '',
      });
      setDataViagemDate(null);
      setHorarioSaidaDate(null);
      setHorarioChegadaDate(null);
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao criar viagem: ' + e.message);
    }
  };

  // ─── Atualizar status ────────────────────────────────────────────────────────

  const handleConfirmarAtualizarStatus = async () => {
    if (!viagemSelecionada) return;
    setLoadingAcao(true);
    try {
      await viagensService.atualizarStatus(viagemSelecionada.codigoViagem);
      setConfirmacaoDetalhes(null);
      setModalDetalhes(false);
      Alert.alert('Sucesso', 'Status da viagem atualizado!');
      fetchData();
    } catch (e: any) {
      Alert.alert('Erro', 'Falha ao atualizar status: ' + e.message);
      setConfirmacaoDetalhes(null);
    } finally {
      setLoadingAcao(false);
    }
  };

  // ─── Deletar viagem ──────────────────────────────────────────────────────────

  const handleConfirmarDeletar = async () => {
    if (!viagemSelecionada) return;
    setLoadingAcao(true);
    try {
      await viagensService.deletar(viagemSelecionada.codigoViagem);
      setConfirmacaoDetalhes(null);
      setModalDetalhes(false);
      Alert.alert('Sucesso', 'Viagem deletada!');
      fetchData();
    } catch (e: any) {
      console.error('Erro ao deletar viagem:', e);
      Alert.alert('Erro', 'Falha ao deletar viagem: ' + e.message);
      setConfirmacaoDetalhes(null);
    } finally {
      setLoadingAcao(false);
    }
  };

  // ─── Render helpers ──────────────────────────────────────────────────────────

  /**
   * Bloco de confirmação inline reutilizável.
   * Renderiza a mensagem, botão de confirmar e botão de cancelar.
   */
  const renderConfirmacaoInline = ({
    mensagem,
    textoBotao,
    estiloBotao,
    onConfirmar,
    onCancelar,
  }: {
    mensagem: string;
    textoBotao: string;
    estiloBotao: object;
    onConfirmar: () => void;
    onCancelar: () => void;
  }) => (
    <View style={styles.confirmacaoContainer}>
      <Text style={styles.confirmacaoTexto}>{mensagem}</Text>
      <View style={styles.confirmacaoBotoes}>
        <TouchableOpacity
          style={[styles.btnAction, styles.btnSecondary, styles.btnFlex]}
          onPress={onCancelar}
          disabled={loadingAcao}
        >
          <Text style={styles.btnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAction, estiloBotao, styles.btnFlex]}
          onPress={onConfirmar}
          disabled={loadingAcao}
        >
          {loadingAcao ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>{textoBotao}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCard = ({ item }: { item: Viagem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVisualizarDetalhes(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.codigoViagem}>{item.codigoViagem}</Text>
        <View style={[styles.statusBadge, item.viagemConcuida && styles.statusConcluida]}>
          <Text style={styles.statusText}>
            {item.viagemConcuida ? 'Concluída' : 'Ativa'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>
        📍 Rota: <Text style={styles.highlight}>{item.codigoRota}</Text>
      </Text>
      <Text style={styles.cardText}>
        🚐 Placa: <Text style={styles.highlight}>{item.placaVeiculo}</Text>
      </Text>
      <Text style={styles.cardText}>
        👤 Motorista: <Text style={styles.highlight}>{item.cpfMotorista}</Text>
      </Text>

      <View style={styles.timeRow}>
        <Text style={styles.cardText}>
          📅 <Text style={styles.highlight}>{formatDateDisplay(item.dataViagem)}</Text>
        </Text>
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.cardText}>
          🕐 Saída: <Text style={styles.highlight}>{item.horarioSaidaPrevisto}</Text>
        </Text>
        <Text style={styles.cardText}>
          Chegada: <Text style={styles.highlight}>{item.horarioChegadaPrevisto}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Modal Detalhes ──────────────────────────────────────────────────────────

  const renderModalDetalhes = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalDetalhes}
      onRequestClose={handleFecharDetalhes}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={handleFecharDetalhes}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Detalhes da Viagem</Text>

            {viagemSelecionada && (
              <>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Informações</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Código:</Text>
                    <Text style={styles.infoValue}>{viagemSelecionada.codigoViagem}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status:</Text>
                    <Text style={[styles.infoValue, viagemSelecionada.viagemConcuida && styles.textRed]}>
                      {viagemSelecionada.viagemConcuida ? 'Concluída' : 'Ativa'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Rota:</Text>
                    <Text style={styles.infoValue}>{viagemSelecionada.codigoRota}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Placa do Veículo:</Text>
                    <Text style={styles.infoValue}>{viagemSelecionada.placaVeiculo}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>CPF Motorista:</Text>
                    <Text style={styles.infoValue}>{viagemSelecionada.cpfMotorista}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Data:</Text>
                    <Text style={styles.infoValue}>{formatDateDisplay(viagemSelecionada.dataViagem)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Saída Prevista:</Text>
                    <Text style={styles.infoValue}>{viagemSelecionada.horarioSaidaPrevisto}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Chegada Prevista:</Text>
                    <Text style={styles.infoValue}>{viagemSelecionada.horarioChegadaPrevisto}</Text>
                  </View>
                </View>

                {/* ── Botões PASSAGEIRO ── */}
                {user?.role === 'PASSAGEIRO' && (
                  <View style={styles.buttonContainer}>
                    {confirmacaoDetalhes === 'participar' ? (
                      renderConfirmacaoInline({
                        mensagem: 'Deseja confirmar sua participação nesta viagem?',
                        textoBotao: '✓ Confirmar',
                        estiloBotao: styles.btnPrimary,
                        onConfirmar: handleConfirmarParticipar,
                        onCancelar: () => setConfirmacaoDetalhes(null),
                      })
                    ) : confirmacaoDetalhes === 'sair' ? (
                      renderConfirmacaoInline({
                        mensagem: 'Tem certeza que deseja sair desta viagem?',
                        textoBotao: '✕ Confirmar saída',
                        estiloBotao: styles.btnDanger,
                        onConfirmar: handleConfirmarSair,
                        onCancelar: () => setConfirmacaoDetalhes(null),
                      })
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.btnAction,
                            styles.btnPrimary,
                            viagemSelecionada.viagemConcuida && styles.btnDisabled,
                          ]}
                          onPress={() => setConfirmacaoDetalhes('participar')}
                          disabled={viagemSelecionada.viagemConcuida}
                          activeOpacity={viagemSelecionada.viagemConcuida ? 1 : 0.7}
                        >
                          <Text
                            style={[
                              styles.btnText,
                              viagemSelecionada.viagemConcuida && styles.btnDisabledText,
                            ]}
                          >
                            {viagemSelecionada.viagemConcuida ? '✓ Participação encerrada' : '✓ Participar'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnDanger]}
                          onPress={() => setConfirmacaoDetalhes('sair')}
                        >
                          <Text style={styles.btnText}>✕ Sair</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}

                {/* ── Botões MOTORISTA / ADMIN ── */}
                {(user?.role === 'MOTORISTA' || user?.role === 'ADMIN') && (
                  <View style={styles.buttonContainer}>
                    {confirmacaoDetalhes === 'concluir' ? (
                      renderConfirmacaoInline({
                        mensagem: 'Deseja marcar esta viagem como concluída? Esta ação não pode ser desfeita.',
                        textoBotao: '✓ Confirmar conclusão',
                        estiloBotao: styles.btnWarning,
                        onConfirmar: handleConfirmarAtualizarStatus,
                        onCancelar: () => setConfirmacaoDetalhes(null),
                      })
                    ) : confirmacaoDetalhes === 'deletar' ? (
                      renderConfirmacaoInline({
                        mensagem: 'Tem certeza que deseja deletar esta viagem? Essa ação é irreversível.',
                        textoBotao: '🗑 Confirmar exclusão',
                        estiloBotao: styles.btnDanger,
                        onConfirmar: handleConfirmarDeletar,
                        onCancelar: () => setConfirmacaoDetalhes(null),
                      })
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnPrimary]}
                          onPress={() => handleListarPassageiros(viagemSelecionada.codigoViagem)}
                        >
                          <Text style={styles.btnText}>👥 Ver Passageiros</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.btnAction,
                            styles.btnWarning,
                            viagemSelecionada.viagemConcuida && styles.btnDisabled,
                          ]}
                          onPress={() => setConfirmacaoDetalhes('concluir')}
                          disabled={viagemSelecionada.viagemConcuida}
                          activeOpacity={viagemSelecionada.viagemConcuida ? 1 : 0.7}
                        >
                          <Text
                            style={[
                              styles.btnText,
                              viagemSelecionada.viagemConcuida && styles.btnDisabledText,
                            ]}
                          >
                            {viagemSelecionada.viagemConcuida ? '✓ Concluída' : '✓ Concluir'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnDanger]}
                          onPress={() => setConfirmacaoDetalhes('deletar')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.btnText}>🗑 Deletar</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Modal Passageiros ───────────────────────────────────────────────────────

  const renderModalPassageiros = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalPassageiros}
      onRequestClose={() => {
        setConfirmacaoPassageiro(null);
        setModalPassageiros(false);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              setConfirmacaoPassageiro(null);
              setModalPassageiros(false);
            }}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Passageiros</Text>

          {viagemSelecionada && (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>
                  Viagem: {viagemSelecionada.codigoViagem}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Capacidade:</Text>
                  <Text style={styles.infoValue}>
                    {ocupacaoVeiculo}/{capacidadeVeiculo}
                  </Text>
                </View>
              </View>

              {/* Confirmação inline de remoção de passageiro */}
              {confirmacaoPassageiro && (
                <View style={styles.confirmacaoPassageiroContainer}>
                  {renderConfirmacaoInline({
                    mensagem: `Remover "${confirmacaoPassageiro.nome}" desta viagem?`,
                    textoBotao: 'Remover',
                    estiloBotao: styles.btnDanger,
                    onConfirmar: handleConfirmarRemoverPassageiro,
                    onCancelar: () => setConfirmacaoPassageiro(null),
                  })}
                </View>
              )}

              {loadingPassageiros ? (
                <ActivityIndicator size="large" color="#2563eb" />
              ) : passageiros.length > 0 ? (
                <FlatList
                  scrollEnabled={false}
                  data={passageiros}
                  keyExtractor={(item) => item.cpf}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.passageiroItem,
                        confirmacaoPassageiro?.cpf === item.cpf &&
                          styles.passageiroItemDestacado,
                      ]}
                    >
                      <View style={styles.passageiroInfo}>
                        <Text style={styles.passageiroNome}>{item.nome}</Text>
                        <Text style={styles.passageiroEmail}>{item.email}</Text>
                        <Text style={styles.passageiroCpf}>{item.cpf}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.btnRemover,
                          confirmacaoPassageiro?.cpf === item.cpf &&
                            styles.btnRemoverAtivo,
                        ]}
                        onPress={() =>
                          setConfirmacaoPassageiro({ cpf: item.cpf, nome: item.nome })
                        }
                        disabled={loadingAcao}
                      >
                        <Text style={styles.btnRemoverText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.emptyText}>Nenhum passageiro adicionado</Text>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // ─── Modal Criar Viagem ──────────────────────────────────────────────────────

  const renderModalCriar = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Criar Nova Viagem</Text>

          <ScrollView>
            <Text style={styles.inputLabel}>Código da Rota</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: R-001"
              placeholderTextColor="#64748b"
              value={form.codigoRota}
              onChangeText={(text) => setForm({ ...form, codigoRota: text })}
            />

            <Text style={styles.inputLabel}>Placa do Veículo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: ABC-1234"
              placeholderTextColor="#64748b"
              value={form.placaVeiculo}
              onChangeText={(text) => setForm({ ...form, placaVeiculo: text })}
            />

            <Text style={styles.inputLabel}>CPF do Motorista</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 123.456.789-00"
              placeholderTextColor="#64748b"
              value={formatCpf(form.cpfMotorista)}
              onChangeText={(text) => setForm({ ...form, cpfMotorista: text })}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Data da Viagem</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDataViagemPicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.inputText,
                  !form.dataViagem && styles.inputPlaceholder,
                ]}
              >
                {form.dataViagem ? formatDateDisplay(form.dataViagem) : 'Selecionar data'}
              </Text>
            </TouchableOpacity>
            {showDataViagemPicker ? (
              <View style={styles.datePickerWrap}>
                <DateTimePicker
                  value={dataViagemDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDataViagemChange}
                />
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.datePickerConfirm}
                    onPress={() => setShowDataViagemPicker(false)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirmar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Horário de Saída</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowHorarioSaidaPicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.inputText,
                  !form.horarioSaidaPrevisto && styles.inputPlaceholder,
                ]}
              >
                {form.horarioSaidaPrevisto ? form.horarioSaidaPrevisto : 'Selecionar hora'}
              </Text>
            </TouchableOpacity>
            {showHorarioSaidaPicker ? (
              <View style={styles.datePickerWrap}>
                <DateTimePicker
                  value={horarioSaidaDate ?? new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleHorarioSaidaChange}
                />
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.datePickerConfirm}
                    onPress={() => setShowHorarioSaidaPicker(false)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirmar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Horário de Chegada</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowHorarioChegadaPicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.inputText,
                  !form.horarioChegadaPrevisto && styles.inputPlaceholder,
                ]}
              >
                {form.horarioChegadaPrevisto ? form.horarioChegadaPrevisto : 'Selecionar hora'}
              </Text>
            </TouchableOpacity>
            {showHorarioChegadaPicker ? (
              <View style={styles.datePickerWrap}>
                <DateTimePicker
                  value={horarioChegadaDate ?? new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleHorarioChegadaChange}
                />
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.datePickerConfirm}
                    onPress={() => setShowHorarioChegadaPicker(false)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirmar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity style={styles.btnCriar} onPress={handleCriarViagem}>
              <Text style={styles.btnText}>✓ Criar Viagem</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Root ────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Viagens</Text>
        {(user?.role === 'MOTORISTA' || user?.role === 'ADMIN') && (
          <TouchableOpacity
            style={styles.btnNovaViagem}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.btnNovaViagemText}>+ Nova</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Buscar por código..."
            placeholderTextColor="#64748b"
            value={searchCodigoViagem}
            onChangeText={setSearchCodigoViagem}
          />
          {searchLoading && (
            <ActivityIndicator
              size="small"
              color="#2563eb"
              style={styles.searchLoadingIndicator}
            />
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={viagens}
          keyExtractor={(item) => item.codigoViagem}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchCodigoViagem ? 'Nenhuma viagem encontrada com esse código.' : 'Nenhuma viagem encontrada.'}
            </Text>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {renderModalDetalhes()}
      {renderModalPassageiros()}
      {renderModalCriar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a1e',
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    paddingRight: 40,
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  btnNovaViagem: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnNovaViagemText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codigoViagem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConcluida: {
    backgroundColor: '#8b5cf6',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
  highlight: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  textRed: {
    color: '#ef4444',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  btnAction: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnFlex: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
  },
  btnSecondary: {
    backgroundColor: '#334155',
  },
  btnWarning: {
    backgroundColor: '#f59e0b',
  },
  btnDanger: {
    backgroundColor: '#ef4444',
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: '#94a3b8',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnDisabledText: {
    color: '#cbd5e1',
  },
  // Confirmação inline
  confirmacaoContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  confirmacaoTexto: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 14,
    lineHeight: 20,
  },
  confirmacaoBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmacaoPassageiroContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  btnCriar: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passageiroItem: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passageiroItemDestacado: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  passageiroInfo: {
    flex: 1,
  },
  passageiroNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  passageiroEmail: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  passageiroCpf: {
    fontSize: 12,
    color: '#64748b',
  },
  btnRemover: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnRemoverAtivo: {
    backgroundColor: '#b91c1c',
  },
  btnRemoverText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputText: {
    color: '#e2e8f0',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputPlaceholder: {
    color: '#64748b',
  },
  datePickerWrap: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  datePickerConfirm: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  datePickerConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});