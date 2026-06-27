import React, { useEffect, useRef } from "react";
import { View, Text, Modal, Pressable, TouchableWithoutFeedback, Animated, Easing, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Importa o hook de anúncio apenas no mobile
const useRewardedAdMob = Platform.OS !== 'web'
  ? require('../../hooks/useRewardedAd').useRewardedAd
  : null;

interface GameModalProps {
  visible: boolean;
  score: number;
  coins: number;
  gems: number;
  creditsLeft?: number;
  totalCredits?: number;
  onRestart: () => void;
  onHome?: () => void;
  onEarnCredit?: () => Promise<void>;
}

// Hook stub para web (não usa AdMob)
function useRewardedAdStub(onRewarded: () => void) {
  return {
    show: onRewarded, // no web, clicou já ganha direto (só pra testar)
    loaded: true,
    loading: false,
  };
}

export default function GameModal({
  visible, score, coins, gems,
  creditsLeft = 0, totalCredits = 5,
  onRestart, onHome, onEarnCredit,
}: GameModalProps) {
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const hookToUse = Platform.OS !== 'web' && useRewardedAd ? useRewardedAd : useRewardedAdStub;
  const { show, loaded, loading } = hookToUse(async () => {
    if (onEarnCredit) await onEarnCredit();
  });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();

      if (creditsLeft > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(btnScale, { toValue: 1.05, duration: 700, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 700, useNativeDriver: true }),
          ])
        ).start();
      }
    } else {
      cardScale.setValue(0.7);
      cardOpacity.setValue(0);
      glowAnim.setValue(0);
      btnScale.setValue(1);
    }
  }, [visible]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,180,0,0.3)", "rgba(255,220,0,0.9)"],
  });

  const canRestart = creditsLeft > 0;
  const creditColor = creditsLeft > totalCredits / 2 ? '#00E5FF' : creditsLeft > 1 ? '#FFD700' : '#FF4444';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <TouchableWithoutFeedback>
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,10,0.88)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <Animated.View style={{
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
            width: "100%",
            maxWidth: 360,
          }}>
            <Animated.View style={{
              backgroundColor: "#0a0a1e",
              borderRadius: 28,
              padding: 28,
              alignItems: "center",
              borderWidth: 2,
              borderColor,
            }}>
              <Text style={{ fontSize: 11, letterSpacing: 6, color: "#ff4444", fontWeight: "800", marginBottom: 6 }}>
                GAME OVER
              </Text>
              <Text style={{ fontSize: 56, marginBottom: 4 }}>💀</Text>

              <Text style={{ fontSize: 10, color: "rgba(150,200,255,0.5)", letterSpacing: 3, marginBottom: 2, fontWeight: "700" }}>
                PONTUAÇÃO FINAL
              </Text>
              <Text style={{ fontSize: 52, fontWeight: "800", color: "#ffd700", textShadowColor: "#ff8800", textShadowRadius: 12, marginBottom: 16 }}>
                {score}
              </Text>

              <View style={{ width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 20 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 20 }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 32, marginBottom: 4 }}>💰</Text>
                  <Text style={{ fontSize: 24, fontWeight: "800", color: "#ffd700" }}>{coins}</Text>
                  <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2, letterSpacing: 2, fontWeight: "700" }}>MOEDAS</Text>
                </View>
                <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 32, marginBottom: 4 }}>💎</Text>
                  <Text style={{ fontSize: 24, fontWeight: "800", color: "#00ffff" }}>{gems}</Text>
                  <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2, letterSpacing: 2, fontWeight: "700" }}>GEMAS</Text>
                </View>
              </View>

              {/* Créditos restantes */}
              <View style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 14,
                padding: 14,
                alignItems: "center",
                marginBottom: 20,
                borderWidth: 1,
                borderColor: `${creditColor}22`,
              }}>
                <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 3, fontWeight: "700", marginBottom: 6 }}>
                  JOGADAS RESTANTES HOJE
                </Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {Array.from({ length: totalCredits }).map((_, i) => (
                    <View key={i} style={{
                      width: 28, height: 6, borderRadius: 3,
                      backgroundColor: i < creditsLeft ? creditColor : 'rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: creditColor, marginTop: 8, fontWeight: "700" }}>
                  {creditsLeft} de {totalCredits} restantes
                </Text>
              </View>

              {/* Área de anúncio banner */}
              <View style={{
                width: "100%", height: 60,
                backgroundColor: "rgba(255,255,255,0.02)",
                borderRadius: 10, borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                justifyContent: "center", alignItems: "center",
                marginBottom: 20, borderStyle: "dashed",
              }}>
                <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: 2 }}>ESPAÇO PARA ANÚNCIO</Text>
              </View>

              {/* Botões */}
              <View style={{ width: "100%", gap: 10 }}>
                {canRestart ? (
                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <Pressable
                      onPress={onRestart}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? "#cc0000" : "#e01111",
                        borderRadius: 50, paddingVertical: 16, alignItems: "center",
                        shadowColor: "#ff0000", shadowRadius: 12,
                        shadowOpacity: pressed ? 0.3 : 0.7, elevation: 6,
                      })}
                    >
                      <Text style={{ color: "white", fontSize: 15, fontWeight: "800", letterSpacing: 3 }}>
                        🔄  JOGAR NOVAMENTE
                      </Text>
                    </Pressable>
                  </Animated.View>
                ) : (
                  <Pressable
                    onPress={show}
                    disabled={!loaded}
                    style={({ pressed }) => ({
                      backgroundColor: !loaded ? 'rgba(80,80,80,0.3)' : pressed ? '#cc7700' : '#ff9900',
                      borderRadius: 50, paddingVertical: 16, alignItems: "center",
                      shadowColor: "#ff9900", shadowRadius: 12,
                      shadowOpacity: loaded ? 0.6 : 0, elevation: loaded ? 6 : 0,
                    })}
                  >
                    <Text style={{ color: loaded ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: "800", letterSpacing: 2 }}>
                      {loading ? '⏳  CARREGANDO...' : loaded ? '🎬  ASSISTIR ANÚNCIO (+1)' : '🔒  SEM JOGADAS'}
                    </Text>
                  </Pressable>
                )}

                {onHome && (
                  <Pressable
                    onPress={onHome}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                      borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: 50, paddingVertical: 14, alignItems: "center",
                    })}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700", letterSpacing: 2 }}>
                      🏠  MENU PRINCIPAL
                    </Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
