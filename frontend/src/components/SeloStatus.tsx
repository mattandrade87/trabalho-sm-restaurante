import React from "react";
import { View, Text } from "react-native";
import { corStatus, rotuloStatus } from "../theme";

export default function SeloStatus({ status }) {
  const cor = corStatus[status] || "#868E96";
  return (
    <View
      style={{
        backgroundColor: cor,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
        {rotuloStatus[status] || status}
      </Text>
    </View>
  );
}
