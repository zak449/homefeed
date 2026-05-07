/**
 * Stripped-down layout for /onboarding so the global nav/footer don't
 * compete with the focused 2-screen wizard. The auth/comments task
 * owns the root layout; this nested layout only suppresses chrome.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="onboarding-shell">
      {children}
    </div>
  );
}
