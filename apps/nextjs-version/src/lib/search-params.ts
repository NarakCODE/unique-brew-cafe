type SearchParamValue = string | number | boolean | null | undefined;
type QueryPrimitive = string | number | boolean;
type QueryValue =
  | QueryPrimitive
  | null
  | undefined
  | QueryPrimitive[]
  | readonly QueryPrimitive[];
type ParamsLike = {
  get: (key: string) => string | null;
  toString: () => string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toPositiveInt(
  value: string | null,
  fallback: number,
  max: number = Number.MAX_SAFE_INTEGER,
) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.floor(parsed);
  if (normalized < 1) return fallback;
  return Math.min(normalized, max);
}

export function getPageParam(params: ParamsLike) {
  return toPositiveInt(params.get("page"), DEFAULT_PAGE);
}

export function getLimitParam(params: ParamsLike) {
  return toPositiveInt(params.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
}

export function getPositiveIntParam(
  params: ParamsLike,
  key: string,
  fallback: number,
  max?: number,
) {
  return toPositiveInt(params.get(key), fallback, max);
}

export function getStringParam(
  params: ParamsLike,
  key: string,
): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

export function getBooleanParam(
  params: ParamsLike,
  key: string,
): boolean | undefined {
  const value = params.get(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function getSortOrderParam(
  params: ParamsLike,
  key: string,
): "asc" | "desc" | undefined {
  const value = params.get(key);
  if (value === "asc" || value === "desc") return value;
  return undefined;
}

export function updateSearchParams(
  current: string | ParamsLike,
  updates: Record<string, SearchParamValue>,
) {
  const params =
    typeof current === "string"
      ? new URLSearchParams(current)
      : new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export function buildQueryString(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === null || item === undefined || item === "") return;
        searchParams.append(key, String(item));
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}

export function withQuery(path: string, query: string) {
  return query ? `${path}?${query}` : path;
}
