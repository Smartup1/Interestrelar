import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useDailyCredits } from '../src/hooks/useDailyCredits';

// ─────────────────────────────────────────────────────────────
// BADGE DE CRÉDITOS
// ─────────────────────────────────────────────────────────────

function CreditsBadge({
  credits,
  total,
}: {
  credits: number;
  total: number;
}) {
  const pct = total > 0 ? credits / total : 0;

  const color =
    pct > 0.5
      ? '#00E5FF'
      : pct > 0.2
        ? '#FFD700'
        : '#FF4444';

  return (
    <View
      style={{
        position: 'absolute',
        top: 52,
        right: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,20,0.75)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: `${color}55`,
        paddingHorizontal: 12,
        paddingVertical: 8,
        zIndex: 50,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          color: 'rgba(180,210,255,0.6)',
          letterSpacing: 2,
          fontWeight: '700',
        }}
      >
        JOGADAS
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          marginTop: 2,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color,
          }}
        >
          {credits}
        </Text>

        <Text
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            marginLeft: 2,
          }}
        >
          /{total}
        </Text>
      </View>
    </View>
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
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,10,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
            width: '100%',
            maxWidth: 360,
          }}
        >
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
            <Text
              style={{
                fontSize: 44,
                marginBottom: 12,
              }}
            >
              🚫
            </Text>

            <Text
              style={{
                fontSize: 13,
                letterSpacing: 4,
                color: '#FF4444',
                fontWeight: '800',
                marginBottom: 8,
              }}
            >
              SEM JOGADAS
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 6,
              }}
            >
              Você usou todas as{'\n'}
              jogadas de hoje.
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: '#FFD700',
                marginBottom: 28,
                letterSpacing: 1,
              }}
            >
              ⏳ {resetInfo}
            </Text>

            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.08)',
                marginBottom: 20,
              }}
            />

            <View
              style={{
                width: '100%',
                height: 80,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: 2,
                }}
              >
                ESPAÇO PARA ANÚNCIO
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: 50,
                paddingVertical: 14,
                paddingHorizontal: 40,
              })}
            >
              <Text
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  letterSpacing: 2,
                  fontWeight: '700',
                }}
              >
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

function HowToPlayModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const steps = [
    {
      emoji: '👆',
      title: 'Mova a nave',
      desc: 'Arraste o dedo pela tela para controlar a nave.',
    },
    {
      emoji: '🔫',
      title: 'Atire automaticamente',
      desc: 'Toque na nave para disparar contra os inimigos.',
    },
    {
      emoji: '💰',
      title: 'Colete recursos',
      desc: 'Pegue moedas e gemas para aumentar sua pontuação.',
    },
    {
      emoji: '❤️',
      title: 'Sobreviva',
      desc: 'Evite obstáculos. Você tem 3 vidas — use bem!',
    },
    {
      emoji: '🔥',
      title: 'Combo',
      desc: 'Destrua inimigos em sequência para multiplicar pontos.',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,10,0.92)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#0a0a1e',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: 'rgba(0,180,255,0.3)',
            padding: 28,
            paddingBottom: 40,
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

          {steps.map((s, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  marginRight: 14,
                  marginTop: 2,
                }}
              >
                {s.emoji}
              </Text>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: 3,
                  }}
                >
                  {s.title}
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 18,
                  }}
                >
                  {s.desc}
                </Text>
              </View>
            </View>
          ))}

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
            <Text
              style={{
                color: '#fff',
                fontWeight: '800',
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              ENTENDI
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// TELA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();

  const {
    creditsLeft,
    totalCredits,
    canPlay,
    loading,
    useCredit,
    resetInfo,
  } = useDailyCredits();

  const [showNoCredits, setShowNoCredits] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  // ─────────────────────────────────────────────────────────
  // ANIMAÇÕES
  // ─────────────────────────────────────────────────────────

  const titleY = useRef(new Animated.Value(-30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    const buttonAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),

        Animated.timing(btnScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    buttonAnimation.start();

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),

        Animated.timing(glowOpacity, {
          toValue: 0.4,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();

    return () => {
      buttonAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // JOGAR
  // ─────────────────────────────────────────────────────────

  const handlePlay = async () => {
    if (!canPlay) {
      setShowNoCredits(true);
      return;
    }

    const ok = await useCredit();

    if (ok) {
      router.push('/game');
    } else {
      setShowNoCredits(true);
    }
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200',
        }}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.6 }}
      >
        <StatusBar hidden />

        <LinearGradient
          colors={[
            'rgba(2,2,18,0.5)',
            'rgba(5,5,25,0.85)',
            'rgba(0,0,0,0.97)',
          ]}
          style={{ flex: 1 }}
        >
          {/* ─────────────────────────────────────────────── */}
          {/* BADGE */}
          {/* ─────────────────────────────────────────────── */}

          {!loading && (
            <CreditsBadge
              credits={creditsLeft}
              total={totalCredits}
            />
          )}

          {/* ─────────────────────────────────────────────── */}
          {/* CONTEÚDO PRINCIPAL */}
          {/* ─────────────────────────────────────────────── */}

          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              paddingTop: 80,
              paddingBottom: 36,
              paddingHorizontal: 24,
            }}
          >
            {/* ───────────────────────────────────────────── */}
            {/* TOPO */}
            {/* ───────────────────────────────────────────── */}

            <Animated.View
              style={{
                alignItems: 'center',
                opacity: titleOpacity,
                transform: [{ translateY: titleY }],
              }}
            >
              {/* Glow */}
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'rgba(0,150,255,0.18)',
                  opacity: glowOpacity,
                  top: -10,
                }}
              />

              <Text style={{ fontSize: 64 }}>
                🚀
              </Text>

              <Text
                style={{
                  fontSize: 38,
                  fontWeight: '900',
                  color: '#FFFFFF',
                  letterSpacing: 6,
                  marginTop: 8,
                  textShadowColor: 'rgba(0,180,255,0.6)',
                  textShadowRadius: 20,
                }}
              >
                INTERESTELAR
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    height: 1,
                    width: 30,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}
                />

                <Text
                  style={{
                    fontSize: 12,
                    color: 'rgba(180,210,255,0.55)',
                    letterSpacing: 3,
                    fontWeight: '600',
                  }}
                >
                  DEFENDER • COLETAR • SOBREVIVER
                </Text>

                <View
                  style={{
                    height: 1,
                    width: 30,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}
                />
              </View>
            </Animated.View>

            {/* ───────────────────────────────────────────── */}
            {/* STATS */}
            {/* ───────────────────────────────────────────── */}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.07)',
                paddingVertical: 20,
                paddingHorizontal: 24,
              }}
            >
              {[
                {
                  icon: '🏆',
                  label: 'RECORDE',
                  value: '0',
                },
                {
                  icon: '💎',
                  label: 'GEMAS',
                  value: '0',
                },
                {
                  icon: '🎯',
                  label: 'PARTIDAS',
                  value: '0',
                },
              ].map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <View
                      style={{
                        width: 1,
                        backgroundColor: 'rgba(255,255,255,0.07)',
                      }}
                    />
                  )}

                  <View
                    style={{
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 26,
                        marginBottom: 4,
                      }}
                    >
                      {stat.icon}
                    </Text>

                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: '800',
                        color: '#FFD700',
                      }}
                    >
                      {stat.value}
                    </Text>

                    <Text
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.35)',
                        letterSpacing: 2,
                        marginTop: 3,
                        fontWeight: '600',
                      }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* ───────────────────────────────────────────── */}
            {/* BOTÕES */}
            {/* ───────────────────────────────────────────── */}

            <View style={{ gap: 12 }}>
              {/* Anúncio */}
              <View
                style={{
                  height: 52,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.06)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.18)',
                    letterSpacing: 3,
                  }}
                >
                  ESPAÇO PARA ANÚNCIO
                </Text>
              </View>

              {/* ─────────────────────────────────────────── */}
              {/* JOGAR */}
              {/* ─────────────────────────────────────────── */}

              <Animated.View
                style={{
                  transform: [
                    {
                      scale: canPlay ? btnScale : 1,
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  onPress={handlePlay}
                  activeOpacity={0.85}
                  disabled={loading}
                  style={{
                    backgroundColor: canPlay
                      ? '#e01111'
                      : 'rgba(80,80,80,0.4)',
                    paddingVertical: 19,
                    borderRadius: 60,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: canPlay
                      ? 'rgba(255,100,100,0.3)'
                      : 'rgba(255,255,255,0.08)',
                    shadowColor: canPlay
                      ? '#ff2222'
                      : 'transparent',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowRadius: 20,
                    shadowOpacity: 0.7,
                    elevation: canPlay ? 8 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '900',
                      color: canPlay
                        ? '#fff'
                        : 'rgba(255,255,255,0.3)',
                      letterSpacing: 4,
                    }}
                  >
                    {loading
                      ? '...'
                      : canPlay
                        ? '▶  INICIAR JORNADA'
                        : '🔒  SEM JOGADAS'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* ─────────────────────────────────────────── */}
              {/* MINHAS NAVES */}
              {/* ─────────────────────────────────────────── */}

              <TouchableOpacity
                onPress={() => router.push('/ships')}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 15,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,150,255,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(0,210,255,0.35)',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 19 }}>
                  🚀
                </Text>

                <Text
                  style={{
                    color: '#00D9FF',
                    fontSize: 13,
                    fontWeight: '800',
                    letterSpacing: 2,
                  }}
                >
                  MINHAS NAVES
                </Text>
              </TouchableOpacity>

              {/* ─────────────────────────────────────────── */}
              {/* COMO JOGAR + OPÇÕES */}
              {/* ─────────────────────────────────────────── */}

              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                {/* Como jogar */}
                <TouchableOpacity
                  onPress={() => setShowHowTo(true)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 50,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 16 }}>
                    🎮
                  </Text>

                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 12,
                      fontWeight: '700',
                      letterSpacing: 1,
                    }}
                  >
                    COMO JOGAR
                  </Text>
                </TouchableOpacity>

                {/* Opções */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 50,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 16 }}>
                    ⚙️
                  </Text>

                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 12,
                      fontWeight: '700',
                      letterSpacing: 1,
                    }}
                  >
                    OPÇÕES
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ─────────────────────────────────────────── */}
              {/* RODAPÉ */}
              {/* ─────────────────────────────────────────── */}

              <View
                style={{
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: 1,
                  }}
                >
                  v1.0.0 · Interestelar Game · {creditsLeft}/{totalCredits} jogadas hoje
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* ─────────────────────────────────────────────────── */}
      {/* MODAIS */}
      {/* ─────────────────────────────────────────────────── */}

      <NoCreditsModal
        visible={showNoCredits}
        resetInfo={resetInfo}
        onClose={() => setShowNoCredits(false)}
      />

      <HowToPlayModal
        visible={showHowTo}
        onClose={() => setShowHowTo(false)}
      />
    </>
  );
}