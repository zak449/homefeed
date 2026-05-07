#!/usr/bin/env bash
# push-feat.command — run from the homefeed repo root on your local Mac.
#
# This script:
#   1. Branches `feat/onboarding` off `feat/accounts-comments-notifications`
#      (or off the current HEAD if that branch doesn't exist locally).
#   2. Stages everything written by the onboarding agent.
#   3. Commits with a structured message.
#   4. Pushes to origin and prints the PR URL.
#
# The sandbox can't auth GitHub, so this runs locally where your credentials live.
# Double-click in Finder OR `bash push-feat.command` from a terminal.

set -euo pipefail

cd "$(dirname "$0")"

BASE_BRANCH="${BASE_BRANCH:-feat/accounts-comments-notifications}"
NEW_BRANCH="${NEW_BRANCH:-feat/onboarding}"
ORIGIN="${ORIGIN:-origin}"

echo "→ repo: $(pwd)"

# 1. Make sure base branch exists; if not, fall back to current HEAD.
if git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
  echo "→ base: $BASE_BRANCH"
  git checkout "$BASE_BRANCH"
elif git ls-remote --exit-code --heads "$ORIGIN" "$BASE_BRANCH" >/dev/null 2>&1; then
  echo "→ base: fetching $BASE_BRANCH from $ORIGIN"
  git fetch "$ORIGIN" "$BASE_BRANCH:$BASE_BRANCH"
  git checkout "$BASE_BRANCH"
else
  echo "⚠️  $BASE_BRANCH not found locally or on $ORIGIN — branching from current HEAD"
fi

# 2. Branch.
if git show-ref --verify --quiet "refs/heads/$NEW_BRANCH"; then
  git checkout "$NEW_BRANCH"
else
  git checkout -b "$NEW_BRANCH"
fi

# 3. Stage onboarding files. (Listed explicitly so we don't sweep up
#    files the parallel tasks may have written into the same worktree.)
ONBOARDING_PATHS=(
  "app/onboarding"
  # NOTE: app/(legal)/ is INTENTIONALLY EXCLUDED — it collides with the
  # auth task's existing app/privacy/page.tsx and app/terms/page.tsx.
  # Plain-English copy lives at docs/onboarding/legal-templates/.
  "app/profile/edit/onboarding-additions.tsx"
  "components/onboarding"
  "components/profile/ProfileFieldsSection.tsx"
  "components/profile/PrivacyDataSection.tsx"
  "components/profile/profile-edit.css"
  "lib/onboarding"
  "lib/consent"
  "prisma/schema.onboarding.prisma"
  "docs/onboarding"
  "push-feat.command"
)
for p in "${ONBOARDING_PATHS[@]}"; do
  if [ -e "$p" ]; then
    git add "$p"
  fi
done

# Defensive: if any sandbox-leftover files made it into the staging area
# from a previous run, unstage them. They won't break the commit but
# they'd confuse the diff.
git reset HEAD -- "app/(legal)" 2>/dev/null || true
git reset HEAD -- ".onboarding-task-marker" 2>/dev/null || true

# 4. Commit (no-op if nothing staged).
if git diff --cached --quiet; then
  echo "→ nothing new to commit"
else
  git commit -m "feat(onboarding): strategic data capture, granular consent, Tier-2 carrot

- /onboarding 2-screen wizard (display name, username, role, markets)
- Granular consent (TOS, marketing OFF, personalization ON, push deferred)
- Tier 2 progressive-disclosure modal + home banner
- /profile/edit additions: per-field privacy toggles, GDPR export+delete
- /privacy and /terms (plain English)
- Prisma schema fragment + ConsentLog audit model
- WCAG 2.1 AA verified; mockups at 390x844 in docs/onboarding/screenshots
"
fi

# 5. Push.
git push -u "$ORIGIN" "$NEW_BRANCH"

# 6. Print PR url.
ORIGIN_URL="$(git remote get-url "$ORIGIN")"
case "$ORIGIN_URL" in
  git@github.com:*)
    REPO="${ORIGIN_URL#git@github.com:}"; REPO="${REPO%.git}"
    ;;
  https://github.com/*)
    REPO="${ORIGIN_URL#https://github.com/}"; REPO="${REPO%.git}"
    ;;
  *) REPO=""
esac

if [ -n "$REPO" ]; then
  echo ""
  echo "✓ Pushed. Open a PR:"
  echo "  https://github.com/$REPO/compare/$BASE_BRANCH...$NEW_BRANCH?expand=1"
fi
