// App.tsx
import React from "react";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/design-system/theme/theme";
import OCRTestScreen from "./OCRTestScreen";
import ReceiptConfirmScreen from "./src/screens/ReceiptConfirm/ReceiptConfirmScreen";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
