const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;
const BASE_URL = "https://a.klaviyo.com/api";

// ── Helpers ────────────────────────────────────────────────

function headers() {
  return {
    Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    "Content-Type": "application/json",
    revision: "2024-10-15", // Klaviyo API revision
  };
}

function isConfigured(): boolean {
  return Boolean(KLAVIYO_API_KEY);
}

// ── Create / Update Profile ────────────────────────────────

async function upsertProfile(
  email: string,
  phone?: string,
  properties?: Record<string, unknown>
): Promise<string | null> {
  if (!isConfigured()) return null;

  const attributes: Record<string, unknown> = {
    email,
    ...properties,
  };

  if (phone) {
    // Klaviyo expects E.164 format, but accepts flexible input
    attributes.phone_number = phone;
  }

  // Use the Profiles API — POST will create, or return conflict with existing ID
  const res = await fetch(`${BASE_URL}/profiles/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes,
      },
    }),
  });

  if (res.status === 201) {
    const json = await res.json();
    return json.data?.id ?? null;
  }

  // 409 = profile already exists — extract the ID from the error response
  if (res.status === 409) {
    const json = await res.json();
    const existingId =
      json.errors?.[0]?.meta?.duplicate_profile_id ?? null;

    // If we got the existing ID, update the profile with PATCH
    if (existingId) {
      await fetch(`${BASE_URL}/profiles/${existingId}/`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          data: {
            type: "profile",
            id: existingId,
            attributes: {
              ...properties,
              ...(phone ? { phone_number: phone } : {}),
            },
          },
        }),
      });
    }

    return existingId;
  }

  // Log unexpected errors but don't throw — Klaviyo is non-critical
  console.error("[klaviyo] upsertProfile failed:", res.status, await res.text());
  return null;
}

// ── Subscribe to List ──────────────────────────────────────

async function addToList(profileId: string): Promise<void> {
  if (!isConfigured() || !KLAVIYO_LIST_ID || !profileId) return;

  await fetch(`${BASE_URL}/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: [{ type: "profile", id: profileId }],
    }),
  });
}

// ── Public API ─────────────────────────────────────────────

/**
 * Add or update a subscriber in Klaviyo and add them to the main list.
 * Gracefully no-ops if KLAVIYO_API_KEY is not set.
 */
export async function addSubscriber(
  email: string,
  phone?: string,
  properties?: Record<string, unknown>
): Promise<string | null> {
  if (!isConfigured()) return null;

  try {
    const profileId = await upsertProfile(email, phone, properties);
    if (profileId) {
      await addToList(profileId);
    }
    return profileId;
  } catch (err) {
    console.error("[klaviyo] addSubscriber error:", err);
    return null;
  }
}

/**
 * Track a custom event in Klaviyo (used to trigger flows).
 *
 * Supported events:
 *  - "Signed Up"
 *  - "Viewed Listing"
 *  - "Left Comment"
 *  - "Saved Listing"
 */
export async function trackKlaviyoEvent(
  email: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!isConfigured()) return;

  try {
    // First ensure profile exists
    const profileId = await upsertProfile(email);
    if (!profileId) return;

    await fetch(`${BASE_URL}/events/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: {
              data: {
                type: "metric",
                attributes: { name: event },
              },
            },
            profile: {
              data: {
                type: "profile",
                id: profileId,
              },
            },
            properties: properties ?? {},
            time: new Date().toISOString(),
          },
        },
      }),
    });
  } catch (err) {
    console.error("[klaviyo] trackEvent error:", err);
  }
}
