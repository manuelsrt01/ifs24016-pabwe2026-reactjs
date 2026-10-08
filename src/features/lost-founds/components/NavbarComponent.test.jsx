import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../../test-utils";
import * as authAction from "../../auth/states/action";
import NavbarComponent from "./NavbarComponent";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("NavbarComponent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it("menampilkan nama pengguna dari state auth", () => {
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />, {
      preloadedState: { auth: { user: { name: "Budi" } } },
    });
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("menampilkan 'Pengguna' saat user belum ada", () => {
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />);
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
  });

  it("membuka dropdown saat avatar diklik dan menampilkan link profil & logout", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />);

    await user.click(screen.getByText("Pengguna"));

    expect(screen.getByTestId("navbar-dropdown")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /keluar/i })).toBeInTheDocument();
  });

  it("klik link Profil Saya menutup dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />);

    await user.click(screen.getByText("Pengguna"));
    await user.click(screen.getByText("Profil Saya"));

    expect(screen.queryByTestId("navbar-dropdown")).not.toBeInTheDocument();
  });

  it("klik tombol menu memanggil onMenuClick", async () => {
    const onMenuClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<NavbarComponent onMenuClick={onMenuClick} />);

    await user.click(screen.getByLabelText(/buka menu/i));
    expect(onMenuClick).toHaveBeenCalled();
  });

  it("klik logout memanggil asyncLogoutUser dan navigate ke login", async () => {
    const logoutSpy = vi.spyOn(authAction, "asyncLogoutUser").mockReturnValue(() => {});
    const user = userEvent.setup();
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />);

    await user.click(screen.getByText("Pengguna"));
    await user.click(screen.getByRole("button", { name: /keluar/i }));

    expect(logoutSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/auth/login", { replace: true });
  });

  it("menampilkan foto dan email pengguna di dropdown bila tersedia", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavbarComponent onMenuClick={() => {}} />, {
      preloadedState: { auth: { user: { name: "Budi", email: "budi@mail.com", photo: "budi.jpg" } } },
    });
    expect(document.querySelector('img[src="budi.jpg"]')).toBeInTheDocument();
    await user.click(screen.getByText("Budi"));
    expect(screen.getByText("budi@mail.com")).toBeInTheDocument();
  });
});
