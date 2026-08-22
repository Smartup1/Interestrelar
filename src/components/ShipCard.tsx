import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ship,
} from "../../types/ships";

interface ShipCardProps {
  ship: Ship;
  unlocked: boolean;
  selected: boolean;
  onSelect: () => void;
}

function ShipCard({
  ship,
  unlocked,
  selected,
  onSelect,
}: ShipCardProps) {
  return (
    <Pressable
      onPress={
        unlocked
          ? onSelect
          : undefined
      }
      style={[
        styles.card,

        selected &&
          styles.selected,

        !unlocked &&
          styles.locked,
      ]}
    >
      <View style={styles.shipIcon}>
        <Text style={styles.emoji}>
          {unlocked
            ? ship.emoji
            : "🔒"}
        </Text>
      </View>

      <View
        style={styles.info}
      >
        <Text style={styles.name}>
          {ship.name}
        </Text>

        {unlocked ? (
          <Text
            style={
              styles.description
            }
          >
            {ship.description}
          </Text>
        ) : (
          <Text
            style={
              styles.unlockText
            }
          >
            🔒 Libera em{" "}
            {ship.unlockScore.toLocaleString(
              "pt-BR"
            )}{" "}
            pontos
          </Text>
        )}
      </View>

      {selected && (
        <View
          style={
            styles.equipped
          }
        >
          <Text
            style={
              styles.equippedText
            }
          >
            EQUIPADA
          </Text>
        </View>
      )}

      {unlocked &&
        !selected && (
          <View
            style={
              styles.button
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              USAR
            </Text>
          </View>
        )}
    </Pressable>
  );
}

export default memo(
  ShipCard
);

const styles =
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",

      minHeight: 100,

      marginHorizontal: 16,
      marginVertical: 6,

      padding: 14,

      borderRadius: 18,

      borderWidth: 1,
      borderColor:
        "rgba(100,180,255,0.25)",

      backgroundColor:
        "rgba(15,25,50,0.85)",
    },

    selected: {
      borderColor:
        "#00eaff",

      backgroundColor:
        "rgba(0,180,255,0.15)",
    },

    locked: {
      opacity: 0.65,
    },

    shipIcon: {
      width: 70,
      height: 70,

      alignItems: "center",
      justifyContent: "center",

      borderRadius: 35,

      backgroundColor:
        "rgba(0,0,0,0.25)",
    },

    emoji: {
      fontSize: 42,
    },

    info: {
      flex: 1,
      marginLeft: 14,
    },

    name: {
      color: "#ffffff",
      fontSize: 19,
      fontWeight: "800",
    },

    description: {
      color: "#a9c7e8",
      fontSize: 12,
      marginTop: 5,
    },

    unlockText: {
      color: "#ffc857",
      fontSize: 12,
      marginTop: 5,
    },

    equipped: {
      paddingHorizontal: 9,
      paddingVertical: 6,

      borderRadius: 10,

      backgroundColor:
        "rgba(0,255,200,0.15)",
    },

    equippedText: {
      color: "#00ffd5",
      fontSize: 10,
      fontWeight: "800",
    },

    button: {
      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 10,

      backgroundColor:
        "#0077ff",
    },

    buttonText: {
      color: "#ffffff",
      fontSize: 11,
      fontWeight: "800",
    },
  });
