import React, { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styled, { useTheme } from "styled-components/native";

import {
  AppButton,
  AppCard,
  AmountText,
  CategoryChip,
} from "../../design-system/components";

import {
  Expense,
  ExpenseCategory,
  getExpenses,
} from "../../data/expenseStorage";
import { RootStackParamList } from "../../navigation/types";
import CategoryStats from "../../design-system/components/CategoryStats";
import { Ionicons } from "@expo/vector-icons";

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const theme = useTheme();

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, []),
  );

  // 이번 달 지출
  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return expenses
      .filter((expense) => {
        if (!expense.date) return false;
        const [year, month] = expense.date.split("-").map(Number);
        return year === currentYear && month === currentMonth;
      })
      .reduce((total, expense) => total + expense.totalAmount, 0);
  }, [expenses]);

  // 최근 지출 3개
  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 3);
  }, [expenses]);

  const handleAddReceipt = () => {
    navigation.navigate("ReceiptConfirm");
  };

  const handleViewAll = () => {
    navigation.navigate("MainTabs", {
      screen: "ExpenseList",
    });
  };

  return (
    <Screen>
      <FlatList
        data={recentExpenses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        // 카드 간격 보장 (찌그러짐 방지)
        ItemSeparatorComponent={() => <CardGap />}
        ListHeaderComponent={
          <>
            <GreetingSection>
              <GreetingTitle>오늘도 차곡차곡 💚</GreetingTitle>
              <GreetingText>
                영수증 하나만 찍어두면{`\n`}지출 기록이 자동으로 정리돼요.
              </GreetingText>
            </GreetingSection>

            {/* 강조형 하이라이트 지출 카드 */}
            <HighlightCard>
              <SummaryLabel>이번 달 총 지출</SummaryLabel>
              <AmountText
                amount={currentMonthTotal}
                size="hero"
                color={theme.colors.primary}
              />
              <SummarySubText>
                {new Date().getMonth() + 1}월 지출 금액이에요
              </SummarySubText>
            </HighlightCard>

            <ReceiptButtonSection>
              <AppButton
                title="영수증 촬영/기록하기"
                icon={
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                }
                onPress={handleAddReceipt}
              />
            </ReceiptButtonSection>

            {/* 카테고리별 통계 컴포넌트 */}
            <CategoryStats expenses={expenses} />

            <SectionHeader>
              <SectionTitle>최근 지출 내역</SectionTitle>
              {expenses.length > 0 && (
                <ViewAllButton onPress={handleViewAll}>
                  <ViewAllText>전체 보기 →</ViewAllText>
                </ViewAllButton>
              )}
            </SectionHeader>
          </>
        }
        renderItem={({ item }) => (
          <ExpenseCard>
            <ExpenseMainContainer>
              {/* 상단: 카테고리 칩 + 날짜 */}
              <ExpenseHeaderRow>
                <CategoryChip
                  category={item.category}
                  label={getCategoryLabel(item.category)}
                  selected={false}
                />
                <DateText>{formatDate(item.date)}</DateText>
              </ExpenseHeaderRow>

              {/* 하단: 상호명(왼쪽) + 금액(오른쪽) */}
              <ExpenseBodyRow>
                <StoreName numberOfLines={1}>
                  {item.storeName || "상호명 없음"}
                </StoreName>
                <ExpenseAmount>
                  {item.totalAmount.toLocaleString()}원
                </ExpenseAmount>
              </ExpenseBodyRow>
            </ExpenseMainContainer>
          </ExpenseCard>
        )}
        ListEmptyComponent={
          <EmptyCard>
            <EmptyIconContainer>
              <Ionicons
                name="receipt-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
            </EmptyIconContainer>
            <EmptyTitle>아직 기록된 지출이 없어요</EmptyTitle>
            <EmptyText>영수증을 찍어서 첫 번째 지출을 기록해보세요.</EmptyText>
          </EmptyCard>
        }
      />
    </Screen>
  );
}

/* --------------------------------
   Helpers
-------------------------------- */

function formatDate(date: string) {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return `${month}월 ${day}일`;
}

function getCategoryLabel(category: ExpenseCategory) {
  const labels: Record<ExpenseCategory, string> = {
    food: "식비",
    living: "생활",
    shopping: "쇼핑",
    transport: "교통",
    medical: "의료",
    education: "교육",
    cafe: "카페/외식",
    leisure: "여가",
    beauty: "미용",
    etc: "기타",
  };
  return labels[category] || "기타";
}

/* --------------------------------
   Styled Components
-------------------------------- */

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const GreetingSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const GreetingTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const GreetingText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  line-height: 22px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const HighlightCard = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;

  /* iOS 그림자 */
  shadow-color: ${({ theme }) => theme.colors.primary};
  shadow-opacity: 0.15;
  shadow-radius: 10px;
  elevation: 3;
`;

const SummaryLabel = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const SummarySubText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const ReceiptButtonSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const ViewAllButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

const ViewAllText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

/* 카드 사이의 여백 전용 컴포넌트 */
const CardGap = styled.View`
  height: 12px;
`;

const ExpenseCard = styled(AppCard)`
  width: 100%;
  padding: 16px;
  margin-bottom: 0px; /* ItemSeparatorComponent를 쓰므로 margin-bottom을 제거 */
`;

const ExpenseMainContainer = styled.View`
  width: 100%;
`;

const ExpenseHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ExpenseBodyRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StoreName = styled.Text`
  flex: 1;
  margin-right: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const DateText = styled.Text`
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const ExpenseAmount = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const EmptyCard = styled(AppCard)`
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxxl}px;
`;

const EmptyEmoji = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  font-size: 40px;
`;

const EmptyTitle = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  text-align: center;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const EmptyIconContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  justify-content: center;
`;
