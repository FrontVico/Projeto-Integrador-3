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
  Animated,
  Platform,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { motoristasService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");

interface Motorista {
  nome: string;
  cpf: string;
  cnh: string;
  categoriaCnh: string;
  dataValidadeCnh: string;
  telefone: string;
}

export default function MotoristaMotoristaDashboard() {
  const { user } = useAuth();
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal e feedbacks internos
  const [modalVisible, setModalVisible] = useState(false);
  const [updatePhone, setUpdatePhone] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    if (user?.cpf) {
      carregarDados();
    }
  }, [user?.cpf]);

  useEffect(() => {
    if (!loading && motorista) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, motorista]);

  async function carregarDados() {
    try {
      setLoading(true);
      if (!user?.cpf) throw new Error("CPF não disponível");
      const data = await motoristasService.buscarPorCpf(user.cpf);
      setMotorista(data);
      setUpdatePhone(data.telefone);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados do motorista");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ── FUNÇÃO DE ATUALIZAR COM FEEDBACK INTERNO (SEM ALERT) ──
  async function handleAtualizarTelefone() {
    if (!updatePhone.trim() || !user?.cpf) {
      setErrorMessage("Insira o novo telefone");
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage(null);
      setStatusMessage(null);
      
      // Chamada usando o CPF direto conforme funcionou perfeitamente antes
      await motoristasService.atualizarTelefone(user.cpf, updatePhone);

      // Define a mensagem de sucesso interna
      setStatusMessage("Telefone atualizado com sucesso!");

      // Fecha o modal suavemente após 1.5 segundos para dar tempo de ler o aviso
      setTimeout(() => {
        setModalVisible(false);
        setStatusMessage(null);
        carregarDados();
      }, 1500);

    } catch (error) {
      const msgErro = error instanceof Error ? error.message : "Falha ao atualizar telefone";
      setErrorMessage(msgErro);
    } finally {
      setActionLoading(false);
    }
  }

  // Abre o modal limpando os textos de aviso antigos
  function abrirModal() {
    setErrorMessage(null);
    setStatusMessage(null);
    if (motorista) {
      setUpdatePhone(motorista.telefone);
    }
    setModalVisible(true);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" size="large" />
      </View>
    );
  }

  if (!motorista) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Dados não disponíveis</Text>
      </View>
    );
  }

  return (
    <>
      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim, backgroundColor: "#060c22" }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <LinearGradient colors={["#100d28", "#070e28"]} style={styles.hero}>
          <View style={styles.glowCircle} />

          <Animated.View
            style={[styles.heroTop, { transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.heroText}>
              <View style={styles.roleTag}>
                <Ionicons name="car-outline" size={12} color="#c4b5fd" />
                <Text style={styles.roleText}>Motorista</Text>
              </View>
              <Text style={styles.heroName}>{motorista.nome}</Text>
              <Text style={styles.heroSub}>Meus dados e informações</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {motorista.nome[0]?.toUpperCase()}
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── DADOS PRINCIPAIS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Informações Pessoais</Text>

          <LinearGradient
            colors={["rgba(30,41,59,0.5)", "rgba(15,23,42,0.5)"]}
            style={styles.card}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nome Completo</Text>
                <Text style={styles.infoValue}>{motorista.nome}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CPF</Text>
                <Text style={styles.infoValue}>{motorista.cpf}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{motorista.telefone}</Text>
              </View>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={abrirModal}
              >
                <Ionicons name="create-outline" size={20} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ── DADOS DA CNH ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Informações da CNH</Text>

          <LinearGradient
            colors={["rgba(30,41,59,0.5)", "rgba(15,23,42,0.5)"]}
            style={styles.card}
          >
            <View style={styles.infoRow}>
              <View style={[styles.infoItem, { flex: 1 }]}>
                <Text style={styles.infoLabel}>Número da CNH</Text>
                <Text style={styles.infoValue}>{motorista.cnh}</Text>
              </View>
              <View style={[styles.infoItem, { flex: 1 }]}>
                <Text style={styles.infoLabel}>Categoria</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    Categoria {motorista.categoriaCnh}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Validade da CNH</Text>
                <Text style={styles.infoValue}>{motorista.dataValidadeCnh}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
              <Text style={styles.statusText}>CNH ativa e válida</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── AÇÕES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ações Disponíveis</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#0ea5e930" }]}
            onPress={abrirModal}
          >
            <View style={styles.actionContent}>
              <Ionicons name="call-outline" size={20} color="#0ea5e9" />
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>Atualizar Telefone</Text>
                <Text style={styles.actionDesc}>Editar seu número de contato</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* ── MODAL COM REGRAS DE FEEDBACK INTERNO ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atualizar Telefone</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={actionLoading}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              
              {/* Caixas de Alerta Embutidas na Interface */}
              {errorMessage && (
                <View style={styles.inlineErrorBox}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.inlineErrorText}>{errorMessage}</Text>
                </View>
              )}

              {statusMessage && (
                <View style={styles.inlineSuccessBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text style={styles.inlineSuccessText}>{statusMessage}</Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Novo Telefone (DD) XXXXX-XXXX"
                placeholderTextColor="#64748b"
                value={updatePhone}
                onChangeText={setUpdatePhone}
                editable={!actionLoading && !statusMessage}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (actionLoading || statusMessage) && { opacity: 0.6 }]}
                onPress={handleAtualizarTelefone}
                disabled={actionLoading || !!statusMessage}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {statusMessage ? "Salvo!" : "Atualizar"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#060c22",
    gap: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  hero: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  glowCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(168,85,247,0.1)",
    top: -100,
    right: -50,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroText: {
    flex: 1,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(196,181,253,0.15)",
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  roleText: {
    fontSize: 11,
    color: "#c4b5fd",
    fontWeight: "500",
  },
  heroName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: "#94a3b8",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.1)",
    marginVertical: 12,
  },
  editIcon: {
    padding: 8,
    marginRight: -8,
  },
  categoryBadge: {
    backgroundColor: "#2563eb30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    fontSize: 13,
    color: "#22c55e",
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: "#94a3b8",
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
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  modalForm: {
    gap: 12,
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
    backgroundColor: "#0ea5e9",
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

  // ── NOVOS ESTILOS DE FEEDBACK INTERNO ──
  inlineErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  inlineErrorText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "500",
  },
  inlineSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34,197,94,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  inlineSuccessText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "500",
  },
});