// app/ranking.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../src/hooks/useAuth";
import { isServerConfigured } from "../src/config/server";
import {
  getLocalRanking,
  getGlobalRanking,
  syncPendingScores,
} from "../src/services/ranking";
import { ScoreEntry } from "../src/types/ranking";

type Tab = "local" | "global";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const serverOn = isServerConfigured();

  const [tab, setTab] = useState<Tab>("local");
  const [list, setList] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (tab === "local") {
        // Aproveita para reenviar resultados pendentes ao servidor
        if (serverOn) await syncPendingScores();
        setList(await getLocalRanking(50));
      } else {
        const global = await getGlobalRanking();
        setList(global ?? []);
      }
    } catch {
      setError("Não foi possível carregar o ranking. Verifique a internet.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [tab, serverOn]);

  useEffect(() => {
    void load();
  }, [load]);

  const best = list[0]?.score ?? 0;

  const renderItem = ({
    item,
    index,
  }: {
    item: ScoreEntry;
    index: number;
  }) => {
    const mine = !!user && item.userId === user.id;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 8,
          borderRadius: 14,
          backgroundColor: mine
            ? "rgba(0,217,255,0.10)"
            : "rgba(255,255,255,0.04)",
          borderWidth: 1,
          borderColor: mine
            ? "rgba(0,217,255,0.45)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        <Text
          style={{
            width: 38,
            fontSize: index < 3 ? 22 : 15,
            fontWeight: "800",
            color: "#9fb4d9",
            textAlign: "center",
          }}
        >
          {index < 3 ? MEDALS[index] : `${index + 1}º`}
        </Text>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text
            numberOfLines={1}
            style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}
          >
            {item.name}
            {mine ? "  (você)" : ""}
          </Text>
          <Text style={{ color: "rgba(180,210,255,0.55)", fontSize: 11 }}>
            💰 {item.coins}   💎 {item.gems}
            {tab === "local" && serverOn
              ? item.synced
                ? "   ☁️ enviado"
                : "   ⏳ pendente"
              : ""}
          </Text>
        </View>

        <Text
          style={{
            color: "#ffd700",
            fontSize: 18,
            fontWeight: "900",
            textShadowColor: "rgba(255,215,0,0.4)",
            textShadowRadius: 6,
          }}
        >
          {item.score.toLocaleString("pt-BR")}
        </Text>
      </View>
    );
  };

  const emptyMessage = () => {
    if (loading) return null;

    if (tab === "global" && !serverOn) {
      return (
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            lineHeight: 22,
            marginTop: 40,
            paddingHorizontal: 24,
          }}
        >
          🌍 O ranking mundial chega em breve.{"\n"}
          Quando o servidor for ligado, os melhores pilotos do jogo
          aparecerão aqui.
        </Text>
      );
    }

    return (
      <Text
        style={{
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
          marginTop: 40,
        }}
      >
        {error ?? "Nenhuma partida ainda. Jogue para entrar no ranking!"}
      </Text>
    );
  };

  const tabButton = (id: Tab, label: string) => (
    <TouchableOpacity
      onPress={() => setTab(id)}
      activeOpacity={0.8}
      style={{
        flex: 1,
        paddingVertical: 11,
        borderRadius: 40,
        alignItems: "center",
        backgroundColor:
          tab === id ? "rgba(0,217,255,0.2)" : "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor:
          tab === id ? "rgba(0,217,255,0.6)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Text
        style={{
          color: tab === id ? "#00D9FF" : "rgba(255,255,255,0.6)",
          fontWeight: "800",
          letterSpacing: 2,
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#05051a", paddingTop: 54 }}>
      <StatusBar hidden />

      {/* Cabeçalho */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 18,
          marginBottom: 14,
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
            flex: 1,
            color: "#fff",
            fontSize: 20,
            fontWeight: "900",
            letterSpacing: 4,
          }}
        >
          🏆 RANKING
        </Text>

        <TouchableOpacity onPress={() => router.push("/perfil")}>
          <Text style={{ color: "rgba(180,210,255,0.7)", fontSize: 12 }}>
            👤 {user?.name ?? "..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Abas */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 18,
          marginBottom: 14,
        }}
      >
        {tabButton("local", "NESTE APARELHO")}
        {tabButton("global", "MUNDIAL")}
      </View>

      {tab === "local" && best > 0 && (
        <Text
          style={{
            color: "rgba(180,210,255,0.6)",
            textAlign: "center",
            fontSize: 11,
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          SEU RECORDE: {best.toLocaleString("pt-BR")}
        </Text>
      )}

      {loading && (
        <ActivityIndicator
          color="#00D9FF"
          style={{ marginVertical: 20 }}
        />
      )}

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyMessage}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 40,
        }}
        refreshing={loading}
        onRefresh={load}
      />

      {error && list.length === 0 && (
        <TouchableOpacity
          onPress={load}
          style={{
            alignSelf: "center",
            marginBottom: 40,
            paddingVertical: 12,
            paddingHorizontal: 26,
            borderRadius: 40,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            TENTAR DE NOVO
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
