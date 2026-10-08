import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowLeft,
  IconEdit,
  IconPhoto,
  IconTrash,
  IconCircleCheck,
  IconCircleDashed,
} from "@tabler/icons-react";
import { asyncFetchLostFound, asyncDeleteLostFound } from "../states/action";
import { formatDate } from "../../../helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";

export default function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lostFound = useSelector((state) => state.lostFounds.lostFound);
  const isLoading = useSelector((state) => state.lostFounds.isLostFound);
  const me = useSelector((state) => state.auth.user);

  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(asyncFetchLostFound(id));
    }
  }, [dispatch, id]);

  async function handleDelete() {
    const success = await dispatch(asyncDeleteLostFound(id));
    if (success) {
      navigate("/", { replace: true });
    }
  }

  const ownerId = lostFound?.user_id ?? lostFound?.user?.id;
  const isOwner = ownerId === undefined || me?.id === undefined || String(ownerId) === String(me.id);

  if (isLoading && !lostFound) {
    return (
      <div>
        <h1 className="sr-only">Detail Laporan</h1>
        <p className="text-sm text-slate-600" role="status">
          Memuat detail laporan...
        </p>
      </div>
    );
  }

  if (!lostFound) {
    return (
      <div>
        <h1 className="sr-only">Detail Laporan</h1>
        <p className="text-sm text-slate-600">Laporan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">
        <IconArrowLeft size={16} /> Kembali ke daftar
      </Link>

      <div className="card overflow-hidden">
        <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-100 to-slate-200">
          {lostFound.cover ? (
            <img src={lostFound.cover} alt={lostFound.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <IconPhoto size={32} />
            </div>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsCoverOpen(true)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur px-3.5 py-2 text-xs font-bold text-slate-700 shadow-lg hover:scale-105 transition"
            >
              <IconPhoto size={14} /> Ubah Cover
            </button>
          )}
        </div>

        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                lostFound.status === "lost" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
              }`}
            >
              {lostFound.status === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                lostFound.is_completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {lostFound.is_completed ? <IconCircleCheck size={14} /> : <IconCircleDashed size={14} />}
              {lostFound.is_completed ? "Selesai" : "Belum selesai"}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{lostFound.title}</h1>
          <p className="text-xs text-slate-600">
            Dilaporkan oleh {lostFound.user?.name ?? "Pengguna"} &middot; {formatDate(lostFound.created_at)}
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">{lostFound.description}</p>

          {isOwner && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsChangeOpen(true)} className="btn-ghost !py-2 !text-xs">
                <IconEdit size={14} /> Ubah Data
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
              >
                <IconTrash size={14} /> Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangeModal isOpen={isChangeOpen} onClose={() => setIsChangeOpen(false)} lostFound={lostFound} />
      <ChangeCoverModal
        isOpen={isCoverOpen}
        onClose={() => setIsCoverOpen(false)}
        lostFoundId={lostFound.id}
      />
    </div>
  );
}