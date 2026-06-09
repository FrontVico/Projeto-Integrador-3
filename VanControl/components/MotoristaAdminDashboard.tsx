import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { motoristasService } from "../services/api";

const { width } = Dimensions.get("window");

interface Motorista {
  nome: string;
  cpf: string;
  cnh: string;
  categoriaCnh: string;
  dataValidadeCnh: string;
  telefone: string;
}

interface CadastroForm {
  nome: string;
  email: string;
  cpf: string;
  cnh: string;
  categoriaCnh: string;
  dataValidadeCnh: string;
  telefone: string;
  password: string;
}

export default function MotoristaAdminDashboard() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "cadastro" | "buscar" | "atualizar" | null
  >(null);
  const [searchCpf, setSearchCpf] = useState("");
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(
    null
  );
  const [form, setForm] = useState<CadastroForm>({
    nome: "",
    email: "",
    cpf: "",
    cnh: "",
    categoriaCnh: "",
    dataValidadeCnh: "",
    telefone: "",
    password: "",
  });
  const [updatePhone, setUpdatePhone] = useState("");
  
  // Estados para o Modal de Exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [modalPendingCpf, setModalPendingCpf] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar lista de motoristas
  useEffect(() => {
    carregarMotoristas();
  }, []);

  async function carregarMotoristas() {
    try {
      setLoading(true);
      const data = await motoristasService.listar();
      setMotoristas(data);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar motoristas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Cadastrar motorista
  async function handleCadastro() {
    if (
      !form.nome ||
      !form.email ||
      !form.cpf ||
      !form.cnh ||
      !form.categoriaCnh ||
      !form.dataValidadeCnh ||
      !form.telefone ||
      !form.password
    ) {
      Alert.alert("Erro", "Todos os campos são obrigatórios");
      return;
    }

    try {
      await motoristasService.cadastrar({
        nome: form.nome,
        email: form.email,
        cpf: form.cpf,
        cnh: form.cnh,
        categoriaCnh: form.categoriaCnh,
        dataValidadeCnh: form.dataValidadeCnh,
        telefone: form.telefone,
        password: form.password,
      });

      Alert.alert("Sucesso", "Motorista cadastrado com sucesso");
      resetForm();
      setModalVisible(false);
      carregarMotoristas();
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Falha ao cadastrar motorista"
      );
    }
  }

  // Buscar motorista por CPF
  async function handleBuscar() {
    if (!searchCpf.trim()) {
      Alert.alert("Erro", "Digite o CPF do motorista");
      return;
    }

    try {
      const motorista = await motoristasService.buscarPorCpf(searchCpf);
      setSelectedMotorista(motorista);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Motorista não encontrado"
      );
      setSelectedMotorista(null);
    }
  }

  // Atualizar telefone
  async function handleAtualizarTelefone() {
    if (!selectedMotorista || !updatePhone.trim()) {
      Alert.alert("Erro", "Selecione um motorista e insira o novo telefone");
      return;
    }

    try {
      await motoristasService.atualizarTelefone(
        selectedMotorista.cpf,
        updatePhone
      );
      Alert.alert("Sucesso", "Telefone atualizado com sucesso");
      setUpdatePhone("");
      setSelectedMotorista(null);
      setModalVisible(false);
      carregarMotoristas();
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Falha ao atualizar telefone"
      );
    }
  }

  // ── FUNÇÕES DE DELETAR ──
  const handleDelete = (cpf: string) => {
    if (Platform.OS === 'web') {
      setModalPendingCpf(cpf);
      setDeleteModalVisible(true);
      return;
    }

    Alert.alert('Confirmar exclusão', 'Deseja realmente deletar este motorista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: 'destructive',
        onPress: () => performDelete(cpf),
      },
    ]);
  };

  const performDelete = async (cpfFromMobile?: string) => {
    const cpfToDelete = cpfFromMobile || modalPendingCpf;
    if (!cpfToDelete) return;

    try {
      setActionLoading(true);
      await motoristasService.deletar(cpfToDelete);
      
      setDeleteModalVisible(false);
      setModalPendingCpf(null);
      carregarMotoristas();
    } catch (error) {
      console.error('Erro ao deletar motorista:', error);
      Alert.alert("Erro", "Falha ao deletar motorista");
    } finally {
      setActionLoading(false);
    }
  };

  function resetForm() {
    setForm({
      nome: "",
      email: "",
      cpf: "",
      cnh: "",
      categoriaCnh: "",
      dataValidadeCnh: "",
      telefone: "",
      password: "",
    });
  }

  function closeModal() {
    setModalVisible(false);
    setModalType(null);
    resetForm();
    setSearchCpf("");
    setSelectedMotorista(null);
    setUpdatePhone("");
  }

  return (
    <View style={styles.container}>
      {/* ── HEADER COM AÇÕES ── */}
      <LinearGradient colors={["#100d28", "#070e28"]} style={styles.header}>
        <Text style={styles.title}>Gerenciamento de Motoristas</Text>
        <Text style={styles.subtitle}>
          Total: {motoristas.length} motorista(s)
        </Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#22c55e" }]}
            onPress={() => {
              setModalType("cadastro");
              setModalVisible(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#2563eb" }]}
            onPress={() => {
              setModalType("buscar");
              setModalVisible(true);
            }}
          >
            <Ionicons name="search-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Buscar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#0ea5e9" }]}
            onPress={() => {
              setModalType("atualizar");
              setModalVisible(true);
            }}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Telefone</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── LISTA DE MOTORISTAS ── */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#a78bfa" size="large" />
        </View>
      ) : motoristas.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="people-outline" size={48} color="#64748b" />
          <Text style={styles.emptyText}>Nenhum motorista cadastrado</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {motoristas.map((motorista, index) => (
            <LinearGradient
              key={index}
              colors={["rgba(30,41,59,0.5)", "rgba(15,23,42,0.5)"]}
              style={styles.motoristaCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.motoristaNome}>{motorista.nome}</Text>
                  <Text style={styles.motoristaCpf}>CPF: {motorista.cpf}</Text>
                </View>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: "#2563eb30" },
                  ]}
                >
                  <Text style={styles.categoryText}>
                    Categoria {motorista.categoriaCnh}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>CNH</Text>
                  <Text style={styles.detailValue}>{motorista.cnh}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Telefone</Text>
                  <Text style={styles.detailValue}>{motorista.telefone}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Validade CNH</Text>
                  <Text style={styles.detailValue}>
                    {motorista.dataValidadeCnh}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionIcon, { backgroundColor: "#0ea5e930" }]}
                  onPress={() => {
                    setSelectedMotorista(motorista);
                    setUpdatePhone(motorista.telefone);
                    setModalType("atualizar");
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#0ea5e9" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionIcon, { backgroundColor: "#ef444430" }]}
                  onPress={() => handleDelete(motorista.cpf)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>
      )}

      {/* ── MODAL AÇÕES (Cadastro, Busca, Update) ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === "cadastro"
                  ? "Cadastrar Motorista"
                  : modalType === "buscar"
                    ? "Buscar Motorista"
                    : "Atualizar Telefone"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalForm}
              contentContainerStyle={{ gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {/* CADASTRO */}
              {modalType === "cadastro" && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome Completo"
                    placeholderTextColor="#64748b"
                    value={form.nome}
                    onChangeText={(text) => setForm({ ...form, nome: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="CPF (apenas números)"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={form.cpf}
                    onChangeText={(text) => setForm({ ...form, cpf: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="CNH (11 dígitos)"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={form.cnh}
                    onChangeText={(text) => setForm({ ...form, cnh: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Categoria CNH (A, B, C, D, E, AB, AC, AD, AE)"
                    placeholderTextColor="#64748b"
                    value={form.categoriaCnh}
                    onChangeText={(text) =>
                      setForm({ ...form, categoriaCnh: text })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Data Validade CNH (yyyy/MM)"
                    placeholderTextColor="#64748b"
                    value={form.dataValidadeCnh}
                    onChangeText={(text) =>
                      setForm({ ...form, dataValidadeCnh: text })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Telefone (DD) XXXXX-XXXX"
                    placeholderTextColor="#64748b"
                    value={form.telefone}
                    onChangeText={(text) =>
                      setForm({ ...form, telefone: text })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(text) =>
                      setForm({ ...form, password: text })
                    }
                  />

                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: "#22c55e" }]}
                    onPress={handleCadastro}
                  >
                    <Text style={styles.submitBtnText}>Cadastrar</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* BUSCAR */}
              {modalType === "buscar" && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="CPF do motorista"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={searchCpf}
                    onChangeText={setSearchCpf}
                  />
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: "#2563eb" }]}
                    onPress={handleBuscar}
                  >
                    <Text style={styles.submitBtnText}>Buscar</Text>
                  </TouchableOpacity>

                  {selectedMotorista && (
                    <View style={styles.resultBox}>
                      <Text style={styles.resultTitle}>Resultado da Busca</Text>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Nome:</Text>
                        <Text style={styles.resultValue}>
                          {selectedMotorista.nome}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>CPF:</Text>
                        <Text style={styles.resultValue}>
                          {selectedMotorista.cpf}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>CNH:</Text>
                        <Text style={styles.resultValue}>
                          {selectedMotorista.cnh}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Categoria:</Text>
                        <Text style={styles.resultValue}>
                          {selectedMotorista.categoriaCnh}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Telefone:</Text>
                        <Text style={styles.resultValue}>
                          {selectedMotorista.telefone}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Validade CNH:</Text>
                        <Text style={styles.resultValue}>
                          {selectedMotorista.dataValidadeCnh}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ATUALIZAR TELEFONE */}
              {modalType === "atualizar" && (
                <>
                  {!selectedMotorista && (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="CPF do motorista"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        value={searchCpf}
                        onChangeText={setSearchCpf}
                      />
                      <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: "#2563eb" }]}
                        onPress={handleBuscar}
                      >
                        <Text style={styles.submitBtnText}>Buscar</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedMotorista && (
                    <>
                      <View style={styles.selectedBox}>
                        <Text style={styles.selectedLabel}>
                          Motorista Selecionado:
                        </Text>
                        <Text style={styles.selectedValue}>
                          {selectedMotorista.nome}
                        </Text>
                      </View>

                      <TextInput
                        style={styles.input}
                        placeholder="Novo Telefone (DD) XXXXX-XXXX"
                        placeholderTextColor="#64748b"
                        value={updatePhone}
                        onChangeText={setUpdatePhone}
                      />

                      <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: "#0ea5e9" }]}
                        onPress={handleAtualizarTelefone}
                      >
                        <Text style={styles.submitBtnText}>Atualizar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: "#64748b" }]}
                        onPress={() => {
                          setSelectedMotorista(null);
                          setSearchCpf("");
                        }}
                      >
                        <Text style={styles.submitBtnText}>Buscar Outro</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL DE EXCLUSÃO (WEB) ── */}
      <Modal
        transparent={true}
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Confirmar exclusão</Text>
            <Text style={styles.deleteModalText}>
              Deseja realmente deletar o motorista CPF {modalPendingCpf}?
            </Text>

            <View style={styles.deleteModalButtonsRow}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonConfirm]}
                onPress={() => performDelete()}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteModalButtonConfirmText}>Confirmar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setModalPendingCpf(null);
                }}
                disabled={actionLoading}
              >
                <Text style={styles.deleteModalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060c22",
  },
  header: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  motoristaCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  motoristaNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  motoristaCpf: {
    fontSize: 12,
    color: "#94a3b8",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.1)",
  },
  actionIcon: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0f1728",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  modalForm: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(30,41,59,0.7)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  submitBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  resultBox: {
    backgroundColor: "rgba(30,41,59,0.5)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.3)",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  resultTitle: {
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 10,
  },
  resultItem: {
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  selectedBox: {
    backgroundColor: "rgba(34,197,94,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectedLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },

  // ── ESTILOS DO MODAL DE EXCLUSÃO (WEB) ──
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalCard: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  deleteModalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  deleteModalText: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 24,
  },
  deleteModalButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalButtonConfirm: {
    backgroundColor: "#ef4444",
  },
  deleteModalButtonConfirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteModalButtonCancel: {
    backgroundColor: "#1f2937",
  },
  deleteModalButtonCancelText: {
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: 14,
  },
});