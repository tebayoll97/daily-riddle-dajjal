
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import GameCharacter from "@/lib/GameCharacter";

export default function EditProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isID = language === "id";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [player, setPlayer] = useState(null);

  const [nickname, setNickname] = useState("");
  const [serverNumber, setServerNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPath, setAvatarPath] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData?.session?.user;

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("players")
        .select("id, nickname, server_number, avatar_url, avatar_path")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!data) {
        throw new Error(
          isID
            ? "Profil pemain tidak ditemukan."
            : "Player profile not found."
        );
      }

      setPlayer(data);
      setNickname(data.nickname || "");
      setServerNumber(String(data.server_number || ""));
      setAvatarUrl(data.avatar_url || "");
      setAvatarPath(data.avatar_path || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearPreview() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    setSelectedFile(null);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        isID
          ? "Format foto harus JPG, PNG, atau WEBP."
          : "Photo must be JPG, PNG, or WEBP."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        isID
          ? "Ukuran foto maksimal 10 MB."
          : "Maximum photo size is 10 MB."
      );
      event.target.value = "";
      return;
    }

    clearPreview();

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!player || saving) return;

    setError("");
    setMessage("");

    const cleanNickname = nickname.trim();
    const cleanServer = Number(serverNumber);

    if (!cleanNickname || cleanNickname.length > 30) {
      setError(
        isID
          ? "Nickname wajib diisi dan maksimal 30 karakter."
          : "Nickname is required and must be at most 30 characters."
      );
      return;
    }

    if (
      !Number.isInteger(cleanServer) ||
      cleanServer <= 0
    ) {
      setError(
        isID
          ? "Nomor server tidak valid."
          : "Invalid server number."
      );
      return;
    }

    setSaving(true);

    let uploadedPath = null;

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData?.session?.user;

      if (!user) {
        throw new Error(
          isID
            ? "Sesi login berakhir."
            : "Your session has expired."
        );
      }

      let newAvatarUrl = avatarUrl;
      let newAvatarPath = avatarPath;

      // Upload new photo
      if (selectedFile) {
        const extension =
          selectedFile.type === "image/png"
            ? "png"
            : selectedFile.type === "image/webp"
              ? "webp"
              : "jpg";

        const fileName =
          `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, selectedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedFile.type,
          });

        if (uploadError) throw uploadError;

        uploadedPath = fileName;
        newAvatarPath = fileName;

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        newAvatarUrl = publicData.publicUrl;
      }

      // Remove photo
      if (removeAvatar) {
        newAvatarUrl = null;
        newAvatarPath = null;
      }

      // Update player profile
      const { error: updateError } = await supabase
        .from("players")
        .update({
          nickname: cleanNickname,
          server_number: cleanServer,
          avatar_url: newAvatarUrl,
          avatar_path: newAvatarPath,
        })
        .eq("id", player.id)
        .eq("auth_user_id", user.id);

      if (updateError) throw updateError;

      // Delete old photo after successful update
      if (
        avatarPath &&
        avatarPath !== newAvatarPath
      ) {
        await supabase.storage
          .from("avatars")
          .remove([avatarPath]);
      }

      setAvatarUrl(newAvatarUrl || "");
      setAvatarPath(newAvatarPath || "");
      setNickname(cleanNickname);
      setServerNumber(String(cleanServer));

      clearPreview();
      setRemoveAvatar(false);

      setMessage(
        isID
          ? "Profil berhasil diperbarui!"
          : "Profile updated successfully!"
      );
    } catch (err) {
      // Remove newly uploaded photo if database update failed
      if (uploadedPath) {
        await supabase.storage
          .from("avatars")
          .remove([uploadedPath]);
      }

      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const displayedAvatar = preview || (
    removeAvatar ? "" : avatarUrl
  );

  if (loading) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-2 text-purple-300">
        <GameCharacter character="veylora" expression="thinking" animation="float" size={68} />
        <p className="text-xs tracking-[0.2em] animate-pulse">
          {isID ? "Memuat profil..." : "Loading profile..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] px-4 py-10">
      <div className="max-w-xl mx-auto">

        <Link
          href="/profile"
          className="text-sm text-purple-300 hover:text-purple-200"
        >
          ← {isID ? "Kembali ke Profil" : "Back to Profile"}
        </Link>

        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-[#11101d] p-6">

          <h1 className="text-2xl font-black text-white">
            {isID ? "EDIT PROFIL" : "EDIT PROFILE"}
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            {isID
              ? "Perbarui informasi dan foto profilmu."
              : "Update your profile information and photo."}
          </p>

          <form onSubmit={handleSave} className="mt-8 space-y-6">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">

              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-purple-500/50 bg-purple-950/40 flex items-center justify-center">
                {displayedAvatar ? (
                  <img
                    src={displayedAvatar}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-purple-300">
                    {nickname.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <label className="cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-bold text-white transition">
                {isID ? "Pilih Foto" : "Choose Photo"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP · Max 10 MB
              </p>

              {(avatarUrl || selectedFile) && !removeAvatar && (
                <button
                  type="button"
                  onClick={() => {
                    clearPreview();
                    setRemoveAvatar(true);
                    setMessage("");
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  {isID ? "Hapus Foto Profil" : "Remove Profile Photo"}
                </button>
              )}

              {removeAvatar && (
                <button
                  type="button"
                  onClick={() => setRemoveAvatar(false)}
                  className="text-xs text-purple-300"
                >
                  {isID ? "Batalkan Hapus Foto" : "Cancel Photo Removal"}
                </button>
              )}

            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Nickname
              </label>

              <input
                type="text"
                maxLength={30}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-purple-500/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Server */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {isID ? "Nomor Server" : "Server Number"}
              </label>

              <input
                type="number"
                min="1"
                value={serverNumber}
                onChange={(e) => setServerNumber(e.target.value)}
                className="w-full rounded-xl border border-purple-500/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                {message}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 font-bold text-white transition"
            >
              {saving
                ? isID
                  ? "Menyimpan..."
                  : "Saving..."
                : isID
                  ? "SIMPAN PERUBAHAN"
                  : "SAVE CHANGES"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
