import React, { useState } from "react";
import styled from "styled-components/native";
import { TextInputProps } from "react-native";

interface AppInputProps extends TextInputProps {
  label: string;
}

export const AppInput = ({ label, ...props }: AppInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <InputContainer>
      <LabelText>{label}</LabelText>
      <StyledTextInput
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#9AA19D"
        {...props}
      />
    </InputContainer>
  );
};

const InputContainer = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const LabelText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const StyledTextInput = styled.TextInput<{ isFocused: boolean }>`
  height: 48px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme, isFocused }) =>
    isFocused ? theme.colors.primary : theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
