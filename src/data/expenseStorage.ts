import AsyncStorage from "@react-native-async-storage/async-storage";

export type ExpenseCategory =
  | "food"
  | "living"
  | "shopping"
  | "transport"
  | "medical"
  | "education"
  | "cafe"
  | "leisure"
  | "beauty"
  | "etc";

export interface Expense {
  id: string;
  storeName: string;
  date: string;
  totalAmount: number;
  category: ExpenseCategory;
  receiptImageUri?: string;
  createdAt: string;
}

const EXPENSE_STORAGE_KEY = "@the-saving-money-pocket/expenses";

export async function getExpenses(): Promise<Expense[]> {
  try {
    const stored = await AsyncStorage.getItem(EXPENSE_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("지출 내역 불러오기 실패:", error);
    return [];
  }
}

// -----------------------------
// 단건 조회 함수 추가
// -----------------------------
export async function getExpenseById(id: string): Promise<Expense | null> {
  try {
    const expenses = await getExpenses();
    const found = expenses.find((item) => item.id === id);
    return found || null;
  } catch (error) {
    console.error("지출 내역 단건 불러오기 실패:", error);
    return null;
  }
}

export async function saveExpense(expense: Expense): Promise<void> {
  try {
    const expenses = await getExpenses();

    const updatedExpenses = [expense, ...expenses];

    await AsyncStorage.setItem(
      EXPENSE_STORAGE_KEY,
      JSON.stringify(updatedExpenses),
    );
  } catch (error) {
    console.error("지출 내역 저장 실패:", error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    const expenses = await getExpenses();

    const updatedExpenses = expenses.filter((expense) => expense.id !== id);

    await AsyncStorage.setItem(
      EXPENSE_STORAGE_KEY,
      JSON.stringify(updatedExpenses),
    );
  } catch (error) {
    console.error("지출 내역 삭제 실패:", error);
    throw error;
  }
}

export async function updateExpense(expense: Expense): Promise<void> {
  try {
    const expenses = await getExpenses();

    const updatedExpenses = expenses.map((item) =>
      item.id === expense.id ? expense : item,
    );

    await AsyncStorage.setItem(
      EXPENSE_STORAGE_KEY,
      JSON.stringify(updatedExpenses),
    );
  } catch (error) {
    console.error("지출 내역 수정 실패:", error);
    throw error;
  }
}
