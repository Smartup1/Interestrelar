import React, { useEffect, useRef } from "react";
import { View, Text, Modal, Pressable, TouchableWithoutFeedback, Animated, Easing } from "react-native";

interface GameModalProps {
  visible: boolean;
  score: number;
  coins: number;
  gems: number;
  onRestart: () => void;
}

export default function GameModal({ visible, score, coins, gems, onRestart }: GameModalProps) {
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrada do card
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      // Brilho pulsante na borda
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();

      // Botão pulsando
      Animated.loop(
        Animated.sequence([
          Animated.timing(btnScale, { toValue: 1.05, duration: 700, useNativeDriver: true }),
          Animated.timing(btnScale, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      cardScale.setValue(0.7);
      cardOpacity.setValue(0);
      glowAnim.setValue(0);
      btnScale.setValue(1);
    }
  }, [visible]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,180,0,0.4)", "rgba(255,220,0,1)"],
  });

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
        }}>
          <Animated.View style={{
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
            width: "88%",
          }}>
            {/* Card com borda animada */}
            <Animated.View style={{
              backgroundColor: "#0a0a1e",
              borderRadius: 28,
              padding: 28,
              alignItems: "center",
              borderWidth: 2,
              borderColor,
              shadowColor: "#ffd700",
              shadowRadius: 20,
              shadowOpacity: 0.5,
            }}>
              {/* Título */}
              <Text style={{
                fontSize: 13, letterSpacing: 6, color: "#ff4444",
                fontWeight: "bold", marginBottom: 6,
              }}>
                GAME OVER
              </Text>
              <Text style={{ fontSize: 60, marginBottom: 4 }}>💀</Text>

              {/* Score */}
              <Text style={{ fontSize: 11, color: "rgba(150,200,255,0.6)", letterSpacing: 3, marginBottom: 2 }}>
                PONTUAÇÃO FINAL
              </Text>
              <Text style={{
                fontSize: 58, fontWeight: "bold", color: "#ffd700",
                textShadowColor: "#ff8800", textShadowRadius: 12,
                marginBottom: 16,
              }}>
                {score}
              </Text>

              {/* Divisor */}
              <View style={{ width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 20 }} />

              {/* Recursos */}
              <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 28 }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 34, marginBottom: 4 }}>💰</Text>
                  <Text style={{ fontSize: 26, fontWeight: "bold", color: "#ffd700" }}>{coins}</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 1 }}>MOEDAS</Text>
                </View>
                <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 34, marginBottom: 4 }}>💎</Text>
                  <Text style={{ fontSize: 26, fontWeight: "bold", color: "#00ffff" }}>{gems}</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 1 }}>GEMAS</Text>
                </View>
              </View>

              {/* Botão */}
              <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
                <Pressable
                  onPress={onRestart}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? "#cc0000" : "#e01111",
                    borderRadius: 50,
                    paddingVertical: 16,
                    alignItems: "center",
                    shadowColor: "#ff0000",
                    shadowRadius: 12,
                    shadowOpacity: pressed ? 0.3 : 0.7,
                  })}
                >
                  <Text style={{
                    color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 2,
                  }}>
                    🔄  JOGAR NOVAMENTE
                  </Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
