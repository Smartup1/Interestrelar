// app/perfil.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import HomeSky from "../src/components/Sky/HomeSky";
import { useAuth } from "../src/hooks/useAuth";
import { useGoogleSignIn } from "../src/hooks/useGoogleSignIn";
import { deleteAllLocalData } from "../src/services/auth";
import { PRIVACY_URL } from "../src/config/server";
import { AuthProviderId } from "../src/types/ranking";

const PROVIDER_NAMES: Record<AuthProviderId, string> = {
  guest: "Convidado",
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

const LABEL = {
  color: "rgba(180,210,255,0.8)",
  fontSize: 11,
  letterSpacing: 2,
  fontWeight: "700" as const,
  marginBottom: 8,
};

export default function PerfilScreen() {
  const router = useRouter();
  const { user, isGuest, updateName, signOut, isProviderConfigured } = useAuth();

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const google = useGoogleSignIn();
  const googleReady = isProviderConfigured("google");

  useEffect(() => {
    if (user) setName(user.name);
  }, [user?.id]);

  const handleSaveName = async () => {
    await updateName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSignOut = () => {
    Alert.alert("Sair da conta", "Voltar para o perfil de convidado?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Apagar meus dados",
      "Isso apaga seu perfil, seu ranking, suas naves e suas estatísticas deste aparelho. Não dá para desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: async () => {
            await deleteAllLocalData();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#05051a" }}>
      <StatusBar hidden />
      <HomeSky />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Topo */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Text style={{ color: "#00D9FF", fontSize: 22 }}>←</Text>
          </TouchableOpacity>

          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 4 }}>
            👤 PERFIL
          </Text>
        </View>

        {/* Cartão do jogador */}
        <View
          style={{
            alignItems: "center",
            padding: 20,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,20,0.55)",
            borderWidth: 1,
            borderColor: "rgba(0,217,255,0.3)",
            marginBottom: 22,
          }}
        >
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{
                width: 74,
                height: 74,
                borderRadius: 37,
                borderWidth: 2,
                borderColor: "#00D9FF",
                marginBottom: 10,
              }}
            />
          ) : (
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
          )}

          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 4 }}>
            {user?.name ?? "..."}
          </Text>

          <Text style={{ color: "rgba(180,210,255,0.7)", fontSize: 11, letterSpacing: 2 }}>
            CONTA: {user ? PROVIDER_NAMES[user.provider].toUpperCase() : "..."}
          </Text>

          {user?.email ? (
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>
              {user.email}
            </Text>
          ) : null}
        </View>

        {/* Nome */}
        <Text style={LABEL}>NOME NO RANKING</Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={16}
            placeholder="Seu nome"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={{
              flex: 1,
              color: "#fff",
              fontSize: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
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
            <Text style={{ color: "#fff", fontWeight: "800" }}>{saved ? "✓" : "SALVAR"}</Text>
          </TouchableOpacity>
        </View>

        {/* Conta */}
        <Text style={LABEL}>{isGuest ? "ENTRAR NA SUA CONTA" : "CONTA CONECTADA"}</Text>

        {isGuest ? (
          googleReady ? (
            <View style={{ gap: 8 }}>
              <Pressable
                onPress={google.signIn}
                disabled={google.busy || !google.ready}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  paddingVertical: 15,
                  borderRadius: 50,
                  backgroundColor: pressed ? "#e8e8e8" : "#fff",
                  opacity: google.busy ? 0.7 : 1,
                })}
              >
                {google.busy ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#4285F4" }}>G</Text>
                )}
                <Text style={{ color: "#222", fontWeight: "800", fontSize: 14, letterSpacing: 1 }}>
                  ENTRAR COM GOOGLE
                </Text>
              </Pressable>

              {google.error && (
                <Text style={{ color: "#ff8a8a", fontSize: 12, textAlign: "center" }}>
                  {google.error}
                </Text>
              )}

              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18 }}>
                Com login, seus pontos ficam ligados à sua conta.
              </Text>
            </View>
          ) : (
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 18 }}>
              Você joga como convidado e seus resultados ficam salvos neste aparelho.
              O login com Google chega em breve.
            </Text>
          )
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
            <Text style={{ color: "#ff6b6b", fontWeight: "800" }}>SAIR DA CONTA</Text>
          </TouchableOpacity>
        )}

        {/* Privacidade e dados */}
        <Text style={[LABEL, { marginTop: 32 }]}>PRIVACIDADE E DADOS</Text>

        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL(PRIVACY_URL)}
            style={{
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "700", fontSize: 13 }}>
              Política de Privacidade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={{
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: "rgba(255,70,70,0.1)",
              borderWidth: 1,
              borderColor: "rgba(255,70,70,0.35)",
            }}
          >
            <Text style={{ color: "#ff6b6b", fontWeight: "800", fontSize: 13 }}>
              APAGAR MEUS DADOS
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
