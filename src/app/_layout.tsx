import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { initializeStorage } from "../utils/storage";
import { AppProvider } from "../context/AppContext";

export default function RootLayout() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <AppProvider>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppProvider>
  );
}
