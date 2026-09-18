import React from "react";
import styled, { useTheme } from "styled-components/native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// 한국어 로케일 설정
LocaleConfig.locales["ko"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
};
LocaleConfig.defaultLocale = "ko";

interface CustomCalendarProps {
  selectedDate: string; // YYYY-MM-DD 형식
  onSelectDate: (dateString: string) => void;
  minDate?: string;
}

// YYYY-MM-DD 유효성 검사 함수
const isValidDateFormat = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
};

export default function CustomCalendar({
  selectedDate,
  onSelectDate,
  minDate,
}: CustomCalendarProps) {
  const theme = useTheme();

  // 날짜 유효성 검증
  const validSelectedDate = isValidDateFormat(selectedDate)
    ? selectedDate
    : undefined;
  const validMinDate = isValidDateFormat(minDate) ? minDate : undefined;

  return (
    <CalendarContainer>
      <Calendar
        // 유효하지 않은 값으로 인한 crash 방지를 위해 key 지정
        key={validSelectedDate || "default-calendar"}
        current={validSelectedDate}
        minDate={validMinDate}
        onDayPress={(day) => onSelectDate(day.dateString)}
        markedDates={
          validSelectedDate
            ? {
                [validSelectedDate]: {
                  selected: true,
                  disableTouchEvent: true,
                },
              }
            : {}
        }
        theme={
          {
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,

            monthTextColor: theme.colors.textPrimary,
            textMonthFontFamily: theme.typography.fontFamily.bold,
            textMonthFontSize: theme.typography.fontSize.lg,

            textSectionTitleColor: theme.colors.textSecondary,
            textDayHeaderFontFamily: theme.typography.fontFamily.medium,
            textDayHeaderFontSize: theme.typography.fontSize.sm,

            dayTextColor: theme.colors.textPrimary,
            textDayFontFamily: theme.typography.fontFamily.medium,
            textDayFontSize: theme.typography.fontSize.md,

            todayTextColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.white,

            textDisabledColor: theme.colors.border,
            arrowColor: theme.colors.primary,

            "stylesheet.day.basic": {
              base: {
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              },
              selected: {
                backgroundColor: theme.colors.primary,
                borderRadius: 18,
              },
              text: {
                marginTop: 0,
                marginBottom: 0,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.medium,
                color: theme.colors.textPrimary,
                textAlign: "center",
              },
            },
          } as any
        }
      />
    </CalendarContainer>
  );
}

/* -----------------------------
   Styled Components
----------------------------- */

const CalendarContainer = styled.View`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 8px;

  shadow-color: ${({ theme }) => theme.colors.primary};
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 3;
`;
