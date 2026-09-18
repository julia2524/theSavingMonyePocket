import React from "react";
import styled from "styled-components/native";

interface AppCardProps {
  children: React.ReactNode;
  padding?: number;
}

export const AppCard = ({ children, padding }: AppCardProps) => {
  return <CardContainer customPadding={padding}>{children}</CardContainer>;
};

const CardContainer = styled.View<{ customPadding?: number }>`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme, customPadding }) =>
    customPadding !== undefined ? customPadding : theme.spacing.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};

  /* iOS 그림자 속성 (React Native 전용 처리) */
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-opacity: ${({ theme }) => theme.shadows.card.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.card.shadowRadius}px;

  /* Android 그림자 */
  elevation: ${({ theme }) => theme.shadows.card.elevation};
`;
