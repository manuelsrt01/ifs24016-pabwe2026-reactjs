import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../../test-utils";
import * as authAction from "../states/action";
import RegisterPage from "./RegisterPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

async function fillForm(user) {
  await user.type(screen.getByLabelText(/nama lengkap/i), "Budi");
  await user.type(screen.getByLabelText(/email/i), "budi@mail.com");
  await user.type(screen.getByLabelText(/kata sandi/i), "123456");
  await user.click(screen.getByRole("button", { name: /daftar sekarang/i }));
}

describe("RegisterPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it("menampilkan form dan link ke login", () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /masuk/i })).toHaveAttribute("href", "/auth/login");
  });

  it("submit sukses memanggil asyncRegisterUser dan navigate ke login", async () => {
    const spy = vi.spyOn(authAction, "asyncRegisterUser").mockReturnValue(async () => true);
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    await fillForm(user);

    expect(spy).toHaveBeenCalledWith({ name: "Budi", email: "budi@mail.com", password: "123456" });
    expect(mockNavigate).toHaveBeenCalledWith("/auth/login", { replace: true });
  });

  it("tidak navigate saat registrasi gagal", async () => {
    vi.spyOn(authAction, "asyncRegisterUser").mockReturnValue(async () => false);
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    await fillForm(user);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("menampilkan 'Memproses...' saat isRegister true", () => {
    renderWithProviders(<RegisterPage />, {
      preloadedState: { auth: { user: null, isLogin: false, isRegister: true } },
    });
    expect(screen.getByRole("button", { name: /memproses/i })).toBeDisabled();
  });
});
