import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconUserCircle, IconDeviceFloppy, IconLock, IconCamera } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import {
  asyncFetchProfile,
  asyncChangeProfile,
  asyncChangeProfilePhoto,
  asyncChangeProfilePassword,
} from "../states/action";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.users.profile);
  const isLoading = useSelector((state) => state.users.isProfile);

  const [name, onNameChange, setName] = useInput("");

  const [currentPassword, onCurrentPasswordChange, , resetCurrentPassword] = useInput("");
  const [newPassword, onNewPasswordChange, , resetNewPassword] = useInput("");
  const [confirmPassword, onConfirmPasswordChange, , resetConfirmPassword] = useInput("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    dispatch(asyncFetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
    }
  }, [profile, setName]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    // API mewajibkan nama dan email; email tidak diubah dari halaman ini.
    await dispatch(asyncChangeProfile({ name, email: profile?.email }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handlePhotoSubmit(event) {
    event.preventDefault();
    if (!photoFile) return;
    const success = await dispatch(asyncChangeProfilePhoto(photoFile));
    if (success) {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) return;

    const success = await dispatch(
      asyncChangeProfilePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
    );
    if (success) {
      resetCurrentPassword();
      resetNewPassword();
      resetConfirmPassword();
    }
  }

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (isLoading && !profile) {
    return (
      <div>
        <h1 className="sr-only">Profil Saya</h1>
        <p className="text-sm text-slate-600" role="status">
          Memuat profil...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-white/20 ring-4 ring-white/30 flex items-center justify-center overflow-hidden text-2xl font-extrabold">
            {profile?.photo ? (
              <img src={profile.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.name ?? "?").charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight">Profil Saya</h1>
            <p className="text-sm text-white truncate">{profile?.email ?? "Kelola informasi akun dan keamananmu."}</p>
          </div>
        </div>
      </div>

      <section className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <IconCamera size={18} /> Foto Profil
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-16 h-16 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden ring-4 ring-indigo-50">
            {photoPreview || profile?.photo ? (
              <img
                src={photoPreview || profile.photo}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <IconUserCircle size={32} />
            )}
          </span>
          <form onSubmit={handlePhotoSubmit} className="flex items-center gap-2" data-testid="photo-form">
            <input
              type="file"
              accept="image/*"
              aria-label="Pilih foto profil"
              onChange={handlePhotoChange}
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <button
              type="submit"
              disabled={!photoFile}
              className="btn-primary !px-3.5 !py-2 !text-xs"
            >
              Unggah
            </button>
          </form>
        </div>
      </section>

      <section className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Informasi Profil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-3" data-testid="profile-form">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={onNameChange}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile?.email ?? ""}
              readOnly
              className="input-base bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 btn-primary"
          >
            <IconDeviceFloppy size={16} /> Simpan Profil
          </button>
        </form>
      </section>

      <section className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <IconLock size={18} /> Ubah Kata Sandi
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-3" data-testid="password-form">
          <div>
            <label htmlFor="current-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={onCurrentPasswordChange}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi Baru
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={onNewPasswordChange}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              className="input-base"
            />
            {passwordMismatch && (
              <p className="text-xs text-rose-700 mt-1">Konfirmasi kata sandi tidak sama.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={passwordMismatch}
            className="inline-flex items-center gap-1.5 btn-primary"
          >
            <IconLock size={16} /> Perbarui Kata Sandi
          </button>
        </form>
      </section>
    </div>
  );
}