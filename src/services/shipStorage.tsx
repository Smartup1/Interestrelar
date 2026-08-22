import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShipId, ShipStorage } from "../types/ships";

const STORAGE_KEY = "@interestrelar/ships";

const DEFAULT_DATA: ShipStorage = {
  selectedShip: "explorer",
  unlockedShips: ["explorer"],
};

export async function loadShipStorage(): Promise<ShipStorage> {
  try {
    const stored = await AsyncStorage.getItem(
      STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_DATA;
    }

    const parsed = JSON.parse(stored);

    return {
      selectedShip:
        parsed.selectedShip ?? "explorer",

      unlockedShips:
        Array.isArray(parsed.unlockedShips)
          ? parsed.unlockedShips
          : ["explorer"],
    };
  } catch (error) {
    console.warn(
      "Erro ao carregar naves:",
      error
    );

    return DEFAULT_DATA;
  }
}

export async function saveShipStorage(
  data: ShipStorage
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn(
      "Erro ao salvar naves:",
      error
    );
  }
}

export async function unlockShip(
  shipId: ShipId
): Promise<ShipStorage> {
  const current =
    await loadShipStorage();

  if (
    current.unlockedShips.includes(shipId)
  ) {
    return current;
  }

  const updated: ShipStorage = {
    ...current,
    unlockedShips: [
      ...current.unlockedShips,
      shipId,
    ],
  };

  await saveShipStorage(updated);

  return updated;
}

export async function selectShip(
  shipId: ShipId
): Promise<ShipStorage> {
  const current =
    await loadShipStorage();

  if (
    !current.unlockedShips.includes(shipId)
  ) {
    return current;
  }

  const updated: ShipStorage = {
    ...current,
    selectedShip: shipId,
  };

  await saveShipStorage(updated);

  return updated;
}
