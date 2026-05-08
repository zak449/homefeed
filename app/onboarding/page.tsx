import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import "@/components/onboarding/onboarding.css";

export const metadata = {
  title: "Set up your Gwaky",
  description: "Two quick screens. Get to your feed.",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/onboarding");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      onboardingCompletedAt: true,
      name: true,
      email: true,
    },
  });

  // Already onboarded — go home.
  if (user?.onboardingCompletedAt) redirect("/");

  return (
    <main aria-labelledby="onboarding-heading">
      <OnboardingWizard
        initial={{
          // The auth task's User uses `name` for display name; we reuse it.
          displayName: user?.name ?? "",
          username: user?.username ?? deriveUsername(user?.email),
        }}
      />
    </main>
  );
}

function deriveUsername(email?: string | null): string {
  if (!email) return "";
  return email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
}
