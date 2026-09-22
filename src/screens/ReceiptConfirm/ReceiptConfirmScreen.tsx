import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { recognizeText } from "expo-ocr-kit";
import styled from "styled-components/native";

import { ParsedReceipt, parseReceiptText } from "../../../parseReceiptText";
import {
  CategoryChip,
  AppButton,
  AppCard,
  AppInput,
  AmountText,
} from "../../design-system/components";
import CustomCalendar from "../../design-system/components/CustomCalendar";
import { ExpenseCategory, saveExpense } from "../../data/expenseStorage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { CATEGORY_OPTIONS } from "../Expense/ExpenseDetailScreen";

export default function ReceiptConfirmScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [imageUri, setImageUri] = useState<string | null>(null);

  // 개발 중 OCR 원본 확인용
  const [rawText, setRawText] = useState("");

  // OCR이 추천한 결과
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);

  // 사용자가 실제로 수정할 값
  const [editableData, setEditableData] = useState<ParsedReceipt | null>(null);

  // 카테고리 (기본값: food)
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory>("food");

  // -----------------------------
  // 📅 달력 모달 상태
  // -----------------------------
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<string>("");

  const todayString = new Date().toISOString().split("T")[0];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;

    setImageUri(uri);
    setRawText("");
    setParsedData(null);
    setEditableData(null);

    try {
      const ocrResult = await recognizeText(uri);

      console.log("OCR RAW RESULT:", ocrResult.text);

      setRawText(ocrResult.text);

      // OCR → Parser
      const parsed = parseReceiptText(ocrResult.text);

      console.log("PARSED RESULT:", parsed);

      setParsedData(parsed);

      // 사용자가 수정할 수 있도록 복사
      setEditableData({
        ...parsed,
        possibleAmounts: [...parsed.possibleAmounts],
      });
    } catch (error) {
      console.error("OCR ERROR:", error);

      Alert.alert("OCR 오류", "사진에서 글자를 인식하지 못했어.");
    }
  };

  // -----------------------------
  // 수정값 변경
  // -----------------------------

  const updateStoreName = (value: string) => {
    setEditableData((prev) =>
      prev
        ? {
            ...prev,
            storeName: value,
          }
        : null,
    );
  };

  const updateAmount = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");

    setEditableData((prev) =>
      prev
        ? {
            ...prev,
            totalAmount: cleaned ? Number(cleaned) : null,
          }
        : null,
    );
  };

  //   const updateDate = (value: string) => {
  //     setEditableData((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             possibleDate: value,
  //           }
  //         : null,
  //     );
  //   };
  // -----------------------------
  // 📅 달력 모달 이벤트
  // -----------------------------
  const handleOpenCalendar = () => {
    // 인식된 날짜가 있으면 그 날짜로 달력 시작, 없으면 오늘 날짜
    const currentDate = editableData?.possibleDate || todayString;
    setTempSelectedDate(currentDate);
    setPickerVisible(true);
  };

  const handleSelectDate = (date: string) => {
    setTempSelectedDate(date);
  };

  const handleConfirmDate = () => {
    if (!tempSelectedDate) return;

    setEditableData((prev) =>
      prev ? { ...prev, possibleDate: tempSelectedDate } : null,
    );
    setPickerVisible(false);
  };

  const handleCancelDate = () => {
    setPickerVisible(false);
  };

  // YYYY-MM-DD -> YYYY년 M월 D일 표기 변환
  const formatDateLabel = (dateString: string | null) => {
    if (!dateString) return "날짜를 선택해주세요";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일`;
    }
    return dateString;
  };
  // -----------------------------
  // 저장
  // -----------------------------

  const handleSave = async () => {
    if (!editableData) return;

    if (!editableData.totalAmount) {
      Alert.alert("금액을 확인해주세요");
      return;
    }

    const expense = {
      id: `expense_${Date.now()}`,
      storeName: editableData.storeName ?? "상호명 없음",

      // 날짜가 없으면 오늘 날짜 사용
      date: editableData.possibleDate || new Date().toISOString().split("T")[0],

      totalAmount: editableData.totalAmount,

      category: selectedCategory,

      receiptImageUri: imageUri ?? undefined,

      createdAt: new Date().toISOString(),
    };

    try {
      await saveExpense(expense);

      Alert.alert("저장 완료", "지출 내역이 기록되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            navigation.navigate("MainTabs", {
              screen: "ExpenseList",
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert("저장 실패", "지출 내역을 저장하지 못했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Screen>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Header>
            <HeaderTitle>영수증 등록</HeaderTitle>
          </Header>

          {/* Receipt Image */}
          <Section>
            <SectionTitle>영수증 사진</SectionTitle>

            {imageUri ? (
              <ReceiptImageCard>
                <ReceiptImage source={{ uri: imageUri }} resizeMode="contain" />

                <ChangePhotoButton onPress={pickImage}>
                  <ChangePhotoText>다른 사진 선택</ChangePhotoText>
                </ChangePhotoButton>
              </ReceiptImageCard>
            ) : (
              <EmptyReceiptCard onPress={pickImage}>
                <ReceiptIcon>▧</ReceiptIcon>

                <EmptyTitle>영수증 사진을 선택해주세요</EmptyTitle>

                <EmptyDescription>
                  사진을 선택하면 자동으로 정보를 읽어드려요.
                </EmptyDescription>
              </EmptyReceiptCard>
            )}
          </Section>

          {/* OCR Result Form */}
          {editableData && (
            <Section>
              <SectionTitle>영수증 정보를 확인해주세요</SectionTitle>

              {/* AppCard 적용 */}
              <AppCard>
                <FormContainer>
                  {/* 카테고리 - CategoryChip 적용 */}
                  <Field>
                    <Label>카테고리</Label>
                    <CategoryList>
                      {CATEGORY_OPTIONS.map((item) => (
                        <CategoryChip
                          key={item.category}
                          category={item.category}
                          label={item.label}
                          selected={selectedCategory === item.category}
                          onPress={() => setSelectedCategory(item.category)}
                        />
                      ))}
                    </CategoryList>
                  </Field>
                  {/* 날짜 - AppInput 적용 */}
                  {/* 📅 날짜 선택 - CustomCalendar 커스텀 버튼 */}
                  <Field>
                    <Label>날짜</Label>
                    <DateSelectButton
                      activeOpacity={0.7}
                      onPress={handleOpenCalendar}
                    >
                      <DateSelectText hasValue={!!editableData.possibleDate}>
                        {formatDateLabel(editableData.possibleDate)}
                      </DateSelectText>
                      <ArrowIcon>›</ArrowIcon>
                    </DateSelectButton>
                  </Field>
                  {/* 상호명 - AppInput 적용 */}
                  <AppInput
                    label="상호명"
                    value={editableData.storeName ?? ""}
                    onChangeText={updateStoreName}
                    placeholder="상호명을 입력해주세요"
                    autoCorrect={false}
                  />

                  {/* 금액 - AppInput 적용 */}
                  <AppInput
                    label="금액"
                    value={
                      editableData.totalAmount !== null
                        ? editableData.totalAmount.toLocaleString()
                        : ""
                    }
                    onChangeText={updateAmount}
                    placeholder="금액을 입력해주세요"
                    keyboardType="number-pad"
                  />

                  {/* 금액 미리보기 (AmountText 컴포넌트 활용) */}
                  {editableData.totalAmount !== null && (
                    <AmountPreviewWrapper>
                      <AmountText
                        amount={editableData.totalAmount}
                        size="medium"
                        color="#176B5B"
                      />
                    </AmountPreviewWrapper>
                  )}
                </FormContainer>
              </AppCard>

              {/* 저장 버튼 - AppButton 적용 */}
              <ButtonWrapper>
                <AppButton title="기록하기" onPress={handleSave} />
              </ButtonWrapper>
            </Section>
          )}

          {/* 사진 선택 전 */}
          {!editableData && (
            <GuideText>
              영수증 사진을 선택하면
              {"\n"}
              인식된 정보를 확인하고 수정할 수 있어요.
            </GuideText>
          )}

          {/* 개발 중 디버깅 */}
          {__DEV__ && parsedData && (
            <DebugSection>
              <DebugTitle>🔧 개발자용 파싱 결과</DebugTitle>

              <DebugText>상호명: {parsedData.storeName ?? "null"}</DebugText>

              <DebugText>금액: {parsedData.totalAmount ?? "null"}</DebugText>

              <DebugText>날짜: {parsedData.possibleDate ?? "null"}</DebugText>

              <DebugText>
                후보 금액: {parsedData.possibleAmounts.join(", ")}
              </DebugText>

              <DebugText>
                {"\n"}
                Raw OCR
                {"\n"}
                {rawText || "없음"}
              </DebugText>
            </DebugSection>
          )}
        </ScrollView>
        {/* ---------------------------------- */}
        {/* 📅 CustomCalendar 모달 */}
        {/* ---------------------------------- */}
        <Modal
          visible={isPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCancelDate}
        >
          <ModalOverlay>
            <CalendarModalCard>
              <CalendarTitle>날짜를 선택해주세요</CalendarTitle>

              <CalendarWrapper>
                <CustomCalendar
                  selectedDate={tempSelectedDate}
                  onSelectDate={handleSelectDate}
                />
              </CalendarWrapper>

              <ModalButtons>
                <ModalCancelButton onPress={handleCancelDate}>
                  <ModalCancelButtonText>취소</ModalCancelButtonText>
                </ModalCancelButton>

                <ModalConfirmButton onPress={handleConfirmDate}>
                  <ModalConfirmButtonText>선택하기</ModalConfirmButtonText>
                </ModalConfirmButton>
              </ModalButtons>
            </CalendarModalCard>
          </ModalOverlay>
        </Modal>
      </Screen>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   Layout & Styled Components
========================================================= */

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  padding: 20px;
  padding-top: 24px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const Section = styled.View`
  padding: 0 20px;
  margin-bottom: 28px;
`;

const SectionTitle = styled.Text`
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const ReceiptImageCard = styled.View`
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ReceiptImage = styled.Image`
  width: 100%;
  height: 280px;
`;

const ChangePhotoButton = styled.TouchableOpacity`
  height: 44px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceSoft};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const ChangePhotoText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const EmptyReceiptCard = styled.TouchableOpacity`
  min-height: 220px;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ReceiptIcon = styled.Text`
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 40px;
`;

const EmptyTitle = styled.Text`
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const EmptyDescription = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const FormContainer = styled.View`
  gap: 16px;
`;

const AmountPreviewWrapper = styled.View`
  align-items: flex-end;
  margin-top: -8px;
`;

const Field = styled.View`
  gap: 8px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const CategoryList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const ButtonWrapper = styled.View`
  margin-top: 16px;
`;

const GuideText = styled.Text`
  padding: 8px 20px 40px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  line-height: 22px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const DebugSection = styled.View`
  margin: 0 20px 32px;
  padding: 16px;
  background-color: #fff8e1;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const DebugTitle = styled.Text`
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
`;

const DebugText = styled.Text`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
  line-height: 18px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

/* -----------------------------
   Calendar Modal Style
----------------------------- */

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const CalendarModalCard = styled.View`
  width: 100%;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};

  /* iOS & Android 안전 그림자 */
  shadow-color: #000000;
  shadow-opacity: 0.15;
  shadow-radius: 16px;
  elevation: 8;
`;

const CalendarTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
  margin-bottom: 16px;
`;

const CalendarWrapper = styled.View`
  width: 100%;
`;

const ModalButtons = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 16px;
`;

const ModalCancelButton = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceSoft};
  align-items: center;
  justify-content: center;
`;

const ModalCancelButtonText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ModalConfirmButton = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const ModalConfirmButtonText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  color: ${({ theme }) => theme.colors.white};
`;
const DateSelectButton = styled.TouchableOpacity`
  height: 48px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DateSelectText = styled.Text<{ hasValue: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  color: ${({ theme, hasValue }) =>
    hasValue ? theme.colors.textPrimary : theme.colors.textTertiary};
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const ArrowIcon = styled.Text`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;
