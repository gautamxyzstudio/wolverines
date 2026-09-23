"use client";

const TOKEN_KEY = "wolverines_admin_token";
const USER_KEY = "wolverines_admin_user";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt?: string;
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Set cookie for middleware/server support if needed
  document.cookie = `admin_token=${token}; path=/; max-age=17280000; SameSite=Lax`;
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie =
    "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export async function adminFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; status: number }> {
  const token = getAdminToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const status = response.status;

    if (status === 401 || status === 403) {
      // Session expired or unauthorized
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/admin/login")
      ) {
        clearAdminSession();
        window.location.href = "/admin/login?expired=true";
      }
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message:
          json.message || json.error || `Request failed with status ${status}`,
        data: json.data,
        status,
      };
    }

    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
      message: json.message,
      status,
    };
  } catch (error: any) {
    console.error(`adminFetch error on ${endpoint}:`, error);
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
      status: 500,
    };
  }
}

export function formatCurrency(
  amount: number | string | null | undefined,
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(num);
}

export function formatDate(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateString);
  }
}

export function formatTime(
  timeString: string | Date | null | undefined,
): string {
  if (!timeString) return "N/A";
  try {
    let h = 0;
    let m = 0;
    if (
      typeof timeString === "string" &&
      /^([01]\d|2[0-3]):([0-5]\d)/.test(timeString)
    ) {
      const parts = timeString.split(":");
      h = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    } else {
      const d = new Date(timeString);
      if (isNaN(d.getTime())) return String(timeString);
      h = d.getUTCHours();
      m = d.getUTCMinutes();
    }
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}:${mStr} ${period}`;
  } catch {
    return String(timeString);
  }
}
