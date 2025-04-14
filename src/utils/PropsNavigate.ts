import { RootStackParamList } from "../presentation/navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Định nghĩa NavigationProp là generic
export type NavigationProp<RouteName extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  RouteName
>;
