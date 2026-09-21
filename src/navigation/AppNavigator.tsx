import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList, RootStackParamList } from "./types";
import HomeScreen from "../screens/Home/HomeScreen";
import ExpenseListScreen from "../screens/ExpenseStoarage.ts/ExpenseListScreen";
import ReceiptConfirmScreen from "../screens/ReceiptConfirm/ReceiptConfirmScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <MainTab.Navigator>
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "홈",
        }}
      />

      <MainTab.Screen
        name="ExpenseList"
        component={ExpenseListScreen}
        options={{
          title: "지출 기록",
        }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
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
        }}
      />
    </RootStack.Navigator>
  );
}
