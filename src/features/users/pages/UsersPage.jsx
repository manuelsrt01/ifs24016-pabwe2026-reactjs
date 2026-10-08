import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconSearch, IconUsers, IconUserOff } from "@tabler/icons-react";
import { asyncFetchUsers } from "../states/action";
import { getInitial } from "../../../helpers/dataHelper";

const AVATAR_COLORS = [
  "from-indigo-600 to-violet-700",
  "from-rose-600 to-pink-700",
  "from-sky-700 to-cyan-700",
  "from-emerald-700 to-teal-700",
  "from-amber-700 to-orange-700",
  "from-fuchsia-600 to-purple-700",
];

export default function UsersPage() {
  const dispatch = useDispatch();
  const rawUsers = useSelector((state) => state.users.users);
  const users = Array.isArray(rawUsers) ? rawUsers : [];
  const isLoading = useSelector((state) => state.users.isUsers);
  const me = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(asyncFetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (user) =>
        (user.name ?? "").toLowerCase().includes(keyword) ||
        (user.email ?? "").toLowerCase().includes(keyword)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Daftar Pengguna</h1>
          <p className="text-sm text-slate-600 mt-1">Seluruh pengguna terdaftar di aplikasi.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold px-3.5 py-1.5">
          <IconUsers size={15} /> {users.length} pengguna
        </span>
      </div>

      <div className="relative max-w-md">
        <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama atau email..."
          className="input-base pl-10"
        />
      </div>

      {isLoading && (
        <p className="text-sm text-slate-600" role="status">
          Memuat data pengguna...
        </p>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <div className="flex flex-col items-center text-center py-12 text-slate-600">
          <IconUserOff size={44} stroke={1.3} />
          <p className="text-sm text-slate-600 mt-2">Tidak ada pengguna yang cocok.</p>
        </div>
      )}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user, index) => (
          <li
            key={user.id ?? user.email ?? index}
            className="card flex items-center gap-4 p-4 hover:-translate-y-1 hover:shadow-xl transition duration-200"
          >
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
              />
            ) : (
              <span
                className={`w-12 h-12 shrink-0 rounded-full bg-gradient-to-br text-white flex items-center justify-center font-bold shadow ${
                  AVATAR_COLORS[index % AVATAR_COLORS.length]
                }`}
              >
                {getInitial(user.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate flex items-center gap-2">
                {user.name}
                {me?.id !== undefined && me.id === user.id && (
                  <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                    Anda
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-600 truncate">{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}