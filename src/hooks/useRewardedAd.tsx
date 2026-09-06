import { useEffect, useState } from 'react';

// Ads disabled: provide a no-op replacement for the rewarded ad hook so the bundle
// does not require react-native-google-mobile-ads. The rest of the app can still
// call this hook safely; it will do nothing and won't show ads.

export function useRewardedAd(onRewarded: () => void) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No-op: ads removed. If you later re-enable ads, put initialization here.
    return () => {
      // cleanup if necessary
    };
  }, []);

  const show = () => {
    // No-op: nothing to show because ads are disabled.
    // Optionally, you could call onRewarded() immediately if you want to
    // grant the reward without showing an ad.
  };

  return { show, loaded, loading };
}
