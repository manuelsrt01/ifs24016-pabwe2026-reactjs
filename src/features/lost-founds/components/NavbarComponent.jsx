import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { IconMenu2, IconLogout, IconChevronDown, IconUserCircle } from "@tabler/icons-react";
import { asyncLogoutUser } from "../../auth/states/action";

export default function NavbarComponent({ onMenuClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const displayName = user?.name ?? "Pengguna";

  function handleLogout() {
    dispatch(asyncLogoutUser());
    navigate("/auth/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
          aria-label="Buka menu"
        >
          <IconMenu2 size={22} />
        </button>
        <span className="font-extrabold text-slate-900 tracking-tight lg:hidden">Lost &amp; Found</span>
        <span className="hidden lg:inline text-sm text-slate-600">
          Selamat datang kembali 👋
        </span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={`Menu akun ${displayName}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition"
        >
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold overflow-hidden ring-2 ring-white shadow">
            {user?.photo ? (
              <img src={user.photo} alt="" className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <IconUserCircle size={18} />
            )}
          </span>
          <span className="text-sm font-semibold text-slate-700 hidden sm:inline">
            {displayName}
          </span>
          <IconChevronDown size={16} className="text-slate-600" aria-hidden="true" />
        </button>

        {isOpen && (
          <div
            data-testid="navbar-dropdown"
            className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-10 animate-pop"
          >
            {user?.email && (
              <p className="px-4 py-2 text-xs text-slate-600 truncate border-b border-slate-100">{user.email}</p>
            )}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Profil Saya
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
            >
              <IconLogout size={16} aria-hidden="true" /> Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}