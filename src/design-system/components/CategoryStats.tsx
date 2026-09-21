import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components/native";
import { Expense, ExpenseCategory } from "../../data/expenseStorage";
import { AppCard } from "./AppCard";
import { AmountText } from "./AmountText";
import { Ionicons } from "@expo/vector-icons";

interface CategoryStatsProps {
  expenses: Expense[];
}

interface CategoryTotal {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
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

export default function CategoryStats({ expenses }: CategoryStatsProps) {
  const theme = useTheme();

  const categoryStats = useMemo<CategoryTotal[]>(() => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 1. 이번 달 지출만 가져오기
    const currentMonthExpenses = expenses.filter((expense) => {
      const [year, month] = expense.date.split(".").map(Number);

      return year === currentYear && month === currentMonth;
    });

    // 2. 카테고리별 금액 합계
    const totals: Partial<Record<ExpenseCategory, number>> = {};

    currentMonthExpenses.forEach((expense) => {
      totals[expense.category] =
        (totals[expense.category] ?? 0) + expense.totalAmount;
    });

    // 3. 이번 달 총 지출
    const totalAmount = Object.values(totals).reduce(
      (sum, amount) => sum + (amount ?? 0),
      0,
    );

    if (totalAmount === 0) {
      return [];
    }

    // 4. 카테고리별 비율 계산
    return Object.entries(totals)
      .map(([category, amount]) => {
        const categoryAmount = amount ?? 0;
        return {
          category: category as ExpenseCategory,
          amount: categoryAmount,
          percentage: Math.round((categoryAmount / totalAmount) * 100),
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4); // 홈 화면에는 상위 4개만 깔끔하게 표시
  }, [expenses]);

  if (categoryStats.length === 0) {
    return null;
  }

  return (
    <Container>
      <SectionTitleContainer>
        <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
        <SectionTitle>이번 달 카테고리별 지출</SectionTitle>
      </SectionTitleContainer>
      <AppCard>
        <StatsContainer>
          {categoryStats.map((item) => (
            <CategoryRow key={item.category}>
              <TopRow>
                <CategoryName>{CATEGORY_LABELS[item.category]}</CategoryName>

                <AmountText amount={item.amount} size="medium" />
              </TopRow>

              <BottomRow>
                <BarTrack>
                  <BarFill width={`${item.percentage}%`} />
                </BarTrack>

                <Percentage>{item.percentage}%</Percentage>
              </BottomRow>
            </CategoryRow>
          ))}
        </StatsContainer>
      </AppCard>
    </Container>
  );
}

const Container = styled.View`
  margin-bottom: 20px;
`;
// Styled Components
const SectionTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const StatsContainer = styled.View`
  gap: 20px;
`;

const CategoryRow = styled.View``;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoryName = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #202522;
`;

const BottomRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const BarTrack = styled.View`
  flex: 1;
  height: 8px;
  background-color: #f1f3f0;
  border-radius: 999px;
  overflow: hidden;
`;

const BarFill = styled.View<{ width: string }>`
  width: ${(props) => props.width};
  height: 100%;
  background-color: #176b5b;
  border-radius: 999px;
`;

const Percentage = styled.Text`
  width: 36px;
  text-align: right;
  font-size: 13px;
  color: #68716c;
`;
