import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import * as apiHelper from "./helpers/apiHelper";
import { renderWithProviders, screen } from "./test-utils";
import App from "./App";

vi.mock("./helpers/apiHelper", async () => {
  const actual = await vi.importActual("./helpers/apiHelper");
  return { ...actual, getAccessToken: vi.fn() };
});

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

describe("App", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merender halaman login pada rute /auth/login", () => {
    apiHelper.getAccessToken.mockReturnValue(null);
    renderWithProviders(<App />, { route: "/auth/login" });
    expect(screen.getByRole("button", { name: /masuk sekarang/i })).toBeInTheDocument();
  });

  it("merender halaman register pada rute /auth/register", () => {
    apiHelper.getAccessToken.mockReturnValue(null);
    renderWithProviders(<App />, { route: "/auth/register" });
    expect(screen.getByRole("button", { name: /daftar sekarang/i })).toBeInTheDocument();
  });

  it("redirect ke login saat mengakses '/' tanpa token", () => {
    apiHelper.getAccessToken.mockReturnValue(null);
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("button", { name: /masuk sekarang/i })).toBeInTheDocument();
  });

  it("redirect ke '/' saat mengakses halaman auth padahal token sudah ada", async () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");
    renderWithProviders(<App />, { route: "/auth/login" });
    expect(await screen.findByText(/dashboard laporan/i)).toBeInTheDocument();
  });

  it("merender dashboard HomePage pada '/' saat token ada", async () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");
    renderWithProviders(<App />, { route: "/" });
    expect(await screen.findByText(/dashboard laporan/i)).toBeInTheDocument();
  });

  it("merender UsersPage pada '/users' saat token ada", async () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");
    renderWithProviders(<App />, { route: "/users" });
    expect(await screen.findByText(/daftar pengguna/i)).toBeInTheDocument();
  });

  it("merender ProfilePage pada '/profile' saat token ada", async () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");
    renderWithProviders(<App />, { route: "/profile" });
    expect(await screen.findByText(/kelola informasi akun/i)).toBeInTheDocument();
  });

  it("merender DetailPage pada '/lost-founds/:id' saat token ada", async () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 1, title: "Dompet", description: "x", status: "lost", is_completed: 0 },
      }),
    });
    renderWithProviders(<App />, { route: "/lost-founds/1" });
    expect(await screen.findByText(/kembali ke daftar/i)).toBeInTheDocument();
  });
});
