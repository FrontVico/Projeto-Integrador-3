import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import MotoristasPassageiroDashboard from "../../components/MotoristasPassageiroDashboard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function MotoristasPassageiroPage() {
  const { user } = useAuth();

  // Se não for passageiro, mostrar mensagem de acesso negado
  if (user?.role !== 'PASSAGEIRO') {
    return (
      <View style={styles.deniedContainer}>
        {/* Ícone com fundo suave */}
        <View style={styles.deniedIconWrap}>
          <Ionicons name="shield-half-outline" size={56} color="#ef4444" />
        </View>
        
        {/* Textos de aviso */}
        <Text style={styles.deniedTitle}>Acesso Restrito</Text>
        <Text style={styles.deniedMessage}>
          Você não tem permissão para acessar esta página. Essa área é exclusiva para passageiros.
        </Text>

        {/* Botão de rota de fuga */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()} // Retorna para a tela anterior com segurança
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MotoristasPassageiroDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060c22",
  },
  deniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#060c22",
    paddingHorizontal: 32,
  },
  deniedIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 12,
    textAlign: "center",
  },
  deniedMessage: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});