import {
  getBooleanParam,
  getLimitParam,
  getPageParam,
  getSortOrderParam,
  getStringParam,
  updateSearchParams,
} from "@/lib/search-params";

type ParamsLike = {
  get: (key: string) => string | null;
  toString: () => string;
};

export const LANDING_PRODUCT_SORT_VALUES = [
  "recommended",
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
] as const;

export type LandingProductSort = (typeof LANDING_PRODUCT_SORT_VALUES)[number];

export function parseDashboardProductsQuery(params: ParamsLike) {
  return {
    page: getPageParam(params),
    limit: getLimitParam(params),
    search: getStringParam(params, "search"),
  };
}

export function parseDashboardUsersQuery(params: ParamsLike) {
  return {
    page: getPageParam(params),
    limit: getLimitParam(params),
    search: getStringParam(params, "search"),
    status: getStringParam(params, "status"),
    role: getStringParam(params, "role"),
  };
}

export function parseDashboardStoresQuery(params: ParamsLike) {
  return {
    page: getPageParam(params),
    limit: getLimitParam(params),
    search: getStringParam(params, "search"),
    sortOrder: getSortOrderParam(params, "sortOrder"),
    isActive: getBooleanParam(params, "isActive"),
    city: getStringParam(params, "city"),
  };
}

export function parseLandingProductsQuery(params: ParamsLike) {
  const rawSort = getStringParam(params, "sort");
  const sort = LANDING_PRODUCT_SORT_VALUES.includes(
    rawSort as LandingProductSort,
  )
    ? (rawSort as LandingProductSort)
    : "recommended";

  return {
    q: getStringParam(params, "q") ?? "",
    category: getStringParam(params, "category") ?? "all",
    page: getPageParam(params),
    sort,
  };
}

export function parseVerifyOtpQuery(params: ParamsLike) {
  return {
    email: getStringParam(params, "email"),
  };
}

export type DashboardStoresQueryUpdate = {
  search?: string | null;
  city?: string | null;
  isActive?: boolean | null;
  page?: number | null;
  limit?: number | null;
};

export function writeDashboardStoresQuery(
  current: string | ParamsLike,
  updates: DashboardStoresQueryUpdate,
) {
  return updateSearchParams(current, {
    search: updates.search,
    city: updates.city,
    isActive:
      typeof updates.isActive === "boolean" ? String(updates.isActive) : null,
    page: updates.page,
    limit: updates.limit,
  });
}

export type LandingProductsQueryUpdate = {
  q?: string | null;
  category?: string | null;
  sort?: LandingProductSort | null;
  page?: number | null;
};

export function writeLandingProductsQuery(
  current: string | ParamsLike,
  updates: LandingProductsQueryUpdate,
) {
  return updateSearchParams(current, {
    q: updates.q,
    category: updates.category,
    sort: updates.sort,
    page: updates.page,
  });
}

export function writeVerifyOtpQuery(updates: { email?: string | null }) {
  return updateSearchParams("", {
    email: updates.email,
  });
}
