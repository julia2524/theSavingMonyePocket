import "styled-components/native";
import { AppTheme } from "../design-system/theme/theme";

// styled-components의 DefaultTheme 인터페이스를 우리의 AppTheme으로 확장
declare module "styled-components/native" {
  export interface DefaultTheme extends AppTheme {}
}
