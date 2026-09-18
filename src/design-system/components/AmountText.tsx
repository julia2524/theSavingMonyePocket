import React from "react";
import styled from "styled-components/native";

interface AmountTextProps {
  amount: number;
  size?: "small" | "medium" | "large" | "hero";
  color?: string;
  prefix?: string;
}

export const AmountText = ({
  amount,
  size = "large",
  color,
  prefix = "",
}: AmountTextProps) => {
  return (
    <StyledAmountText size={size} customColor={color}>
      {prefix}
      {amount.toLocaleString()}원
    </StyledAmountText>
  );
};

const StyledAmountText = styled.Text<{
  size: "small" | "medium" | "large" | "hero";
  customColor?: string;
}>`
  font-size: ${({ theme, size }) => theme.typography.amount[size]}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  font-weight: 700;
  color: ${({ theme, customColor }) => customColor || theme.colors.textPrimary};
`;
