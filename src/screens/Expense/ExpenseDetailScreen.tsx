// import React, { useCallback, useState } from "react";
// import { Alert, ScrollView } from "react-native";
// import {
//   RouteProp,
//   useFocusEffect,
//   useNavigation,
//   useRoute,
// } from "@react-navigation/native";
// import styled, { useTheme } from "styled-components/native";

// import {
//   AppButton,
//   AmountText,
//   CategoryChip,
// } from "../../design-system/components";

// import {
//   Expense,
//   ExpenseCategory,
//   getExpenses,
//   updateExpense,
//   deleteExpense,
// } from "../../data/expenseStorage";

// import { Ionicons } from "@expo/vector-icons";

// import { RootStackParamList } from "../../navigation/types";

// type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

// export default function ExpenseDetailScreen() {
//   const theme = useTheme();
//   const navigation = useNavigation();
//   const route = useRoute<ExpenseDetailRouteProp>();

//   const { expenseId } = route.params;

//   const [expense, setExpense] = useState<Expense | null>(null);

//   const [isEditing, setIsEditing] = useState(false);

//   const [storeName, setStoreName] = useState("");
//   const [date, setDate] = useState("");
//   const [totalAmount, setTotalAmount] = useState("");
//   const [category, setCategory] = useState<ExpenseCategory>("etc");

//   // =========================================================
//   // 지출 불러오기
//   // =========================================================

//   const loadExpense = async () => {
//     const expenses = await getExpenses();

//     const foundExpense = expenses.find((item) => item.id === expenseId);

//     if (!foundExpense) {
//       Alert.alert(
//         "지출 내역을 찾을 수 없어요",
//         "삭제되었거나 존재하지 않는 지출 내역이에요.",
//         [
//           {
//             text: "확인",
//             onPress: () => navigation.goBack(),
//           },
//         ],
//       );

//       return;
//     }

//     setExpense(foundExpense);

//     setStoreName(foundExpense.storeName);
//     setDate(foundExpense.date);
//     setTotalAmount(foundExpense.totalAmount.toLocaleString());
//     setCategory(foundExpense.category);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadExpense();
//     }, [expenseId]),
//   );

//   // =========================================================
//   // 수정 모드
//   // =========================================================

//   const handleStartEdit = () => {
//     if (!expense) return;

//     setStoreName(expense.storeName);
//     setDate(expense.date);
//     setTotalAmount(expense.totalAmount.toLocaleString());
//     setCategory(expense.category);

//     setIsEditing(true);
//   };

//   // =========================================================
//   // 수정 저장
//   // =========================================================

//   const handleSave = async () => {
//     if (!expense) return;

//     const numericAmount = Number(totalAmount.replace(/,/g, ""));

//     if (!storeName.trim()) {
//       Alert.alert("확인해주세요", "상호명을 입력해주세요.");
//       return;
//     }

//     if (!date.trim()) {
//       Alert.alert("확인해주세요", "날짜를 입력해주세요.");
//       return;
//     }

//     if (!numericAmount || numericAmount <= 0) {
//       Alert.alert("확인해주세요", "금액을 입력해주세요.");
//       return;
//     }

//     const updatedExpense: Expense = {
//       ...expense,
//       storeName: storeName.trim(),
//       date: date.trim(),
//       totalAmount: numericAmount,
//       category,
//     };

//     try {
//       await updateExpense(updatedExpense);

//       setExpense(updatedExpense);
//       setTotalAmount(numericAmount.toLocaleString());
//       setIsEditing(false);

//       Alert.alert("저장 완료", "지출 내역이 수정되었어요.");
//     } catch (error) {
//       Alert.alert("저장 실패", "지출 내역을 수정하지 못했어요.");
//     }
//   };

//   // =========================================================
//   // 삭제
//   // =========================================================

//   const handleDelete = () => {
//     if (!expense) return;

//     Alert.alert(
//       "지출 내역을 삭제할까요?",
//       `"${expense.storeName || "상호명 없음"}"의 지출 내역이 삭제돼요.`,
//       [
//         {
//           text: "취소",
//           style: "cancel",
//         },
//         {
//           text: "삭제",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteExpense(expense.id);

//               navigation.goBack();
//             } catch (error) {
//               Alert.alert("삭제 실패", "지출 내역을 삭제하지 못했어요.");
//             }
//           },
//         },
//       ],
//     );
//   };

//   // =========================================================
//   // 로딩
//   // =========================================================

//   if (!expense) {
//     return (
//       <Screen>
//         <LoadingContainer>
//           <Ionicons
//             name="receipt-outline"
//             size={40}
//             color={theme.colors.textTertiary}
//           />
//         </LoadingContainer>
//       </Screen>
//     );
//   }

//   // =========================================================
//   // 화면
//   // =========================================================

//   return (
//     <Screen>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{
//           padding: 20,
//           paddingBottom: 40,
//         }}
//       >
//         {/* ================================================= */}
//         {/* 상단 제목 */}
//         {/* ================================================= */}

//         <Header>
//           <HeaderTitle>
//             {isEditing ? "지출 내역 수정" : "지출 내역"}
//           </HeaderTitle>

//           {!isEditing && (
//             <HeaderSubText>기록된 지출을 확인할 수 있어요.</HeaderSubText>
//           )}
//         </Header>

//         {/* ================================================= */}
//         {/* 금액 카드 */}
//         {/* ================================================= */}

//         <AmountCard>
//           <AmountLabel>지출 금액</AmountLabel>

//           {isEditing ? (
//             <AmountInputContainer>
//               <AmountInput
//                 value={totalAmount}
//                 onChangeText={(text) => {
//                   const onlyNumbers = text.replace(/[^0-9]/g, "");

//                   if (!onlyNumbers) {
//                     setTotalAmount("");
//                     return;
//                   }

//                   setTotalAmount(Number(onlyNumbers).toLocaleString());
//                 }}
//                 keyboardType="number-pad"
//                 placeholder="금액을 입력해주세요"
//                 placeholderTextColor={theme.colors.textTertiary}
//               />

//               <WonText>원</WonText>
//             </AmountInputContainer>
//           ) : (
//             <AmountText
//               amount={expense.totalAmount}
//               size="hero"
//               color={theme.colors.primary}
//             />
//           )}
//         </AmountCard>

//         {/* ================================================= */}
//         {/* 상세 정보 */}
//         {/* ================================================= */}

//         <DetailCard>
//           <SectionTitle>지출 정보</SectionTitle>

//           {/* 상호명 */}

//           <DetailRow>
//             <DetailLabel>상호명</DetailLabel>

//             {isEditing ? (
//               <DetailInput
//                 value={storeName}
//                 onChangeText={setStoreName}
//                 placeholder="상호명을 입력해주세요"
//                 placeholderTextColor={theme.colors.textTertiary}
//               />
//             ) : (
//               <DetailValue numberOfLines={1}>
//                 {expense.storeName || "상호명 없음"}
//               </DetailValue>
//             )}
//           </DetailRow>

//           <Divider />

//           {/* 날짜 */}

//           <DetailRow>
//             <DetailLabel>날짜</DetailLabel>

//             {isEditing ? (
//               <DetailInput
//                 value={date}
//                 onChangeText={setDate}
//                 placeholder="YYYY.MM.DD"
//                 placeholderTextColor={theme.colors.textTertiary}
//               />
//             ) : (
//               <DetailValue>{formatDate(expense.date)}</DetailValue>
//             )}
//           </DetailRow>

//           <Divider />

//           {/* 카테고리 */}

//           <CategoryRow>
//             <DetailLabel>카테고리</DetailLabel>

//             {isEditing ? (
//               <CategoryContainer>
//                 {CATEGORY_OPTIONS.map((item) => (
//                   <CategoryChip
//                     key={item.category}
//                     category={item.category}
//                     label={item.label}
//                     selected={category === item.category}
//                     onPress={() => setCategory(item.category)}
//                   />
//                 ))}
//               </CategoryContainer>
//             ) : (
//               <CategoryChip
//                 category={expense.category}
//                 label={getCategoryLabel(expense.category)}
//                 selected={false}
//               />
//             )}
//           </CategoryRow>
//         </DetailCard>

//         {/* ================================================= */}
//         {/* 수정 / 삭제 버튼 */}
//         {/* ================================================= */}

//         {isEditing ? (
//           <ButtonContainer>
//             <AppButton title="수정 내용 저장" onPress={handleSave} />

//             <CancelButton
//               title="취소"
//               variant="secondary"
//               onPress={() => {
//                 setStoreName(expense.storeName);
//                 setDate(expense.date);
//                 setTotalAmount(expense.totalAmount.toLocaleString());
//                 setCategory(expense.category);

//                 setIsEditing(false);
//               }}
//             />
//           </ButtonContainer>
//         ) : (
//           <ButtonContainer>
//             <AppButton title="지출 내역 수정" onPress={handleStartEdit} />

//             <DeleteButton
//               title="지출 내역 삭제"
//               variant="secondary"
//               onPress={handleDelete}
//             />
//           </ButtonContainer>
//         )}
//       </ScrollView>
//     </Screen>
//   );
// }

// // =========================================================
// // Helpers
// // =========================================================

// function formatDate(date: string) {
//   if (!date) return "";

//   const cleanDate = date.replace(/\./g, "-");

//   const [year, month, day] = cleanDate.split("-").map(Number);

//   if (!year || !month || !day) {
//     return date;
//   }

//   return `${year}년 ${month}월 ${day}일`;
// }

// function getCategoryLabel(category: ExpenseCategory) {
//   const labels: Record<ExpenseCategory, string> = {
//     food: "식비",
//     living: "생활",
//     shopping: "쇼핑",
//     transport: "교통",
//     medical: "의료",
//     education: "교육",
//     cafe: "카페/외식",
//     leisure: "여가",
//     beauty: "미용",
//     etc: "기타",
//   };

//   return labels[category] || "기타";
// }

// // =========================================================
// // Category
// // =========================================================

// const CATEGORY_OPTIONS: {
//   category: ExpenseCategory;
//   label: string;
// }[] = [
//   { category: "food", label: "식비" },
//   { category: "living", label: "생활" },
//   { category: "shopping", label: "쇼핑" },
//   { category: "transport", label: "교통" },
//   { category: "medical", label: "의료" },
//   { category: "education", label: "교육" },
//   { category: "cafe", label: "카페/외식" },
//   { category: "leisure", label: "여가" },
//   { category: "beauty", label: "미용" },
//   { category: "etc", label: "기타" },
// ];

// // =========================================================
// // Styled Components
// // =========================================================

// const Screen = styled.View`
//   flex: 1;
//   background-color: ${({ theme }) => theme.colors.background};
// `;

// const LoadingContainer = styled.View`
//   flex: 1;
//   align-items: center;
//   justify-content: center;
// `;

// const Header = styled.View`
//   margin-bottom: ${({ theme }) => theme.spacing.lg}px;
// `;

// const HeaderTitle = styled.Text`
//   color: ${({ theme }) => theme.colors.textPrimary};
//   font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.bold};
// `;

// const HeaderSubText = styled.Text`
//   margin-top: ${({ theme }) => theme.spacing.xs}px;
//   color: ${({ theme }) => theme.colors.textSecondary};
//   font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.regular};
// `;

// const AmountCard = styled.View`
//   width: 100%;
//   padding: ${({ theme }) => theme.spacing.xl}px;
//   margin-bottom: ${({ theme }) => theme.spacing.lg}px;
//   border-radius: ${({ theme }) => theme.radius.xl}px;
//   background-color: ${({ theme }) => theme.colors.primaryLight};
// `;

// const AmountLabel = styled.Text`
//   margin-bottom: ${({ theme }) => theme.spacing.xs}px;
//   color: ${({ theme }) => theme.colors.primary};
//   font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.medium};
// `;

// const AmountInputContainer = styled.View`
//   flex-direction: row;
//   align-items: center;
// `;

// const AmountInput = styled.TextInput`
//   flex: 1;
//   padding: 0;
//   color: ${({ theme }) => theme.colors.primary};
//   font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.bold};
// `;

// const WonText = styled.Text`
//   margin-left: 6px;
//   color: ${({ theme }) => theme.colors.primary};
//   font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.bold};
// `;

// const DetailCard = styled.View`
//   width: 100%;
//   padding: ${({ theme }) => theme.spacing.xl}px;
//   border-radius: ${({ theme }) => theme.radius.xl}px;
//   background-color: ${({ theme }) => theme.colors.surface};
// `;

// const SectionTitle = styled.Text`
//   margin-bottom: ${({ theme }) => theme.spacing.lg}px;
//   color: ${({ theme }) => theme.colors.textPrimary};
//   font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.bold};
// `;

// const DetailRow = styled.View`
//   min-height: 48px;
//   flex-direction: row;
//   align-items: center;
//   justify-content: space-between;
// `;

// const CategoryRow = styled.View`
//   padding-top: 4px;
// `;

// const DetailLabel = styled.Text`
//   width: 70px;
//   color: ${({ theme }) => theme.colors.textSecondary};
//   font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.medium};
// `;

// const DetailValue = styled.Text`
//   flex: 1;
//   text-align: right;
//   color: ${({ theme }) => theme.colors.textPrimary};
//   font-size: ${({ theme }) => theme.typography.fontSize.md}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
// `;

// const DetailInput = styled.TextInput`
//   flex: 1;
//   min-height: 42px;
//   padding: 8px 12px;
//   border-width: 1px;
//   border-color: ${({ theme }) => theme.colors.border};
//   border-radius: ${({ theme }) => theme.radius.md}px;
//   background-color: ${({ theme }) => theme.colors.background};
//   color: ${({ theme }) => theme.colors.textPrimary};
//   text-align: right;
//   font-size: ${({ theme }) => theme.typography.fontSize.md}px;
//   font-family: ${({ theme }) => theme.typography.fontFamily.regular};
// `;

// const Divider = styled.View`
//   height: 1px;
//   margin: 4px 0;
//   background-color: ${({ theme }) => theme.colors.border};
// `;

// const CategoryContainer = styled.View`
//   flex: 1;
//   flex-direction: row;
//   flex-wrap: wrap;
//   justify-content: flex-end;
//   gap: 8px;
// `;

// const ButtonContainer = styled.View`
//   margin-top: ${({ theme }) => theme.spacing.xl}px;
//   gap: 12px;
// `;

// const CancelButton = styled(AppButton)``;

// const DeleteButton = styled(AppButton)`
//   border-color: ${({ theme }) => theme.colors.expense};
// `;

import React, { useCallback, useState } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity } from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

import {
  AppButton,
  AmountText,
  CategoryChip,
} from "../../design-system/components";

import {
  Expense,
  ExpenseCategory,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../../data/expenseStorage";

import { RootStackParamList } from "../../navigation/types";
import CustomCalendar from "../../design-system/components/CustomCalendar";
import BannerAd from "../../services/BannerAd";

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

export default function ExpenseDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ExpenseDetailRouteProp>();

  const { expenseId } = route.params;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [date, setDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("etc");

  // 캘린더 모달 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 'YYYY.MM.DD' 또는 'YYYY-MM-DD' 형태를 캘린더용 'YYYY-MM-DD'로 변환
  const calendarFormattedDate = date ? date.replace(/\./g, "-") : "";

  // 캘린더에서 날짜 선택 시 호출되는 함수
  const handleSelectDate = (selectedDateStr: string) => {
    const formattedForStorage = selectedDateStr.replace(/-/g, ".");
    setDate(formattedForStorage);
    setIsCalendarOpen(false);
  };

  // =========================================================
  // 지출 불러오기
  // =========================================================

  const loadExpense = async () => {
    const expenses = await getExpenses();
    const foundExpense = expenses.find((item) => item.id === expenseId);

    if (!foundExpense) {
      Alert.alert(
        "지출 내역을 찾을 수 없어요",
        "삭제되었거나 존재하지 않는 지출 내역이에요.",
        [
          {
            text: "확인",
            onPress: () => navigation.goBack(),
          },
        ],
      );
      return;
    }

    setExpense(foundExpense);
    setStoreName(foundExpense.storeName);
    setDate(foundExpense.date);
    setTotalAmount(foundExpense.totalAmount.toLocaleString());
    setCategory(foundExpense.category);
  };

  useFocusEffect(
    useCallback(() => {
      loadExpense();
    }, [expenseId]),
  );

  // =========================================================
  // 수정 모드
  // =========================================================

  const handleStartEdit = () => {
    if (!expense) return;

    setStoreName(expense.storeName);
    setDate(expense.date);
    setTotalAmount(expense.totalAmount.toLocaleString());
    setCategory(expense.category);

    setIsEditing(true);
  };

  // =========================================================
  // 수정 저장
  // =========================================================

  const handleSave = async () => {
    if (!expense) return;

    const numericAmount = Number(totalAmount.replace(/,/g, ""));

    if (!storeName.trim()) {
      Alert.alert("확인해주세요", "상호명을 입력해주세요.");
      return;
    }

    if (!date.trim()) {
      Alert.alert("확인해주세요", "날짜를 입력해주세요.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("확인해주세요", "금액을 입력해주세요.");
      return;
    }

    const updatedExpense: Expense = {
      ...expense,
      storeName: storeName.trim(),
      date: date.trim(),
      totalAmount: numericAmount,
      category,
    };

    try {
      await updateExpense(updatedExpense);
      setExpense(updatedExpense);
      setTotalAmount(numericAmount.toLocaleString());
      setIsEditing(false);

      Alert.alert("저장 완료", "지출 내역이 수정되었어요.");
    } catch (error) {
      Alert.alert("저장 실패", "지출 내역을 수정하지 못했어요.");
    }
  };

  // =========================================================
  // 삭제
  // =========================================================

  const handleDelete = () => {
    if (!expense) return;

    Alert.alert(
      "지출 내역을 삭제할까요?",
      `"${expense.storeName || "상호명 없음"}"의 지출 내역이 삭제돼요.`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert("삭제 실패", "지출 내역을 삭제하지 못했어요.");
            }
          },
        },
      ],
    );
  };

  // =========================================================
  // 로딩
  // =========================================================

  if (!expense) {
    return (
      <Screen>
        <LoadingContainer>
          <Ionicons
            name="receipt-outline"
            size={40}
            color={theme.colors.textTertiary}
          />
        </LoadingContainer>
      </Screen>
    );
  }

  // =========================================================
  // 화면
  // =========================================================

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        {/* 상단 제목 */}
        <Header>
          <HeaderTitle>
            {isEditing ? "지출 내역 수정" : "지출 내역"}
          </HeaderTitle>
          {!isEditing && (
            <HeaderSubText>기록된 지출을 확인할 수 있어요.</HeaderSubText>
          )}
        </Header>

        {/* 금액 카드 */}
        <AmountCard>
          <AmountLabel>지출 금액</AmountLabel>

          {isEditing ? (
            <AmountInputContainer>
              <AmountInput
                value={totalAmount}
                onChangeText={(text) => {
                  const onlyNumbers = text.replace(/[^0-9]/g, "");
                  if (!onlyNumbers) {
                    setTotalAmount("");
                    return;
                  }
                  setTotalAmount(Number(onlyNumbers).toLocaleString());
                }}
                keyboardType="number-pad"
                placeholder="금액을 입력해주세요"
                placeholderTextColor={theme.colors.textTertiary}
              />
              <WonText>원</WonText>
            </AmountInputContainer>
          ) : (
            <AmountText
              amount={expense.totalAmount}
              size="hero"
              color={theme.colors.primary}
            />
          )}
        </AmountCard>

        {/* 상세 정보 */}
        <DetailCard>
          <SectionTitle>지출 정보</SectionTitle>

          {/* 상호명 */}
          <DetailRow>
            <DetailLabel>상호명</DetailLabel>
            {isEditing ? (
              <DetailInput
                value={storeName}
                onChangeText={setStoreName}
                placeholder="상호명을 입력해주세요"
                placeholderTextColor={theme.colors.textTertiary}
              />
            ) : (
              <DetailValue numberOfLines={1}>
                {expense.storeName || "상호명 없음"}
              </DetailValue>
            )}
          </DetailRow>

          <Divider />

          {/* 날짜 */}
          <DetailRow>
            <DetailLabel>날짜</DetailLabel>
            {isEditing ? (
              <DateSelectButton
                onPress={() => setIsCalendarOpen(true)}
                activeOpacity={0.7}
              >
                <DateSelectText hasValue={!!date}>
                  {date || "날짜 선택"}
                </DateSelectText>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.primary}
                />
              </DateSelectButton>
            ) : (
              <DetailValue>{formatDate(expense.date)}</DetailValue>
            )}
          </DetailRow>

          <Divider />

          {/* 카테고리 */}
          <CategoryRow>
            <DetailLabel>카테고리</DetailLabel>

            {isEditing ? (
              <CategoryContainer>
                {CATEGORY_OPTIONS.map((item) => (
                  <CategoryChip
                    key={item.category}
                    category={item.category}
                    label={item.label}
                    selected={category === item.category}
                    onPress={() => setCategory(item.category)}
                  />
                ))}
              </CategoryContainer>
            ) : (
              <CategoryChip
                category={expense.category}
                label={getCategoryLabel(expense.category)}
                selected={false}
              />
            )}
          </CategoryRow>
        </DetailCard>

        {/* 수정 / 삭제 버튼 */}
        {isEditing ? (
          <ButtonContainer>
            <AppButton title="수정 내용 저장" onPress={handleSave} />
            <CancelButton
              title="취소"
              variant="secondary"
              onPress={() => {
                setStoreName(expense.storeName);
                setDate(expense.date);
                setTotalAmount(expense.totalAmount.toLocaleString());
                setCategory(expense.category);
                setIsEditing(false);
              }}
            />
          </ButtonContainer>
        ) : (
          <ButtonContainer>
            <AppButton title="지출 내역 수정" onPress={handleStartEdit} />
            <DeleteButton
              title="지출 내역 삭제"
              variant="secondary"
              onPress={handleDelete}
            />
          </ButtonContainer>
        )}
      </ScrollView>

      {/* ----------------------------- */}
      {/* 캘린더 모달 */}
      {/* ----------------------------- */}
      <Modal
        visible={isCalendarOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <ModalOverlay
          activeOpacity={1}
          onPress={() => setIsCalendarOpen(false)}
        >
          <ModalContent activeOpacity={1}>
            <ModalHeader>
              <ModalTitle>날짜 선택</ModalTitle>
              <TouchableOpacity onPress={() => setIsCalendarOpen(false)}>
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </ModalHeader>

            <CustomCalendar
              selectedDate={calendarFormattedDate}
              onSelectDate={handleSelectDate}
            />
          </ModalContent>
        </ModalOverlay>
      </Modal>
      {/* ----------------------------- */}
      {/* 하단 고정 광고 배너 영역 */}
      {/* ----------------------------- */}
      <BannerContainer>
        <BannerAd />
      </BannerContainer>
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

  if (!year || !month || !day) {
    return date;
  }

  return `${year}년 ${month}월 ${day}일`;
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
// Category Options
// =========================================================

export const CATEGORY_OPTIONS: {
  category: ExpenseCategory;
  label: string;
}[] = [
  { category: "food", label: "식비" },
  { category: "living", label: "생활" },
  { category: "shopping", label: "쇼핑" },
  { category: "transport", label: "교통" },
  { category: "medical", label: "의료" },
  { category: "education", label: "교육" },
  { category: "cafe", label: "카페/외식" },
  { category: "leisure", label: "여가" },
  { category: "beauty", label: "미용" },
  { category: "etc", label: "기타" },
];

// =========================================================
// Styled Components
// =========================================================

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const HeaderSubText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const AmountCard = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.primaryLight};
`;

const AmountLabel = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const AmountInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AmountInput = styled.TextInput`
  flex: 1;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const WonText = styled.Text`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const DetailCard = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const SectionTitle = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const DetailRow = styled.View`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const CategoryRow = styled.View`
  padding-top: 4px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DetailLabel = styled.Text`
  width: 70px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
`;

const DetailValue = styled.Text`
  flex: 1;
  text-align: right;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const DetailInput = styled.TextInput`
  flex: 1;
  min-height: 42px;
  padding: 8px 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const DateSelectButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.background};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  min-width: 140px;
`;

const DateSelectText = styled.Text<{ hasValue?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
  color: ${({ theme, hasValue }) =>
    hasValue ? theme.colors.textPrimary : theme.colors.textTertiary};
  margin-right: 8px;
`;

const Divider = styled.View`
  height: 1px;
  margin: 4px 0;
  background-color: ${({ theme }) => theme.colors.border};
`;

const CategoryContainer = styled.View`
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
`;

const ButtonContainer = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  gap: 12px;
`;

const CancelButton = styled(AppButton)``;

const DeleteButton = styled(AppButton)`
  border-color: ${({ theme }) => theme.colors.expense};
`;

/* 모달 스타일 */
const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalContent = styled.TouchableOpacity`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  padding: 20px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ModalTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const BannerContainer = styled.SafeAreaView`
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const BannerPlaceholderText = styled.Text`
  padding: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;
