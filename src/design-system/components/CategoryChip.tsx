import React from "react";
import styled from "styled-components/native";
import { colors } from "../theme/colors";

export type CategoryType = keyof typeof colors.category;

interface CategoryChipProps {
  category: CategoryType;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const CategoryChip = ({
  category,
  label,
  selected = false,
  onPress,
}: CategoryChipProps) => {
  const categoryColor = colors.category[category] || colors.category.etc;

  return (
    <ChipContainer
      selected={selected}
      categoryColor={categoryColor}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <CategoryDot categoryColor={categoryColor} />
      <ChipText selected={selected}>{label}</ChipText>
    </ChipContainer>
  );
};

const ChipContainer = styled.TouchableOpacity<{
  selected: boolean;
  categoryColor: string;
}>`
  flex-direction: row;
  align-items: center;
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ selected, categoryColor }) =>
    selected ? categoryColor : "#F1F3F0"};
  gap: 6px;
  align-self: flex-start;
`;

const CategoryDot = styled.View<{ categoryColor: string }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ categoryColor }) => categoryColor};
`;

const ChipText = styled.Text<{ selected: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
  color: ${({ theme, selected }) =>
    selected ? theme.colors.white : theme.colors.textSecondary};
`;
