import React, { useCallback, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import styled from "styled-components/native";

import {
  AppCard,
  AmountText,
  CategoryChip,
} from "../../design-system/components";

import {
  Expense,
  ExpenseCategory,
  getExpenses,
} from "../../data/expenseStorage";

export default function ExpenseListScreen() {
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

  // -----------------------------
  // 이번 달 지출
  // -----------------------------

  const currentMonthTotal = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return expenses
      .filter((expense) => {
        const [expenseYear, expenseMonth] = expense.date.split("-").map(Number);

        return expenseYear === year && expenseMonth === month;
      })
      .reduce((total, expense) => total + expense.totalAmount, 0);
  }, [expenses]);

  // -----------------------------
  // 날짜별 그룹
  // -----------------------------

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};

    expenses.forEach((expense) => {
      if (!groups[expense.date]) {
        groups[expense.date] = [];
      }

      groups[expense.date].push(expense);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .flatMap(([date, items]) => [
        {
          type: "date" as const,
          id: `date-${date}`,
          date,
        },
        ...items.map((expense) => ({
          type: "expense" as const,
          id: expense.id,
          expense,
        })),
      ]);
  }, [expenses]);

  return (
    <Screen>
      <Header>
        <HeaderTitle>지출 기록</HeaderTitle>
      </Header>

      <SummaryCard>
        <SummaryLabel>이번 달 지출</SummaryLabel>

        <AmountText amount={currentMonthTotal} size="large" color="#176B5B" />
      </SummaryCard>

      {expenses.length === 0 ? (
        <EmptyContainer>
          <EmptyIcon>🧾</EmptyIcon>

          <EmptyTitle>아직 기록된 지출이 없어요</EmptyTitle>

          <EmptyDescription>
            영수증을 등록하면{"\n"}
            여기에 지출 기록이 쌓여요.
          </EmptyDescription>
        </EmptyContainer>
      ) : (
        <FlatList
          data={groupedExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === "date") {
              return <DateHeader>{formatDate(item.date)}</DateHeader>;
            }

            return (
              <ExpenseCard>
                <ExpenseInfo>
                  <StoreName>{item.expense.storeName}</StoreName>

                  <CategoryChip
                    category={item.expense.category}
                    label={getCategoryLabel(item.expense.category)}
                    selected={false}
                    onPress={() => {}}
                  />
                </ExpenseInfo>

                <AmountText
                  amount={item.expense.totalAmount}
                  size="medium"
                  color="#202522"
                />
              </ExpenseCard>
            );
          }}
        />
      )}
    </Screen>
  );
}

// =========================================================
// Helpers
// =========================================================

function formatDate(date: string) {
  if (!date) return "날짜 없음";

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${Number(parts[1])}월 ${Number(parts[2])}일`;
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

// =========================================================
// Styled Components
// =========================================================

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  padding: 24px 20px 16px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};

  font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;

  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const SummaryCard = styled(AppCard)`
  margin: 0 20px 24px;
`;

const SummaryLabel = styled.Text`
  margin-bottom: 8px;

  color: ${({ theme }) => theme.colors.textSecondary};

  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;

  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const DateHeader = styled.Text`
  margin-top: 12px;
  margin-bottom: 10px;

  color: ${({ theme }) => theme.colors.textSecondary};

  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;

  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const ExpenseCard = styled(AppCard)`
  margin-bottom: 10px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ExpenseInfo = styled.View`
  flex: 1;
  gap: 8px;
`;

const StoreName = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};

  font-size: ${({ theme }) => theme.typography.fontSize.md}px;

  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const EmptyContainer = styled.View`
  flex: 1;

  align-items: center;
  justify-content: center;

  padding: 40px 20px;
`;

const EmptyIcon = styled.Text`
  margin-bottom: 16px;
  font-size: 48px;
`;

const EmptyTitle = styled.Text`
  margin-bottom: 8px;

  color: ${({ theme }) => theme.colors.textPrimary};

  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;

  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const EmptyDescription = styled.Text`
  text-align: center;

  color: ${({ theme }) => theme.colors.textSecondary};

  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;

  line-height: 22px;

  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;
