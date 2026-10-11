// app/perfil.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../src/hooks/useAuth";
import { isServerConfigured } from "../src/config/server";
import { AuthProviderId } from "../src/types/ranking";

const PROVIDERS: {
  id: Exclude<AuthProviderId, "guest">;
  label: string;
  icon: string;
}[] = [
  { id: "google", label: "Entrar com Google", icon: "G" },
  { id: "apple", label: "Entrar com Apple", icon: "" },
  { id: "facebook", label: "Entrar com Facebook", icon: "f" },
];

const PROVIDER_NAMES: Record<AuthProviderId, string> = {
  guest: "Convidado",
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

export default function PerfilScreen() {
  const router = useRouter();
  const { user, isGuest, updateName, signOut, isProviderConfigured } =
    useAuth();

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user?.id]);

  const handleSaveName = async () => {
    await updateName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleProvider = (id: Exclude<AuthProviderId, "guest">) => {
    const label = PROVIDER_NAMES[id];

    if (!isProviderConfigured(id)) {
      Alert.alert(
        `Login com ${label}`,
        "Este método ainda não foi configurado.\n\n" +
          "O desenvolvedor precisa criar o app no painel do serviço e " +
          "preencher os IDs em src/config/server.tsx (AUTH_CONFIG)."
      );
      return;
    }

    if (!isServerConfigured()) {
      Alert.alert(
        `Login com ${label}`,
        "Falta ligar o servidor do jogo (SERVER_CONFIG.API_URL), " +
          "que valida o login e guarda a conta."
      );
      return;
    }

    // TODO: iniciar o fluxo do provedor, obter o token e chamar
    // signInWithProviderToken(id, token). Veja src/services/auth.tsx.
    Alert.alert(
      `Login com ${label}`,
      "Configuração encontrada, mas o fluxo do provedor ainda não foi " +
        "conectado nesta tela. Veja o passo a passo em src/services/auth.tsx."
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sair da conta", "Voltar para o perfil de convidado?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#05051a" }}
      contentContainerStyle={{ padding: 20, paddingTop: 54 }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar hidden />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Text style={{ color: "#00D9FF", fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "900",
            letterSpacing: 4,
          }}
        >
          👤 PERFIL
        </Text>
      </View>

      {/* Cartão do jogador */}
      <View
        style={{
          alignItems: "center",
          padding: 20,
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(0,217,255,0.25)",
          marginBottom: 22,
        }}
      >
        <View
          style={{
            width: 74,
            height: 74,
            borderRadius: 37,
            backgroundColor: "rgba(0,217,255,0.2)",
            borderWidth: 2,
            borderColor: "#00D9FF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 32, color: "#fff", fontWeight: "800" }}>
            {(user?.name || "P").charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text
          style={{
            color: "rgba(180,210,255,0.7)",
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          CONTA: {user ? PROVIDER_NAMES[user.provider].toUpperCase() : "..."}
        </Text>

        {user?.email ? (
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            {user.email}
          </Text>
        ) : null}
      </View>

      {/* Nome */}
      <Text
        style={{
          color: "rgba(180,210,255,0.7)",
          fontSize: 11,
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        NOME NO RANKING
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={16}
          placeholder="Seu nome"
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={{
            flex: 1,
            color: "#fff",
            fontSize: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.07)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        />

        <TouchableOpacity
          onPress={handleSaveName}
          style={{
            paddingHorizontal: 20,
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: saved ? "#22aa55" : "#e01111",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {saved ? "✓" : "SALVAR"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login social */}
      <Text
        style={{
          color: "rgba(180,210,255,0.7)",
          fontSize: 11,
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {isGuest ? "ENTRAR NA SUA CONTA" : "CONTA CONECTADA"}
      </Text>

      {isGuest ? (
        <View style={{ gap: 10 }}>
          {PROVIDERS.map((p) => {
            const ready = isProviderConfigured(p.id);

            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleProvider(p.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.15)",
                  opacity: ready ? 1 : 0.6,
                }}
              >
                <Text
                  style={{
                    width: 28,
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "900",
                  }}
                >
                  {p.icon}
                </Text>

                <Text
                  style={{
                    flex: 1,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {p.label}
                </Text>

                {!ready && (
                  <Text
                    style={{
                      color: "#FFD700",
                      fontSize: 10,
                      fontWeight: "800",
                      letterSpacing: 1,
                    }}
                  >
                    EM BREVE
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          <Text
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 6,
            }}
          >
            Por enquanto você joga como convidado e seus resultados ficam
            salvos neste aparelho. Com login, seus pontos passam a ficar
            ligados à sua conta no ranking mundial.
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "rgba(255,70,70,0.12)",
            borderWidth: 1,
            borderColor: "rgba(255,70,70,0.4)",
          }}
        >
          <Text style={{ color: "#ff6b6b", fontWeight: "800" }}>
            SAIR DA CONTA
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
