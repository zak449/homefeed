"use client";
import { useState } from "react";
import { SignInModal } from "./SignInModal";

interface SignInButtonProps {
  children?: React.ReactNode;
  className?: string;
  returnTo?: string;
}

export function SignInButton({ children, className, returnTo }: SignInButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-amber px-4 py-2 text-sm font-semibold text-bg hover:bg-amber/90"
        }
      >
        {children ?? "Sign in"}
      </button>
      <SignInModal open={open} onClose={() => setOpen(false)} returnTo={returnTo} />
    </>
  );
}
