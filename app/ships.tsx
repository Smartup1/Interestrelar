import React from "react";

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import {
  router,
} from "expo-router";

import ShipCard from "../src/components/Ships/ShipCard";

import {
  useShips,
} from "../src/hooks/useShips";

export default function ShipsScreen() {
  const {
    ships,
    selectedShipId,
    unlockedShips,
    loading,
    selectShip,
    isUnlocked,
  } = useShips();

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <ActivityIndicator
          size="large"
          color="#00eaff"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.back()
          }
          style={styles.back}
        >
          <Text
            style={styles.backText}
          >
            ‹
          </Text>
        </Pressable>

        <View>
          <Text
            style={styles.title}
          >
            MINHAS NAVES
          </Text>

          <Text
            style={styles.subtitle}
          >
            {unlockedShips.length}{" "}
            de {ships.length}{" "}
            desbloqueadas
          </Text>
        </View>
      </View>

      <View
        style={styles.current}
      >
        <Text
          style={styles.currentLabel}
        >
          NAVE ATUAL
        </Text>

        <Text
          style={styles.currentEmoji}
        >
          {
            ships.find(
              (ship) =>
                ship.id ===
                selectedShipId
            )?.emoji
          }
        </Text>

        <Text
          style={styles.currentName}
        >
          {
            ships.find(
              (ship) =>
                ship.id ===
                selectedShipId
            )?.name
          }
        </Text>
      </View>

      <FlatList
        data={ships}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerStyle={
          styles.list
        }
        showsVerticalScrollIndicator={
          false
        }
        renderItem={({ item }) => (
          <ShipCard
            ship={item}
            unlocked={isUnlocked(
              item.id
            )}
            selected={
              selectedShipId ===
              item.id
            }
            onSelect={() =>
              selectShip(
                item.id
              )
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#030817",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 10,
    },

    back: {
      width: 44,
      height: 44,

      alignItems: "center",
      justifyContent: "center",

      marginRight: 10,

      borderRadius: 22,

      backgroundColor:
        "rgba(255,255,255,0.08)",
    },

    backText: {
      color: "#ffffff",
      fontSize: 36,
      lineHeight: 38,
    },

    title: {
      color: "#ffffff",
      fontSize: 22,
      fontWeight: "900",
    },

    subtitle: {
      color: "#7fa4ca",
      fontSize: 12,
      marginTop: 2,
    },

    current: {
      marginHorizontal: 16,
      marginBottom: 10,

      paddingVertical: 14,

      alignItems: "center",

      borderRadius: 20,

      backgroundColor:
        "rgba(0,130,255,0.10)",

      borderWidth: 1,
      borderColor:
        "rgba(0,220,255,0.25)",
    },

    currentLabel: {
      color: "#7fa4ca",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
    },

    currentEmoji: {
      fontSize: 55,
      marginTop: 4,
    },

    currentName: {
      color: "#00eaff",
      fontSize: 18,
      fontWeight: "900",
    },

    list: {
      paddingTop: 4,
      paddingBottom: 30,
    },
  });
