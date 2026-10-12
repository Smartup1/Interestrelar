// app/login.tsx
//
// Tela de boas-vindas / login. Aparece só no primeiro acesso.
// - Entrar com Google (só aparece quando os IDs estão configurados)
// - Jogar como convidado (escolhe o apelido que aparece no ranking)

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import HomeSky from "../src/components/Sky/HomeSky";
import { useAuth } from "../src/hooks/useAuth";
import { useGoogleSignIn } from "../src/hooks/useGoogleSignIn";
import { continueAsGuest, markOnboarded } from "../src/services/auth";
import { PRIVACY_URL } from "../src/config/server";

export default function LoginScreen() {
  const router = useRouter();
  const { user, isProviderConfigured } = useAuth();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const enter = () => router.replace("/");

  const google = useGoogleSignIn(async () => {
    await markOnboarded();
    enter();
  });

  const googleReady = isProviderConfigured("google");

  // Entrada suave
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGuest = async () => {
    if (saving) return;
    setSaving(true);
    await continueAsGuest(name || user?.name);
    enter();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000010" }}>
      <StatusBar hidden />
      <HomeSky />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingTop: 90,
            paddingBottom: 36,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              alignItems: "center",
              opacity: fade,
              transform: [{ translateY: rise }],
            }}
          >
            <Text style={{ fontSize: 72 }}>🚀</Text>
            <Text
              style={{
                fontSize: 34,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: 6,
                marginTop: 8,
                textShadowColor: "rgba(0,180,255,0.6)",
                textShadowRadius: 20,
              }}
            >
              INTERESTELAR
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "rgba(220,235,255,0.75)",
                letterSpacing: 3,
                fontWeight: "600",
                marginTop: 10,
              }}
            >
              DEFENDER • COLETAR • SOBREVIVER
            </Text>
          </Animated.View>

          <Animated.View
            style={{ opacity: fade, transform: [{ translateY: rise }], gap: 14 }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 15,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 6,
              }}
            >
              Bem-vindo, piloto! Entre para guardar seus pontos no ranking ou
              jogue agora como convidado.
            </Text>

            {googleReady && (
              <Pressable
                onPress={google.signIn}
                disabled={google.busy || !google.ready}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  paddingVertical: 16,
                  borderRadius: 50,
                  backgroundColor: pressed ? "#e8e8e8" : "#ffffff",
                  opacity: google.busy ? 0.7 : 1,
                })}
              >
                {google.busy ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#4285F4" }}>
                    G
                  </Text>
                )}
                <Text style={{ color: "#222", fontWeight: "800", fontSize: 14, letterSpacing: 1 }}>
                  ENTRAR COM GOOGLE
                </Text>
              </Pressable>
            )}

            {google.error && (
              <Text style={{ color: "#ff8a8a", fontSize: 12, textAlign: "center" }}>
                {google.error}
              </Text>
            )}

            {googleReady && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 2 }}>
                  OU
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
              </View>
            )}

            <Text
              style={{
                color: "rgba(180,210,255,0.8)",
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: "700",
              }}
            >
              SEU APELIDO NO RANKING
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              maxLength={16}
              placeholder="Piloto"
              placeholderTextColor="rgba(255,255,255,0.35)"
              returnKeyType="done"
              onSubmitEditing={handleGuest}
              style={{
                color: "#fff",
                fontSize: 16,
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            />

            <Pressable
              onPress={handleGuest}
              disabled={saving}
              style={({ pressed }) => ({
                paddingVertical: 17,
                borderRadius: 50,
                alignItems: "center",
                backgroundColor: pressed ? "#cc2200" : "#e01111",
                borderWidth: 1,
                borderColor: "rgba(255,100,100,0.3)",
                shadowColor: "#ff2222",
                shadowOpacity: 0.6,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
                opacity: saving ? 0.7 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 3 }}>
                ▶  JOGAR COMO CONVIDADO
              </Text>
            </Pressable>

            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                textAlign: "center",
                lineHeight: 16,
                marginTop: 4,
              }}
            >
              Ao continuar você concorda com a{" "}
              <Text
                onPress={() => Linking.openURL(PRIVACY_URL)}
                style={{ textDecorationLine: "underline", color: "rgba(180,210,255,0.8)" }}
              >
                Política de Privacidade
              </Text>
              . Você pode apagar seus dados a qualquer momento no Perfil.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
