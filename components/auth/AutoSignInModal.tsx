"use client";

/**
 * AutoSignInModal — bridges the gap between the auth-protected pages that
 * redirect to `/?signin=1&returnTo=…` and the existing SignInModal component.
 *
 * Reads the `signin` URL search param. When present, opens SignInModal with
 * the `returnTo` from the URL. On close, strips both params from the URL via
 * `router.replace` so the modal doesn't re-open on back-nav.
 *
 * Mount once in the root layout. Works on any page that receives the
 * `?signin=1` query (homepage, profile, etc.).
 */

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SignInModal } from "./SignInModal";

export function AutoSignInModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    const signin = searchParams.get("signin");
    if (signin === "1") {
      setReturnTo(searchParams.get("returnTo") ?? undefined);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchParams]);

  function handleClose() {
    setOpen(false);
    // Strip signin + returnTo from the URL so back-nav doesn't reopen.
    const next = new URLSearchParams(searchParams.toString());
    next.delete("signin");
    next.delete("returnTo");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return <SignInModal open={open} onClose={handleClose} returnTo={returnTo} />;
}
