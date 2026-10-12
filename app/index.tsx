import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Modal,
  Pressable,
  Linking,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';

import HomeSky from '../src/components/Sky/HomeSky';
import { useDailyCredits } from '../src/hooks/useDailyCredits';
import { useAuth } from '../src/hooks/useAuth';
import { getPlayerStats, PlayerStats } from '../src/services/ranking';
import { hasOnboarded } from '../src/services/auth';
import { PRIVACY_URL } from '../src/config/server';

// ─────────────────────────────────────────────────────────────
// BADGE DE CRÉDITOS
// ─────────────────────────────────────────────────────────────

function CreditsBadge({ credits, total }: { credits: number; total: number }) {
  const pct = total > 0 ? credits / total : 0;
  const color = pct > 0.5 ? '#00E5FF' : pct > 0.2 ? '#FFD700' : '#FF4444';

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,20,0.7)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: `${color}66`,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <Text style={{ fontSize: 9, color: 'rgba(200,225,255,0.75)', letterSpacing: 2, fontWeight: '700' }}>
        JOGADAS
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color }}>{credits}</Text>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>/{total}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// CHIP DO JOGADOR
// ─────────────────────────────────────────────────────────────

function PlayerChip({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(0,0,20,0.7)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(0,217,255,0.35)',
        paddingVertical: 6,
        paddingLeft: 6,
        paddingRight: 16,
        maxWidth: 190,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: 'rgba(0,217,255,0.25)',
          borderWidth: 1.5,
          borderColor: '#00D9FF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
          {(name || 'P').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={{ fontSize: 9, color: 'rgba(200,225,255,0.7)', letterSpacing: 2, fontWeight: '700' }}>
          PILOTO
        </Text>
        <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL SEM CRÉDITOS
// ─────────────────────────────────────────────────────────────

function NoCreditsModal({
  visible,
  resetInfo,
  onClose,
}: {
  visible: boolean;
  resetInfo: string;
  onClose: () => void;
}) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,10,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Animated.View style={{ transform: [{ scale }], opacity, width: '100%', maxWidth: 360 }}>
          <LinearGradient
            colors={['#0d0d2b', '#0a0a1e']}
            style={{
              borderRadius: 24,
              padding: 28,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,68,68,0.4)',
            }}
          >
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🚫</Text>
            <Text style={{ fontSize: 13, letterSpacing: 4, color: '#FF4444', fontWeight: '800', marginBottom: 8 }}>
              SEM JOGADAS
            </Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: 6 }}>
              Você usou todas as{'\n'}jogadas de hoje.
            </Text>
            <Text style={{ fontSize: 13, color: '#FFD700', marginBottom: 28, letterSpacing: 1 }}>
              ⏳ {resetInfo}
            </Text>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 50,
                paddingVertical: 14,
                paddingHorizontal: 40,
              })}
            >
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, letterSpacing: 2, fontWeight: '700' }}>
                VOLTAR
              </Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL COMO JOGAR
// ─────────────────────────────────────────────────────────────

function HowToPlayModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const steps = [
    { emoji: '👆', title: 'Mova a nave', desc: 'Arraste o dedo pela tela para controlar a nave.' },
    { emoji: '🔫', title: 'Atire automaticamente', desc: 'Toque na nave para disparar contra os inimigos.' },
    { emoji: '💰', title: 'Colete recursos', desc: 'Pegue moedas e gemas para aumentar sua pontuação.' },
    { emoji: '❤️', title: 'Sobreviva', desc: 'Evite obstáculos. Você tem 3 vidas — use bem!' },
    { emoji: '🔥', title: 'Combo', desc: 'Destrua inimigos em sequência para multiplicar pontos.' },
    { emoji: '🌅', title: 'Do dia para a noite', desc: 'A cada fase o céu muda: noite, amanhecer, dia e entardecer.' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,10,0.92)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#0a0a1e',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: 'rgba(0,180,255,0.3)',
            padding: 28,
            paddingBottom: 40,
            maxHeight: '90%',
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 24,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: 'rgba(0,200,255,0.8)',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            COMO JOGAR
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {steps.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }}>
                <Text style={{ fontSize: 28, marginRight: 14, marginTop: 2 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 }}>{s.title}</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 18 }}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#cc2200' : '#e01111',
              borderRadius: 50,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 8,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 2 }}>ENTENDI</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL OPÇÕES
// ─────────────────────────────────────────────────────────────

function OptionsModal({
  visible,
  onClose,
  onProfile,
}: {
  visible: boolean;
  onClose: () => void;
  onProfile: () => void;
}) {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const Row = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 15,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ flex: 1, color: '#fff', fontWeight: '700', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,10,0.92)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#0a0a1e',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: 'rgba(0,180,255,0.3)',
            padding: 28,
            paddingBottom: 40,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: 'rgba(0,200,255,0.8)',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            OPÇÕES
          </Text>

          <Row
            icon="👤"
            label="Perfil, conta e dados"
            onPress={() => {
              onClose();
              onProfile();
            }}
          />
          <Row icon="🔒" label="Política de Privacidade" onPress={() => Linking.openURL(PRIVACY_URL)} />

          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
            Interestrelar · versão {version}
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              borderRadius: 50,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 4,
            })}
          >
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, letterSpacing: 2, fontWeight: '700' }}>
              FECHAR
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTÃO SECUNDÁRIO
// ─────────────────────────────────────────────────────────────

function PillButton({
  icon,
  label,
  onPress,
  tint = 'rgba(255,255,255,0.1)',
  border = 'rgba(255,255,255,0.22)',
  color = 'rgba(255,255,255,0.9)',
}: {
  icon: string;
  label: string;
  onPress: () => void;
  tint?: string;
  border?: string;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        paddingVertical: 14,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tint,
        borderWidth: 1,
        borderColor: border,
        flexDirection: 'row',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ color, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { creditsLeft, totalCredits, canPlay, loading, useCredit, resetInfo } = useDailyCredits();

  const [showNoCredits, setShowNoCredits] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [stats, setStats] = useState<PlayerStats>({ best: 0, games: 0, gems: 0 });
  const [checked, setChecked] = useState(false);

  // Primeiro acesso: manda para a tela de boas-vindas / login
  useEffect(() => {
    let alive = true;
    hasOnboarded().then((ok) => {
      if (!alive) return;
      if (!ok) router.replace('/login');
      else setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Atualiza recorde/partidas sempre que a tela volta ao foco
  useFocusEffect(
    useCallback(() => {
      getPlayerStats().then(setStats).catch(() => {});
    }, [])
  );

  // ───────── animações ─────────
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(-30)).current;
  const float = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleY, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    const loop = (v: Animated.Value, a: number, b: number, ms: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: a, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: b, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );

    const loops = [loop(btnScale, 1.04, 1, 900), loop(glowOpacity, 1, 0.4, 1400), loop(float, -8, 8, 1800)];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  // ───────── jogar ─────────
  const handlePlay = async () => {
    if (!canPlay) {
      setShowNoCredits(true);
      return;
    }
    const ok = await useCredit();
    if (ok) router.push('/game');
    else setShowNoCredits(true);
  };

  const statItems = [
    { icon: '🏆', label: 'RECORDE', value: stats.best.toLocaleString('pt-BR') },
    { icon: '💎', label: 'GEMAS', value: stats.gems.toLocaleString('pt-BR') },
    { icon: '🎯', label: 'PARTIDAS', value: stats.games.toLocaleString('pt-BR') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#000010' }}>
      <StatusBar hidden />
      <HomeSky />

      {checked && (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingTop: 48,
            paddingBottom: 30,
            paddingHorizontal: 22,
          }}
        >
          {/* TOPO: jogador + jogadas */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <PlayerChip name={user?.name ?? 'Piloto'} onPress={() => router.push('/perfil')} />
            {!loading && <CreditsBadge credits={creditsLeft} total={totalCredits} />}
          </View>

          {/* TÍTULO */}
          <Animated.View
            style={{ alignItems: 'center', opacity: titleOpacity, transform: [{ translateY: titleY }] }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: 'rgba(0,150,255,0.22)',
                opacity: glowOpacity,
                top: -14,
              }}
            />
            <Animated.Text style={{ fontSize: 68, transform: [{ translateY: float }] }}>🚀</Animated.Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: '900',
                color: '#FFFFFF',
                letterSpacing: 6,
                marginTop: 10,
                textShadowColor: 'rgba(0,180,255,0.7)',
                textShadowRadius: 20,
              }}
            >
              INTERESTELAR
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 }}>
              <View style={{ height: 1, width: 26, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ fontSize: 11, color: 'rgba(235,245,255,0.85)', letterSpacing: 3, fontWeight: '700' }}>
                DEFENDER • COLETAR • SOBREVIVER
              </Text>
              <View style={{ height: 1, width: 26, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>
          </Animated.View>

          {/* ESTATÍSTICAS */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(0,0,20,0.55)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              paddingVertical: 18,
              paddingHorizontal: 12,
            }}
          >
            {statItems.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />}
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFD700' }}>{stat.value}</Text>
                  <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, marginTop: 3, fontWeight: '700' }}>
                    {stat.label}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* BOTÕES */}
          <View style={{ gap: 12 }}>
            <Animated.View style={{ transform: [{ scale: canPlay ? btnScale : 1 }] }}>
              <TouchableOpacity
                onPress={handlePlay}
                activeOpacity={0.85}
                disabled={loading}
                style={{
                  backgroundColor: canPlay ? '#e01111' : 'rgba(80,80,80,0.5)',
                  paddingVertical: 19,
                  borderRadius: 60,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: canPlay ? 'rgba(255,100,100,0.35)' : 'rgba(255,255,255,0.1)',
                  shadowColor: canPlay ? '#ff2222' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 20,
                  shadowOpacity: 0.7,
                  elevation: canPlay ? 8 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '900',
                    color: canPlay ? '#fff' : 'rgba(255,255,255,0.4)',
                    letterSpacing: 4,
                  }}
                >
                  {loading ? '...' : canPlay ? '▶  INICIAR JORNADA' : '🔒  SEM JOGADAS'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={() => router.push('/ships')}
              activeOpacity={0.8}
              style={{
                paddingVertical: 15,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,150,255,0.18)',
                borderWidth: 1,
                borderColor: 'rgba(0,210,255,0.5)',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 19 }}>🚀</Text>
              <Text style={{ color: '#7FEAFF', fontSize: 13, fontWeight: '800', letterSpacing: 2 }}>MINHAS NAVES</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PillButton
                icon="🏆"
                label="RANKING"
                onPress={() => router.push('/ranking')}
                tint="rgba(255,215,0,0.14)"
                border="rgba(255,215,0,0.5)"
                color="#FFD700"
              />
              <PillButton icon="🎮" label="COMO JOGAR" onPress={() => setShowHowTo(true)} />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PillButton icon="👤" label="PERFIL" onPress={() => router.push('/perfil')} />
              <PillButton icon="⚙️" label="OPÇÕES" onPress={() => setShowOptions(true)} />
            </View>
          </View>
        </View>
      )}

      <NoCreditsModal visible={showNoCredits} resetInfo={resetInfo} onClose={() => setShowNoCredits(false)} />
      <HowToPlayModal visible={showHowTo} onClose={() => setShowHowTo(false)} />
      <OptionsModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onProfile={() => router.push('/perfil')}
      />
    </View>
  );
}
