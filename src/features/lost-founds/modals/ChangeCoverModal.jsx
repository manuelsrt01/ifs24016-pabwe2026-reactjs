import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX, IconPhoto } from "@tabler/icons-react";
import { asyncChangeLostFoundCover } from "../states/action";

export default function ChangeCoverModal({ isOpen, onClose, lostFoundId }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) return;
    const success = await dispatch(asyncChangeLostFoundCover(lostFoundId, file));
    if (success) {
      setFile(null);
      setPreview(null);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-pop">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Ubah Cover</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="cover-form">
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 h-40 overflow-hidden bg-slate-50">
            {preview ? (
              <img src={preview} alt="Pratinjau cover" className="w-full h-full object-cover" />
            ) : (
              <IconPhoto size={32} className="text-slate-600" />
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Pilih berkas cover"
            className="w-full text-sm"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!file}
              className="btn-primary"
            >
              Unggah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
