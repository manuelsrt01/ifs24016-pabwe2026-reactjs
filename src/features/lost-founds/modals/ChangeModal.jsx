import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncChangeLostFound } from "../states/action";

export default function ChangeModal({ isOpen, onClose, lostFound }) {
  const dispatch = useDispatch();
  const [title, onTitleChange, setTitle] = useInput("");
  const [description, onDescriptionChange, setDescription] = useInput("");
  const [status, onStatusChange, setStatus] = useInput("lost");
  const [isCompleted, onCompletedChange, setIsCompleted] = useInput(false);

  useEffect(() => {
    if (lostFound) {
      setTitle(lostFound.title ?? "");
      setDescription(lostFound.description ?? "");
      setStatus(lostFound.status ?? "lost");
      setIsCompleted(Boolean(lostFound.is_completed));
    }
  }, [lostFound, setTitle, setDescription, setStatus, setIsCompleted]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await dispatch(
      asyncChangeLostFound(lostFound.id, {
        title,
        description,
        status,
        is_completed: isCompleted ? 1 : 0,
      })
    );
    if (success) onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-pop">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Ubah Laporan</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="change-form">
          <div>
            <label htmlFor="change-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Judul
            </label>
            <input
              id="change-title"
              type="text"
              required
              value={title}
              onChange={onTitleChange}
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="change-description" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              id="change-description"
              required
              rows={3}
              value={description}
              onChange={onDescriptionChange}
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="change-status" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Jenis Laporan
            </label>
            <select
              id="change-status"
              value={status}
              onChange={onStatusChange}
              className="input-base"
            >
              <option value="lost">Barang Hilang</option>
              <option value="found">Barang Ditemukan</option>
            </select>
          </div>

          <label htmlFor="change-completed" className="flex items-center gap-2 text-sm text-slate-700">
            <input
              id="change-completed"
              type="checkbox"
              checked={isCompleted}
              onChange={onCompletedChange}
              className="rounded border-slate-300"
            />
            Tandai sudah selesai
          </label>

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
              className="btn-primary"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
