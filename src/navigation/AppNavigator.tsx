import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "styled-components/native";
import { Text } from "react-native";

import { MainTabParamList, RootStackParamList } from "./types";
import HomeScreen from "../screens/Home/HomeScreen";
// 🚨 경로 오타 수정됨! (ExpenseStoarage.ts -> expenseStorage 혹은 실제 위치)
import ReceiptConfirmScreen from "../screens/ReceiptConfirm/ReceiptConfirmScreen";
import ExpenseListScreen from "../screens/ExpenseStoarage/ExpenseListScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const theme = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "홈",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.bold,
            color: theme.colors.textPrimary,
          },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />

      <MainTab.Screen
        name="ExpenseList"
        component={ExpenseListScreen}
        options={{
          title: "지출 내역",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.bold,
            color: theme.colors.textPrimary,
          },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📋</Text>,
        }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />

      <RootStack.Screen
        name="ReceiptConfirm"
        component={ReceiptConfirmScreen}
        options={{
          title: "영수증 확인",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.bold,
            color: theme.colors.textPrimary,
          },
        }}
      />
    </RootStack.Navigator>
  );
}
