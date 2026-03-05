export type PublicConfigValue = string | number | boolean | object | null;

export interface PublicConfigMap {
  [key: string]: PublicConfigValue;
}

export interface GetPublicConfigResponse {
  statusCode: number;
  data: PublicConfigMap;
  message: string;
  success: boolean;
}
