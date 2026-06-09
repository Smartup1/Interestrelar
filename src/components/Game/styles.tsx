import { StyleSheet } from "react-native";

// Usado apenas para elementos simples que não precisam de animação inline
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000010",
  },
  star: {
    position: "absolute",
    backgroundColor: "white",
  },
  trail: {
    position: "absolute",
  },
  collectible: {
    position: "absolute",
  },
  obstacle: {
    position: "absolute",
  },
  bulletP1: {
    position: "absolute",
    width: 8,
    height: 14,
    backgroundColor: "#00eeff",
    borderRadius: 4,
  },
  explosion: {
    position: "absolute",
    fontSize: 32,
  },
  shield: {
    position: "absolute",
    fontSize: 50,
  },
  shootIndicator: {
    position: "absolute",
    backgroundColor: "rgba(0,200,255,0.2)",
    borderRadius: 50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(0,220,255,0.4)",
  },
  shootIndicatorText: {
    fontSize: 10,
    color: "#00eeff",
  },
});
