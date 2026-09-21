import React, { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styled from "styled-components/native";

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

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
  };

  // 홈으로 돌아올 때마다 최신 지출 내역 다시 불러오기
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
          paddingTop: 24,
          paddingBottom: 32,
        }}
        ListHeaderComponent={
          <>
            <GreetingSection>
              <GreetingTitle>오늘도 차곡차곡 💚</GreetingTitle>

              <GreetingText>
                영수증 하나만 찍어두면{`\n`}
                지출 기록이 자동으로 정리돼요.
              </GreetingText>
            </GreetingSection>

            <SummaryCard>
              <SummaryLabel>이번 달 지출</SummaryLabel>

              <AmountText amount={currentMonthTotal} size="large" />

              <SummarySubText>
                {new Date().getMonth() + 1}월 지출 금액이에요.
              </SummarySubText>
            </SummaryCard>

            <ReceiptButtonSection>
              <AppButton
                title="📷 영수증 기록하기"
                onPress={handleAddReceipt}
              />
            </ReceiptButtonSection>

            <SectionHeader>
              <SectionTitle>최근 지출</SectionTitle>

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
            <ExpenseInfo>
              <StoreName>{item.storeName || "상호명 없음"}</StoreName>

              <ExpenseMeta>
                <CategoryChip
                  category={item.category}
                  label={getCategoryLabel(item.category)}
                  selected={false}
                />

                <DateText>{formatDate(item.date)}</DateText>
              </ExpenseMeta>
            </ExpenseInfo>

            <ExpenseAmount>{item.totalAmount.toLocaleString()}원</ExpenseAmount>
          </ExpenseCard>
        )}
        ListEmptyComponent={
          <EmptyCard>
            <EmptyEmoji>🧾</EmptyEmoji>

            <EmptyTitle>아직 기록된 지출이 없어요.</EmptyTitle>

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
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return date;
  }

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

  return labels[category];
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
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  line-height: 24px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const SummaryCard = styled(AppCard)`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SummaryLabel = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const SummarySubText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const ReceiptButtonSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xxxl}px;
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
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const ViewAllButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

const ViewAllText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const ExpenseCard = styled(AppCard)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const ExpenseInfo = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

const StoreName = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const ExpenseMeta = styled.View`
  flex-direction: row;
  align-items: center;
`;

const DateText = styled.Text`
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const ExpenseAmount = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const EmptyCard = styled(AppCard)`
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxxl}px;
`;

const EmptyEmoji = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  font-size: 36px;
`;

const EmptyTitle = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  text-align: center;
  line-height: 21px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;
