import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import { asyncRegisterUser } from "../states/action";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.auth.isRegister);
  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await dispatch(asyncRegisterUser({ name, email, password }));
    if (success) navigate("/auth/login", { replace: true });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Buat akun baru</h1>
      <p className="text-sm text-slate-600 mb-5">Daftar untuk mulai melaporkan barang.</p>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
        <div>
          <label htmlFor="register-name-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="register-name-input"
            type="text"
            required
            value={name}
            onChange={onNameChange}
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="register-email-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="register-email-input"
            type="email"
            required
            value={email}
            onChange={onEmailChange}
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="register-password-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Kata Sandi
          </label>
          <input
            id="register-password-input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={onPasswordChange}
            className="input-base"
          />
        </div>
        <button
          id="register-submit-button"
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-5 text-center">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="text-indigo-600 font-semibold underline hover:no-underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}