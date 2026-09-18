import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { recognizeText } from "expo-ocr-kit";
import { parseReceiptText, ParsedReceipt } from "./parseReceiptText";

export default function OCRTestScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");

  // OCR이 추천한 결과
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);

  // 사용자가 실제로 수정할 값
  const [editableData, setEditableData] = useState<ParsedReceipt | null>(null);

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

      // 사용자가 수정할 수 있도록 별도의 state로 복사
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
    // 숫자와 콤마만 허용
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

  const updateDate = (value: string) => {
    setEditableData((prev) =>
      prev
        ? {
            ...prev,
            possibleDate: value,
          }
        : null,
    );
  };

  // -----------------------------
  // 저장
  // -----------------------------

  const handleSave = () => {
    if (!editableData) return;

    console.log("💾 FINAL EXPENSE DATA:", editableData);

    Alert.alert(
      "저장 완료",
      `${editableData.storeName || "상호명 없음"}\n${editableData.totalAmount?.toLocaleString() || "0"}원`,
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>영수증 등록</Text>

      <Button title="사진 선택하기" onPress={pickImage} />

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      {/* -------------------------------- */}
      {/* 사용자 확인 / 수정 영역 */}
      {/* -------------------------------- */}

      {editableData && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>영수증 정보를 확인해주세요</Text>

          {/* 상호명 */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>상호명</Text>

            <TextInput
              value={editableData.storeName ?? ""}
              onChangeText={updateStoreName}
              placeholder="상호명을 입력해주세요"
              style={styles.input}
              autoCorrect={false}
            />
          </View>

          {/* 금액 */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>금액</Text>

            <TextInput
              value={
                editableData.totalAmount !== null
                  ? editableData.totalAmount.toLocaleString()
                  : ""
              }
              onChangeText={updateAmount}
              placeholder="금액을 입력해주세요"
              keyboardType="number-pad"
              style={styles.input}
            />

            <Text style={styles.unit}>원</Text>
          </View>

          {/* 날짜 */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>날짜</Text>

            <TextInput
              value={editableData.possibleDate ?? ""}
              onChangeText={updateDate}
              placeholder="날짜를 입력해주세요"
              style={styles.input}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <Button title="저장하기" onPress={handleSave} />
        </View>
      )}

      {/* -------------------------------- */}
      {/* 개발 중 디버깅 영역 */}
      {/* -------------------------------- */}

      {parsedData && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🔧 개발자용 파싱 결과</Text>

          <Text>상호명: {parsedData.storeName ?? "null"}</Text>

          <Text>금액: {parsedData.totalAmount ?? "null"}</Text>

          <Text>날짜: {parsedData.possibleDate ?? "null"}</Text>

          <Text>후보 금액: {parsedData.possibleAmounts.join(", ")}</Text>
        </View>
      )}

      {/* Raw OCR */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>📄 Raw OCR 텍스트</Text>

        <Text style={styles.resultText}>
          {rawText || "아직 인식된 내용이 없습니다."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  image: {
    width: "100%",
    height: 250,
    marginTop: 10,
  },

  // -----------------------------
  // Form
  // -----------------------------

  formContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dddddd",
    gap: 18,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  fieldContainer: {
    gap: 8,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 17,
    backgroundColor: "#fafafa",
  },

  unit: {
    position: "absolute",
    right: 14,
    bottom: 15,
    fontSize: 16,
    color: "#666",
  },

  // -----------------------------
  // Debug
  // -----------------------------

  debugContainer: {
    padding: 16,
    backgroundColor: "#fff8e1",
    borderRadius: 12,
    gap: 6,
  },

  debugTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  resultContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
  },

  resultText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#333",
  },
});
