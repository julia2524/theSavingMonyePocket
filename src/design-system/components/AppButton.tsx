import React from "react";
import styled from "styled-components/native";
import { ActivityIndicator } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
}

export const AppButton = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: AppButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <ButtonContainer
      variant={variant}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#176B5B"} />
      ) : (
        <ButtonText variant={variant}>{title}</ButtonText>
      )}
    </ButtonContainer>
  );
};

const ButtonContainer = styled.TouchableOpacity<{
  variant: "primary" | "secondary";
}>`
  height: 52px;
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.md}px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.primary : theme.colors.primaryLight};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ButtonText = styled.Text<{ variant: "primary" | "secondary" }>`
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  font-weight: 600;
  color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.white : theme.colors.primary};
`;
