"use client"

import { useState } from "react"
import { Check, Save } from "lucide-react"

type Profile = {
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  profile_public: boolean
}

export default function SettingsClient({ profile }: { profile: Profile | null }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "")
  const [profilePublic, setProfilePublic] = useState(profile?.profile_public ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        profile_public: profilePublic,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Manage your profile and privacy preferences.</p>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-stone-200 dark:border-stone-700" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xl font-bold text-stone-500 dark:text-stone-300">
            {profile?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">@{profile?.username}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">Username cannot be changed</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Display name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about you..."
            rows={3}
            maxLength={300}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500 resize-none"
          />
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 text-right">{bio.length}/300</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Avatar URL</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500"
          />
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Paste a direct link to your profile photo.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">Privacy</label>
          <button
            type="button"
            onClick={() => setProfilePublic(!profilePublic)}
            className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors ${
              profilePublic
                ? "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50"
            }`}
          >
            {/* Toggle */}
            <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${profilePublic ? "bg-stone-800 dark:bg-stone-200" : "bg-stone-200 dark:bg-stone-700"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-stone-900 shadow transition-transform ${profilePublic ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {profilePublic ? "Public profile" : "Private profile"}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                {profilePublic
                  ? "Anyone can view your profile and public shelf."
                  : "Only you can see your profile."}
              </p>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 transition-colors"
      >
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  )
}
