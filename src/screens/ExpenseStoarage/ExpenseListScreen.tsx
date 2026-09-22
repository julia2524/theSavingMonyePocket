import React, { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import styled, { useTheme } from "styled-components/native";

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
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export default function ExpenseListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>(); // 👈 타입 연결
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
        if (!expense.date) return false;
        // '.'과 '-' 구분자 모두 대응
        const [expenseYear, expenseMonth] = expense.date
          .replace(/\./g, "-")
          .split("-")
          .map(Number);

        return expenseYear === year && expenseMonth === month;
      })
      .reduce((total, expense) => total + expense.totalAmount, 0);
  }, [expenses]);

  // -----------------------------
  // 날짜별 그룹화
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
      <FlatList
        data={groupedExpenses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        // 카드 간격 보장 (찌그러짐 방지)
        ItemSeparatorComponent={() => <CardGap />}
        ListHeaderComponent={
          <>
            <Header>
              <HeaderTitle>지출 기록</HeaderTitle>
            </Header>

            {/* HomeScreen과 통일된 하이라이트 카드 */}
            <HighlightCard>
              <SummaryLabel>이번 달 지출 총액</SummaryLabel>
              <AmountText
                amount={currentMonthTotal}
                size="hero"
                color={theme.colors.primary}
              />
              <SummarySubText>
                {new Date().getMonth() + 1}월에 사용한 금액이에요
              </SummarySubText>
            </HighlightCard>
          </>
        }
        renderItem={({ item }) => {
          if (item.type === "date") {
            return <DateHeader>{formatDate(item.date)}</DateHeader>;
          }

          return (
            <ExpenseCardPressable
              onPress={() =>
                navigation.navigate("ExpenseDetail", {
                  expenseId: item.expense.id,
                })
              }
            >
              <ExpenseCard>
                <ExpenseMainContainer>
                  {/* 상단: 카테고리 칩 + 날짜 */}
                  <ExpenseHeaderRow>
                    <CategoryChip
                      category={item.expense.category}
                      label={getCategoryLabel(item.expense.category)}
                      selected={false}
                    />
                    <DateText>{formatDate(item.expense.date)}</DateText>
                  </ExpenseHeaderRow>

                  {/* 하단: 상호명(왼쪽) + 금액(오른쪽) */}
                  <ExpenseBodyRow>
                    <StoreName numberOfLines={1}>
                      {item.expense.storeName || "상호명 없음"}
                    </StoreName>
                    <ExpenseAmount>
                      {item.expense.totalAmount.toLocaleString()}원
                    </ExpenseAmount>
                  </ExpenseBodyRow>
                </ExpenseMainContainer>
              </ExpenseCard>
            </ExpenseCardPressable>
          );
        }}
        ListEmptyComponent={
          <EmptyCard>
            <EmptyIconContainer>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
            </EmptyIconContainer>
            <EmptyTitle>아직 기록된 지출이 없어요</EmptyTitle>
            <EmptyDescription>
              영수증을 등록하면{"\n"}여기에 지출 기록이 쌓여요.
            </EmptyDescription>
          </EmptyCard>
        }
      />
    </Screen>
  );
}

// =========================================================
// Helpers
// =========================================================

function formatDate(date: string) {
  if (!date) return "";
  const cleanDate = date.replace(/\./g, "-");
  const [year, month, day] = cleanDate.split("-").map(Number);
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

// =========================================================
// Styled Components
// =========================================================

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const HighlightCard = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;

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

/* 날짜 구분을 표시하는 헤더 */
const DateHeader = styled.Text`
  margin-top: 12px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

/* 카드 사이의 여백 전용 컴포넌트 */
const CardGap = styled.View`
  height: 12px;
`;

const ExpenseCard = styled(AppCard)`
  width: 100%;
  padding: 16px;
  margin-bottom: 0px; /* ItemSeparatorComponent 사용으로 margin 제거 */
`;
const ExpenseCardPressable = styled.Pressable`
  width: 100%;
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
  margin-top: 20px;
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

const EmptyDescription = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  line-height: 22px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const EmptyIconContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  justify-content: center;
`;
