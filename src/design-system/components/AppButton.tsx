// import React, { ReactNode } from "react";
// import styled from "styled-components/native";
// import { ActivityIndicator } from "react-native";

// interface AppButtonProps {
//   title: string;
//   onPress: () => void;
//   variant?: "primary" | "secondary";
//   loading?: boolean;
//   disabled?: boolean;
//   icon?: ReactNode; // 👈 icon 속성 추가 (선택적 프로퍼티)
// }

// export const AppButton = ({
//   title,
//   onPress,
//   variant = "primary",
//   loading = false,
//   disabled = false,
// }: AppButtonProps) => {
//   const isPrimary = variant === "primary";

//   return (
//     <ButtonContainer
//       variant={variant}
//       activeOpacity={0.8}
//       onPress={onPress}
//       disabled={disabled || loading}
//     >
//       {loading ? (
//         <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#176B5B"} />
//       ) : (
//         <ButtonText variant={variant}>{title}</ButtonText>
//       )}
//     </ButtonContainer>
//   );
// };

// const ButtonContainer = styled.TouchableOpacity<{
//   variant: "primary" | "secondary";
// }>`
//   height: 52px;
//   width: 100%;
//   border-radius: ${({ theme }) => theme.radius.md}px;
//   justify-content: center;
//   align-items: center;
//   background-color: ${({ theme, variant }) =>
//     variant === "primary" ? theme.colors.primary : theme.colors.primaryLight};
//   opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
// `;

// const ButtonText = styled.Text<{ variant: "primary" | "secondary" }>`
//   font-size: ${({ theme }) => theme.typography.fontSize.md}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
//   font-weight: 600;
//   color: ${({ theme, variant }) =>
//     variant === "primary" ? theme.colors.white : theme.colors.primary};
// `;

import React, { ReactNode } from "react";
import styled from "styled-components/native";
import { ActivityIndicator } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode; // 선택적 아이콘 prop
}

export const AppButton = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon, // 1. icon을 props에서 꺼내옵니다.
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
        // 2. icon과 title을 함께 렌더링하도록 묶어줍니다.
        <ButtonContent>
          {icon}
          <ButtonText variant={variant}>{title}</ButtonText>
        </ButtonContent>
      )}
    </ButtonContainer>
  );
};

/* --------------------------------
   Styled Components
-------------------------------- */

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

/* 아이콘과 텍스트를 가로로 배치하는 컨테이너 */
const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px; /* 아이콘과 텍스트 사이의 여백 */
`;

const ButtonText = styled.Text<{ variant: "primary" | "secondary" }>`
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  font-weight: 600;
  color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.white : theme.colors.primary};
`;
