export function getInitials(fullName?: string) {
  if (!fullName) {
    return "GU";
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "GU";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatTier(tier: string) {
  return tier
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function formatStatus(status: string) {
  const formatted = formatTier(status);

  return formatted ? formatted : "Unknown";
}

export function formatPlainValue(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? formatTier(trimmed) : "Not set";
}

export function formatCurrencyCode(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed.toUpperCase() : "Not set";
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "USD"} ${value.toFixed(2)}`;
  }
}

export function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMonthYear(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
