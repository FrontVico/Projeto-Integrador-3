import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
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

export default function MotoristasPassageiroDashboard() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    carregarMotoristas();
  }, []);

  useEffect(() => {
    if (!loading) {
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
  }, [loading]);

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

  function filtrarMotoristas() {
    if (!searchQuery.trim()) return motoristas;
    return motoristas.filter(
      (m) =>
        m.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cpf.includes(searchQuery)
    );
  }

  const motoristasFiltrados = filtrarMotoristas();

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <LinearGradient colors={["#100d28", "#070e28"]} style={styles.header}>
        <View style={styles.glowCircle} />

        <Animated.View
          style={[styles.headerContent, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.headerText}>
            <View style={styles.roleTag}>
              <Ionicons name="people-outline" size={12} color="#c4b5fd" />
              <Text style={styles.roleText}>Passageiro</Text>
            </View>
            <Text style={styles.headerTitle}>Motoristas Disponíveis</Text>
            <Text style={styles.headerSub}>
              Visualize informações dos motoristas
            </Text>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou CPF"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* ── CONTEÚDO ── */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#a78bfa" size="large" />
        </View>
      ) : motoristasFiltrados.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="people-outline" size={48} color="#64748b" />
          <Text style={styles.emptyText}>
            {motoristas.length === 0
              ? "Nenhum motorista disponível"
              : "Nenhum resultado para sua busca"}
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={{ flex: 1, opacity: fadeAnim }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {motoristasFiltrados.map((motorista, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedMotorista(motorista);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["rgba(30,41,59,0.5)", "rgba(15,23,42,0.5)"]}
                style={styles.motoristaCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {motorista.nome[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.motoristaNome}>{motorista.nome}</Text>
                    <Text style={styles.motoristaDetails}>
                      CNH: {motorista.cnh}
                    </Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      Cat. {motorista.categoriaCnh}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>
                      {motorista.dataValidadeCnh}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color="#64748b"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      )}

      {/* ── MODAL COM DETALHES ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMotorista && (
              <>
                {/* ── Modal Header ── */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatarBox}>
                    <Text style={styles.modalAvatarText}>
                      {selectedMotorista.nome[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.modalHeaderText}>
                    <Text style={styles.modalName}>
                      {selectedMotorista.nome}
                    </Text>
                    <Text style={styles.modalRole}>Motorista Profissional</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle-outline" size={28} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* ── Modal Body ── */}
                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={styles.modalBodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Informações CNH */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      Informações da CNH
                    </Text>

                    <LinearGradient
                      colors={["rgba(30,41,59,0.5)", "rgba(15,23,42,0.5)"]}
                      style={styles.modalCard}
                    >
                      <View style={styles.modalCardRow}>
                        <View style={styles.modalCardItem}>
                          <Text style={styles.modalCardLabel}>Número CNH</Text>
                          <Text style={styles.modalCardValue}>
                            {selectedMotorista.cnh}
                          </Text>
                        </View>
                        <View style={[styles.modalCardItem, { flex: 1 }]}>
                          <Text style={styles.modalCardLabel}>Categoria</Text>
                          <View style={styles.modalCategoryBadge}>
                            <Text style={styles.modalCategoryText}>
                              {selectedMotorista.categoriaCnh}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.modalCardDivider} />

                      <View style={styles.modalCardRow}>
                        <View style={styles.modalCardItem}>
                          <Text style={styles.modalCardLabel}>Validade</Text>
                          <Text style={styles.modalCardValue}>
                            {selectedMotorista.dataValidadeCnh}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.modalCardDivider} />

                      <View style={styles.statusRow}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color="#22c55e"
                        />
                        <Text style={styles.statusTextOk}>
                          Motorista verificado e seguro
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Contato */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Contato</Text>

                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => {
                        Alert.alert(
                          "Telefone",
                          `${selectedMotorista.telefone}\n\nSeu atendimento será direcionado para este número.`
                        );
                      }}
                    >
                      <View
                        style={[
                          styles.contactIcon,
                          { backgroundColor: "#0ea5e930" },
                        ]}
                      >
                        <Ionicons
                          name="call-outline"
                          size={20}
                          color="#0ea5e9"
                        />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Telefone</Text>
                        <Text style={styles.contactValue}>
                          {selectedMotorista.telefone}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Aviso de Segurança */}
                  <View style={styles.modalSection}>
                    <View style={styles.warningBox}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={20}
                        color="#22c55e"
                      />
                      <View style={styles.warningText}>
                        <Text style={styles.warningTitle}>
                          Segurança Garantida
                        </Text>
                        <Text style={styles.warningDesc}>
                          Todos os motoristas são verificados e possuem
                          documentação em dia.
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* ── Modal Actions ── */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.actionButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

import { TextInput } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060c22",
  },
  header: {
    padding: 16,
    paddingBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  glowCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(168,85,247,0.1)",
    top: -60,
    right: -40,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerText: {
    gap: 4,
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
  },
  roleText: {
    fontSize: 11,
    color: "#c4b5fd",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "#94a3b8",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(30,41,59,0.7)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 13,
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
    alignItems: "center",
    gap: 12,
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  cardInfo: {
    flex: 1,
  },
  motoristaNome: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  motoristaDetails: {
    fontSize: 12,
    color: "#94a3b8",
  },
  categoryBadge: {
    backgroundColor: "#2563eb30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.1)",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0f1728",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.1)",
  },
  modalAvatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  modalAvatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  modalHeaderText: {
    flex: 1,
  },
  modalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  modalRole: {
    fontSize: 12,
    color: "#94a3b8",
  },
  modalBody: {
    flex: 1,
    paddingTop: 16,
  },
  modalBodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  modalSection: {
    gap: 10,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  modalCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  modalCardRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalCardItem: {
    flex: 1,
  },
  modalCardLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 4,
  },
  modalCardValue: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  modalCardDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.1)",
    marginVertical: 10,
  },
  modalCategoryBadge: {
    backgroundColor: "#2563eb30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  modalCategoryText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusTextOk: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "500",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(30,41,59,0.5)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  warningBox: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(34,197,94,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
    marginBottom: 2,
  },
  warningDesc: {
    fontSize: 11,
    color: "#86efac",
  },
  modalActions: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.1)",
  },
  actionButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
