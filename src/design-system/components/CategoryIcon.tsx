// src/design-system/components/CategoryIcon.tsx
import React from "react";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { ExpenseCategory } from "../../data/expenseStorage";
import { getCategoryIconName } from "../../utils/categoryIcons";

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: number; // 아이콘 크기
  containerSize?: number; // 원형 컨테이너 크기
}

export default function CategoryIcon({
  category,
  size = 20,
  containerSize = 40,
}: CategoryIconProps) {
  const theme = useTheme();
  const categoryColor =
    theme.colors.category?.[category] || theme.colors.primary;
  const iconName = getCategoryIconName(category);

  return (
    <IconContainer size={containerSize} backgroundColor={`${categoryColor}15`}>
      <Ionicons name={iconName} size={size} color={categoryColor} />
    </IconContainer>
  );
}

const IconContainer = styled.View<{ size: number; backgroundColor: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size / 2}px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  align-items: center;
  justify-content: center;
`;
