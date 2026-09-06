import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

interface HUDProps {
  score: number;
  coins: number;
  gems: number;
  combo: number;
  lives: number;
}

export default function HUD({ score, coins, gems, combo, lives }: HUDProps) {
  // Combo pisca quando > 1
  const comboScale = useRef(new Animated.Value(1)).current;
  const prevCombo = useRef(combo);

  useEffect(() => {
    if (combo > 1 && combo !== prevCombo.current) {
      Animated.sequence([
        Animated.timing(comboScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
        Animated.timing(comboScale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
    prevCombo.current = combo;
  }, [combo]);

  // Vidas pulsam em vermelho quando <= 1
  const livesGlow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (lives <= 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(livesGlow, { toValue: 1.3, duration: 400, useNativeDriver: true }),
          Animated.timing(livesGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      livesGlow.setValue(1);
    }
  }, [lives]);

  return (
    <>
      {/* Barra superior */}
      <View style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 90,
        backgroundColor: "rgba(0,0,20,0.65)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,180,255,0.2)",
        paddingTop: 40,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 20,
      }}>
        {/* Score */}
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ fontSize: 10, color: "rgba(150,220,255,0.7)", letterSpacing: 2, fontWeight: "bold" }}>
            SCORE
          </Text>
          <Text style={{
            fontSize: 22, fontWeight: "bold", color: "#ffffff",
            textShadowColor: "#00aaff", textShadowRadius: 8,
          }}>
            {score}
          </Text>
        </View>

        {/* Moedas + Gemas */}
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>💰</Text>
            <Text style={{ fontSize: 13, color: "#ffd700", fontWeight: "bold" }}>{coins}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>💎</Text>
            <Text style={{ fontSize: 13, color: "#00ffff", fontWeight: "bold" }}>{gems}</Text>
          </View>
        </View>

        {/* Vidas */}
        <Animated.View style={{ transform: [{ scale: livesGlow }] }}>
          <Text style={{ fontSize: 10, color: "rgba(255,100,100,0.8)", letterSpacing: 2, fontWeight: "bold", textAlign: "right" }}>
            VIDAS
          </Text>
          <Text style={{
            fontSize: 20, textAlign: "right",
            color: lives <= 1 ? "#ff3333" : "#ff6666",
            textShadowColor: lives <= 1 ? "#ff0000" : "transparent",
            textShadowRadius: 8,
          }}>
            {"❤️".repeat(Math.max(0, lives))}
          </Text>
        </Animated.View>
      </View>

      {/* Combo */}
      {combo > 1 && (
        <Animated.View style={{
          position: "absolute",
          top: 96,
          alignSelf: "center",
          left: 0, right: 0,
          alignItems: "center",
          zIndex: 20,
          transform: [{ scale: comboScale }],
        }}>
          <Text style={{
            fontSize: 16, fontWeight: "bold",
            color: "#ff8800",
            textShadowColor: "#ff4400",
            textShadowRadius: 6,
            letterSpacing: 2,
          }}>
            🔥 COMBO x{combo}
          </Text>
        </Animated.View>
      )}
    </>
  );
}
