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
export function getStoredLocation(): { latitude: number; longitude: number; city: string; state: string; zip?: string } | null {
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
export function storeLocation(loc: { latitude: number; longitude: number; city: string; state: string; zip?: string }) {
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
  zip?: string;
} | null> {
  // Check if we already have a recent location (less than 5 minutes old)
  const stored = getStoredLocation();
  const storedTime = localStorage.getItem("hf_location_time");
  if (stored && storedTime && Date.now() - Number(storedTime) < 300_000) {
    return stored;
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("[Geo] Geolocation API not available in this browser");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const anonId = getAnonId();
        console.log("[Geo] Got browser position:", latitude.toFixed(4), longitude.toFixed(4));

        try {
          const res = await fetch("/api/geo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonId, latitude, longitude }),
          });

          if (res.ok) {
            const data = await res.json();
            console.log("[Geo] Reverse geocode result:", data.city, data.state);
            const loc = {
              latitude,
              longitude,
              city: data.city || "",
              state: data.state || "",
              zip: data.zip || "",
            };
            storeLocation(loc);
            localStorage.setItem("hf_location_time", String(Date.now()));
            resolve(loc);
          } else {
            const errText = await res.text().catch(() => "");
            console.error("[Geo] /api/geo returned", res.status, errText);
            resolve(null);
          }
        } catch (err) {
          console.error("[Geo] Failed to call /api/geo:", err);
          resolve(null);
        }
      },
      (err) => {
        console.warn("[Geo] Browser geolocation error:", err.code, err.message);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300_000 }
    );
  });
}
