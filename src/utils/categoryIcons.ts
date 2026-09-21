import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ExpenseCategory } from "../data/expenseStorage";

// Ionicons의 유효한 name 타입 추출
export type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export interface CategoryIconConfig {
  name: IoniconsName;
  color: string;
}

export const CATEGORY_ICON_MAP: Record<ExpenseCategory, CategoryIconConfig> = {
  food: { name: "restaurant-outline", color: "#FF6B6B" },
  living: { name: "home-outline", color: "#4D96FF" },
  shopping: { name: "bag-handle-outline", color: "#FF9F45" },
  transport: { name: "bus-outline", color: "#6BCB77" },
  medical: { name: "medkit-outline", color: "#FF4A4A" },
  education: { name: "book-outline", color: "#9B51E0" },
  cafe: { name: "cafe-outline", color: "#8D6E63" },
  leisure: { name: "film-outline", color: "#546E7A" },
  beauty: { name: "sparkles-outline", color: "#EC407A" },
  etc: { name: "ellipsis-horizontal-circle-outline", color: "#78909C" },
};

export function getCategoryIconName(category: ExpenseCategory): IoniconsName {
  return CATEGORY_ICON_MAP[category]?.name || "pricetag-outline";
}
