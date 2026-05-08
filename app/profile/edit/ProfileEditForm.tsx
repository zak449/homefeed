"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/profile/Avatar";

interface InitialProfile {
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  name: string | null;
}

export function ProfileEditForm({
  initial,
  userIdSeed,
}: {
  initial: InitialProfile;
  userIdSeed: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initial.username ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/upload-avatar", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setAvatarUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim() || null, bio, avatarUrl }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Save failed");
      }
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} seed={userIdSeed} label={initial.name ?? username ?? "You"} size={80} />
        <div>
          <label className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-ink cursor-pointer hover:bg-white/10">
            {uploading ? "Uploading…" : "Upload new avatar"}
            <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} disabled={uploading} />
          </label>
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={32}
          className="mt-1 w-full rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm text-ink"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          className="mt-1 w-full rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm text-ink"
        />
      </label>

      {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-full bg-amber px-6 py-2.5 text-sm font-semibold text-bg hover:bg-amber/90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
