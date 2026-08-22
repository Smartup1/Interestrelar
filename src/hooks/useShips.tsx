import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SHIPS,
  getShipById,
} from "../constants/ships";

import {
  loadShipStorage,
  saveShipStorage,
} from "../services/shipStorage";

import {
  Ship,
  ShipId,
} from "../types/ships";

export function useShips() {
  const [selectedShipId, setSelectedShipId] =
    useState<ShipId>("explorer");

  const [unlockedShips, setUnlockedShips] =
    useState<ShipId[]>(["explorer"]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data =
        await loadShipStorage();

      if (!mounted) return;

      setSelectedShipId(
        data.selectedShip
      );

      setUnlockedShips(
        data.unlockedShips
      );

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedShip = useMemo(
    () =>
      getShipById(
        selectedShipId
      ),
    [selectedShipId]
  );

  const isUnlocked = useCallback(
    (shipId: ShipId) =>
      unlockedShips.includes(shipId),
    [unlockedShips]
  );

  const unlockShipsByScore =
    useCallback(
      async (score: number) => {
        const newShips: Ship[] =
          SHIPS.filter(
            (ship) =>
              score >=
                ship.unlockScore &&
              !unlockedShips.includes(
                ship.id
              )
          );

        if (newShips.length === 0) {
          return [];
        }

        const newUnlocked = [
          ...unlockedShips,
          ...newShips.map(
            (ship) => ship.id
          ),
        ];

        setUnlockedShips(
          newUnlocked
        );

        await saveShipStorage({
          selectedShip:
            selectedShipId,
          unlockedShips:
            newUnlocked,
        });

        return newShips;
      },
      [
        unlockedShips,
        selectedShipId,
      ]
    );

  const selectShip = useCallback(
    async (shipId: ShipId) => {
      if (
        !unlockedShips.includes(
          shipId
        )
      ) {
        return false;
      }

      setSelectedShipId(
        shipId
      );

      await saveShipStorage({
        selectedShip: shipId,
        unlockedShips,
      });

      return true;
    },
    [unlockedShips]
  );

  return {
    ships: SHIPS,
    selectedShip,
    selectedShipId,
    unlockedShips,
    loading,
    isUnlocked,
    unlockShipsByScore,
    selectShip,
  };
}
