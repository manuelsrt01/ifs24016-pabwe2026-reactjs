import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  IconPlus,
  IconSearch,
  IconClipboardList,
  IconMapPinOff,
  IconMapPinCheck,
  IconCircleCheck,
  IconPhoto,
  IconCalendar,
  IconInbox,
} from "@tabler/icons-react";
import { asyncFetchLostFounds } from "../states/action";
import { formatDate } from "../../../helpers/toolsHelper";
import AddModal from "../modals/AddModal";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "lost", label: "Hilang" },
  { value: "found", label: "Ditemukan" },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const rawLostFounds = useSelector((state) => state.lostFounds.lostFounds);
  const lostFounds = Array.isArray(rawLostFounds) ? rawLostFounds : [];
  const isLoading = useSelector((state) => state.lostFounds.isLostFound);

  const [statusFilter, setStatusFilter] = useState("");
  const [completedOnly, setCompletedOnly] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Hanya "Milik Saya" yang butuh data baru dari server. Filter lain dilakukan
  // di sisi klien supaya kartu statistik tetap menampilkan angka keseluruhan.
  const loadLostFounds = useCallback(() => {
    const filters = {};
    if (mineOnly) filters.is_me = 1;
    return dispatch(asyncFetchLostFounds(filters));
  }, [dispatch, mineOnly]);

  useEffect(() => {
    loadLostFounds();
  }, [loadLostFounds]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const matched = lostFounds.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (completedOnly && !item.is_completed) return false;
      if (keyword && !(item.title ?? "").toLowerCase().includes(keyword)) return false;
      return true;
    });
    // Laporan terbaru tampil paling atas.
    return [...matched].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }, [lostFounds, search, statusFilter, completedOnly]);

  const stats = useMemo(() => {
    const total = lostFounds.length;
    const lost = lostFounds.filter((item) => item.status === "lost").length;
    const found = lostFounds.filter((item) => item.status === "found").length;
    const completed = lostFounds.filter((item) => Boolean(item.is_completed)).length;
    return { total, lost, found, completed };
  }, [lostFounds]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Laporan</h1>
            <p className="text-sm text-white mt-1">Kelola laporan barang hilang & ditemukan.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-700 text-sm font-bold px-5 py-3 shadow-lg hover:scale-[1.03] transition"
          >
            <IconPlus size={18} /> Tambah Laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={IconClipboardList} label="Total" value={stats.total} color="from-slate-500 to-slate-700" />
        <StatCard icon={IconMapPinOff} label="Barang Hilang" value={stats.lost} color="from-rose-500 to-pink-600" />
        <StatCard icon={IconMapPinCheck} label="Barang Ditemukan" value={stats.found} color="from-sky-500 to-cyan-600" />
        <StatCard icon={IconCircleCheck} label="Selesai" value={stats.completed} color="from-emerald-500 to-teal-600" />
      </div>

      <div className="card p-4 sm:p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul laporan..."
              className="input-base pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <Chip
                key={item.value || "all"}
                active={statusFilter === item.value}
                onClick={() => setStatusFilter(item.value)}
                activeClass="bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
              >
                {item.label}
              </Chip>
            ))}
            <Chip
              active={completedOnly}
              onClick={() => setCompletedOnly((prev) => !prev)}
              activeClass="bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-200"
            >
              Selesai
            </Chip>
            <Chip
              active={mineOnly}
              onClick={() => setMineOnly((prev) => !prev)}
              activeClass="bg-amber-700 text-white border-amber-700 shadow-md shadow-amber-200"
            >
              Milik Saya
            </Chip>
          </div>
        </div>

        {isLoading && (
          <p className="text-sm text-slate-600" role="status">
            Memuat data laporan...
          </p>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center text-center py-12 text-slate-600">
            <IconInbox size={44} stroke={1.3} />
            <p className="text-sm text-slate-600 mt-2">Belum ada laporan yang cocok.</p>
          </div>
        )}

        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/lost-founds/${item.id}`}
                className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-white hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200 transition duration-200"
              >
                <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <IconPhoto size={36} stroke={1.3} />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                      item.status === "lost" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {item.status === "lost" ? "Hilang" : "Ditemukan"}
                  </span>
                  {Boolean(item.is_completed) && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shadow">
                      <IconCircleCheck size={13} /> Tuntas
                    </span>
                  )}
                </div>
                <div className="p-4 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">{item.description}</p>
                  )}
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <IconCalendar size={13} /> {formatDate(item.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdded={loadLostFounds} />
    </div>
  );
}

function Chip({ active, onClick, activeClass, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition ${
        active ? activeClass : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition">
      <span
        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-md ${color}`}
      >
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs font-medium text-slate-600">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}