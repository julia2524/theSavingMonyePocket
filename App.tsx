import React from "react";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/design-system/theme/theme";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
