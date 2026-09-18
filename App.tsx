// App.tsx
import React from "react";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/design-system/theme/theme";
import OCRTestScreen from "./OCRTestScreen";
import ReceiptConfirmScreen from "./src/screens/ReceiptConfirm/ReceiptConfirmScreen";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <ReceiptConfirmScreen />
    </ThemeProvider>
  );
}
