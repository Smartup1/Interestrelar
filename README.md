Interestelar
Interestelar é um jogo mobile de sobrevivência espacial desenvolvido em React Native com Expo.

🎮 Conceito
O jogador controla uma nave espacial navegando pelo espaço profundo, desviando de obstáculos, destruindo inimigos e coletando recursos como moedas e gemas para acumular pontuação.

✨ Funcionalidades
Sistema de vidas e combo multiplier — aumente sua multiplicação de pontos com sucessivas ações
Coleta de moedas e gemas — recursos para aumentar sua pontuação
Explosões e efeitos visuais — animações dinâmicas durante o gameplay
Sistema de 5 jogadas diárias — com renovação automática à meia-noite
Anúncios premiados (AdMob) — planejado; atualmente desativado (o hook `useRewardedAd` está em modo no-op, veja "Status" abaixo)
Trilha sonora e efeitos de som — experiência imersiva
🛠️ Tecnologias
React Native — framework mobile multiplataforma
Expo — plataforma de desenvolvimento
TypeScript — tipagem estática
expo-router — navegação
expo-linear-gradient — gradientes visuais
AsyncStorage — persistência de dados local
Google AdMob — monetização com anúncios

📋 Status / Pendências
Anúncios premiados (AdMob) — desativados no momento (react-native-google-mobile-ads não está instalado; src/hooks/useRewardedAd.tsx é um no-op). Para reativar: instalar a lib, configurar app.json (app IDs) e implementar a lógica de carregamento/exibição.
Ícones e splash screen — ainda não foram adicionados a assets/ nem referenciados em app.json; necessários antes de publicar nas lojas.
Sem testes automatizados nem workflow de CI configurado.
