import { NavLink } from "react-router-dom";
import { IconHome, IconUsers, IconUserCircle, IconX } from "@tabler/icons-react";

const links = [
  { to: "/", label: "Dashboard", icon: IconHome, end: true },
  { to: "/users", label: "Pengguna", icon: IconUsers },
  { to: "/profile", label: "Profil Saya", icon: IconUserCircle },
];

export default function SidebarComponent({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-backdrop"
        />
      )}

      <aside
        className={`fixed lg:sticky z-30 top-0 left-0 h-screen w-64 shrink-0 bg-white/90 backdrop-blur border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="w-8 h-8" />
            <span className="font-extrabold text-slate-900 tracking-tight">
              Lost <span className="text-indigo-600">&amp;</span> Found
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
          >
            <IconX size={20} />
          </button>
        </div>

        <p className="px-5 pt-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-600">Menu</p>
        <nav className="px-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg">
          <p className="text-sm font-bold">Kehilangan sesuatu?</p>
          <p className="text-xs text-white mt-1">Buat laporan agar barangmu cepat kembali.</p>
        </div>
      </aside>
    </>
  );
}