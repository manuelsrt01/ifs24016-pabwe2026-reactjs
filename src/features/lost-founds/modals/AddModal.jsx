import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX, IconPhoto, IconTrash } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncAddLostFound } from "../states/action";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AddModal({ isOpen, onClose, onAdded }) {
  const dispatch = useDispatch();
  const [title, onTitleChange, , resetTitle] = useInput("");
  const [description, onDescriptionChange, , resetDescription] = useInput("");
  const [status, onStatusChange, setStatus] = useInput("lost");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");

  if (!isOpen) return null;

  function clearFile() {
    setFile(null);
    setPreview(null);
    setFileError("");
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setFileError("");
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = { title, description, status };
    const success = await dispatch(
      file ? asyncAddLostFound(payload, file) : asyncAddLostFound(payload)
    );
    if (success) {
      resetTitle();
      resetDescription();
      setStatus("lost");
      clearFile();
      onAdded?.();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-pop max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Tambah Laporan</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="add-form">
          <div>
            <label htmlFor="add-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Judul
            </label>
            <input
              id="add-title"
              type="text"
              required
              value={title}
              onChange={onTitleChange}
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="add-description" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              id="add-description"
              required
              rows={3}
              value={description}
              onChange={onDescriptionChange}
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="add-status" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Jenis Laporan
            </label>
            <select
              id="add-status"
              value={status}
              onChange={onStatusChange}
              className="input-base"
            >
              <option value="lost">Barang Hilang</option>
              <option value="found">Barang Ditemukan</option>
            </select>
          </div>

          <div>
            <p className="block text-sm font-semibold text-slate-700 mb-1.5">
              Gambar <span className="font-normal text-slate-600">(opsional)</span>
            </p>
            <div className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 h-36 overflow-hidden bg-slate-50">
              {preview ? (
                <>
                  <img src={preview} alt="Pratinjau gambar" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Hapus gambar"
                    className="absolute top-2 right-2 rounded-lg bg-white/95 p-1.5 text-rose-700 shadow hover:bg-rose-50"
                  >
                    <IconTrash size={16} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-600">
                  <IconPhoto size={30} stroke={1.4} />
                  <span className="text-xs mt-1">Pilih gambar barang</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              aria-label="Pilih gambar laporan"
              className="mt-2 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {fileError && (
              <p role="alert" className="mt-1 text-xs text-rose-700">
                {fileError}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}