import { useEffect, useState } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-2282487628451754/9206209663';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: false,
});

export function useRewardedAd(onRewarded: () => void) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carrega o anúncio ao montar
    rewarded.load();
    setLoading(true);

    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
    });

    const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('Recompensa:', reward.amount);
      onRewarded(); // devolve +1 crédito
    });

    const unsubClosed = rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      // Recarrega automaticamente após fechar
      setLoaded(false);
      setLoading(true);
      rewarded.load();
    });

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
    };
  }, []);

  const show = () => {
    if (loaded) {
      rewarded.show();
      setLoaded(false);
    }
  };

  return { show, loaded, loading };
}
