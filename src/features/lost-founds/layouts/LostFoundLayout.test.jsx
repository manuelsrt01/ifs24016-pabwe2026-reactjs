import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import * as apiHelper from "../../../helpers/apiHelper";
import { renderWithProviders, screen } from "../../../test-utils";
import LostFoundLayout from "./LostFoundLayout";

vi.mock("../../../helpers/apiHelper", async () => {
  const actual = await vi.importActual("../../../helpers/apiHelper");
  return { ...actual, getAccessToken: vi.fn() };
});

describe("LostFoundLayout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirect ke /auth/login jika tidak ada token", () => {
    apiHelper.getAccessToken.mockReturnValue(null);

    renderWithProviders(
      <Routes>
        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<div>Beranda</div>} />
        </Route>
        <Route path="/auth/login" element={<div>Halaman Login</div>} />
      </Routes>,
      { route: "/" }
    );

    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
  });

  it("menampilkan navbar, sidebar, dan Outlet jika token ada", () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");

    renderWithProviders(
      <Routes>
        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<div>Konten Beranda</div>} />
        </Route>
      </Routes>,
      { route: "/" }
    );

    expect(screen.getByText("Lost & Found")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Konten Beranda")).toBeInTheDocument();
  });

  it("tombol menu membuka sidebar dan backdrop menutupnya", async () => {
    apiHelper.getAccessToken.mockReturnValue("token-aktif");
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<div>Konten</div>} />
        </Route>
      </Routes>,
      { route: "/" }
    );

    await user.click(screen.getByLabelText(/buka menu/i));
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();

    await user.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});
