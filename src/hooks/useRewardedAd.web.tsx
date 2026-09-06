// Versão web — sem AdMob (biblioteca nativa não funciona no navegador)
export function useRewardedAd(onRewarded: () => void) {
  const show = () => {
    // No navegador, simula a recompensa direto (apenas para testes)
    onRewarded();
  };

  return { show, loaded: true, loading: false };
}