import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Animação pulsante no botão
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200' }}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.8 }}
    >
      <StatusBar hidden />
      
      {/* Overlay escuro */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          
          {/* Título principal */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ 
              fontSize: 60, 
              fontWeight: 'bold', 
              color: '#FFD700',
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 10,
              letterSpacing: 5,
            }}>
              🚀
            </Text>
            <Text style={{ 
              fontSize: 42, 
              fontWeight: 'bold', 
              color: '#FFFFFF',
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 10,
              marginTop: 10,
            }}>
              INTERESTELAR
            </Text>
            <Text style={{ 
              fontSize: 18, 
              color: '#AAA',
              marginTop: 10,
              textAlign: 'center',
            }}>
              Defenda a galáxia • Colete recursos • Sobreviva
            </Text>
          </View>

          {/* Estatísticas/Recordes */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            width: '100%',
            marginBottom: 50,
            paddingHorizontal: 20,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 30 }}>🏆</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD700' }}>0</Text>
              <Text style={{ color: '#FFF', marginTop: 5 }}>High Score</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 30 }}>💎</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD700' }}>0</Text>
              <Text style={{ color: '#FFF', marginTop: 5 }}>Gemas Total</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 30 }}>🎯</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD700' }}>0</Text>
              <Text style={{ color: '#FFF', marginTop: 5 }}>Jogadas</Text>
            </View>
          </View>

          {/* Botão Jogar */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '80%' }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#FF4444',
                paddingVertical: 18,
                borderRadius: 50,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
              }}
              onPress={() => router.push('/game')}
              activeOpacity={0.8}
            >
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#FFF',
                letterSpacing: 2,
              }}>
                ▶ INICIAR JORNADA
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Botões secundários */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            width: '80%',
            marginTop: 30,
          }}>
            <TouchableOpacity 
              style={{ alignItems: 'center' }}
              onPress={() => {}}
            >
              <Text style={{ fontSize: 30 }}>🎮</Text>
              <Text style={{ color: '#FFF', marginTop: 5 }}>Como Jogar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ alignItems: 'center' }}
              onPress={() => {}}
            >
              <Text style={{ fontSize: 30 }}>⚙️</Text>
              <Text style={{ color: '#FFF', marginTop: 5 }}>Configurações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ alignItems: 'center' }}
              onPress={() => {}}
            >
              <Text style={{ fontSize: 30 }}>ℹ️</Text>
              <Text style={{ color: '#FFF', marginTop: 5 }}>Sobre</Text>
            </TouchableOpacity>
          </View>

          {/* Versão */}
          <Text style={{ 
            position: 'absolute', 
            bottom: 20, 
            color: '#666',
            fontSize: 12,
          }}>
            Versão 1.0.0 • Interestelar Game
          </Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}