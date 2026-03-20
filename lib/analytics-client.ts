/**
 * Client-side analytics helpers.
 * Generates anonymous ID, tracks events, manages geolocation.
 */

// Generate or retrieve anonymous user ID
export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("hf_anon_id");
  if (!id) {
    id = "hf_" + crypto.randomUUID();
    localStorage.setItem("hf_anon_id", id);
  }
  return id;
}

// Get stored location
export function getStoredLocation(): { latitude: number; longitude: number; city: string; state: string } | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("hf_location");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Store location
export function storeLocation(loc: { latitude: number; longitude: number; city: string; state: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hf_location", JSON.stringify(loc));
}

// Track an analytics event (fire and forget)
export function trackEvent(
  type: "page_view" | "search" | "listing_view" | "comment" | "reaction",
  data?: Record<string, unknown>
) {
  const anonId = getAnonId();
  if (!anonId) return;

  const loc = getStoredLocation();

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      anonId,
      type,
      data,
      latitude: loc?.latitude,
      longitude: loc?.longitude,
    }),
  }).catch(() => {}); // Fire and forget
}

// Request geolocation and store it
export async function requestGeolocation(): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  state: string;
} | null> {
  // Check if we already have a recent location (less than 1 hour old)
  const stored = getStoredLocation();
  const storedTime = localStorage.getItem("hf_location_time");
  if (stored && storedTime && Date.now() - Number(storedTime) < 3600_000) {
    return stored;
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const anonId = getAnonId();

        try {
          const res = await fetch("/api/geo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonId, latitude, longitude }),
          });

          if (res.ok) {
            const data = await res.json();
            const loc = {
              latitude,
              longitude,
              city: data.city || "",
              state: data.state || "",
            };
            storeLocation(loc);
            localStorage.setItem("hf_location_time", String(Date.now()));
            resolve(loc);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      },
      () => {
        // User denied or error
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600_000 }
    );
  });
}
