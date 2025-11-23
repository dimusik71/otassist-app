import type { BottomTabScreenProps as BottomTabScreenPropsBase } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  LoginModalScreen: undefined;
  CreateAssessment: { clientId?: string };
  ConductAssessment: { assessmentId: string; assessmentType: "home" | "assistive_tech" | "general" | "mobility_scooter" | "falls_risk" | "movement_mobility" };
  AssessmentDetail: { assessmentId: string };
  CreateClient: undefined;
  ClientDetail: { clientId: string };
  EquipmentDetail: { equipmentId: string };
  AddEquipment: undefined;
  GenerateQuote: { assessmentId: string };
  GenerateInvoice: { assessmentId: string };
  EquipmentRecommendations: { assessmentId: string };
  HouseMapping: { assessmentId: string };
  IoTDeviceLibrary: { houseMapId: string; assessmentId: string };
  DevicePlacement: { houseMapId: string; assessmentId: string };
  VideoWalkthrough: { assessmentId: string };
  UserGuide: undefined;
  Settings: undefined;
  Documents: { clientId: string; clientName: string };
  DocumentViewer: { documentId: string; clientId: string; clientName: string };
  BusinessDocuments: undefined;
  UploadCatalog: undefined;
  Appointments: undefined;
  AppointmentDetail: { appointmentId: string };
  Reports: undefined;
  ReportDetail: { reportId: string };
};

export type BottomTabParamList = {
  DashboardTab: undefined;
  AssessmentsTab: undefined;
  ClientsTab: undefined;
  EquipmentTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type BottomTabScreenProps<Screen extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenPropsBase<BottomTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
