import Constants from "expo-constants";
import { Platform } from "react-native";

import { normalizeApiError } from "@/lib/api-errors";

function extractHost(uri: string | null | undefined) {
  if (!uri) {
    return null;
  }

  const normalizedUri = uri.replace(/^[a-z]+:\/\//i, "");
  const host = normalizedUri.split("/")[0]?.split(":")[0];

  return host || null;
}

function resolveApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const expoHost =
    extractHost(Constants.expoConfig?.hostUri) ||
    extractHost(Constants.expoGoConfig?.debuggerHost);

  if (expoHost) {
    return `http://${expoHost}:9000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:9000/api";
  }

  return "http://localhost:9000/api";
}

export const API_BASE_URL = resolveApiBaseUrl();
const REQUEST_TIMEOUT_MS = 12000;

let accessToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorizedCallback(callback: (() => void) | null) {
  onUnauthorizedCallback = callback;
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function request<TResponse>(
  method: string,
  path: string,
  body?: BodyInit | Record<string, unknown>,
): Promise<TResponse> {
  const requestUrl = buildUrl(path);
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  try {
    if (__DEV__) {
      console.log(`[mobile-api] ${method} ${requestUrl}`);
    }

    const response = await Promise.race([
      fetch(requestUrl, {
        method,
        headers,
        body:
          body === undefined
            ? undefined
            : isFormData
              ? body
              : JSON.stringify(body),
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds while reaching ${requestUrl}.`,
            ),
          );
        }, REQUEST_TIMEOUT_MS);
      }),
    ]);

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      const apiError = normalizeApiError(
        payload,
        `Request failed with status ${response.status}.`,
      );

      // Notify if session seems expired/unauthorized
      if (
        path !== "/auth/logout" &&
        (response.status === 401 ||
          response.status === 403 ||
          apiError.errorCode === "AUTH_UNAUTHORIZED")
      ) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }

      throw apiError;
    }

    return payload as TResponse;
  } catch (error) {
    throw normalizeApiError(
      error,
      `Unable to reach the server at ${requestUrl}.`,
    );
  }
}

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export const mobileApiClient = {
  get: <T = unknown, R = T>(url: string) => request<R>("GET", url),
  post: <T = unknown, R = T>(url: string, data?: T) =>
    request<R>("POST", url, data as Record<string, unknown> | undefined),
  put: <T = unknown, R = T>(url: string, data?: T) =>
    request<R>("PUT", url, data as Record<string, unknown> | undefined),
  patch: <T = unknown, R = T>(url: string, data?: T) =>
    request<R>("PATCH", url, data as Record<string, unknown> | undefined),
  delete: <T = unknown, R = T>(url: string) => request<R>("DELETE", url),
};
