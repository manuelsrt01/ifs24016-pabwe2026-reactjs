import { describe, it, expect, vi, afterEach } from "vitest";
import { Routes, Route } from "react-router-dom";
import * as apiHelper from "../../../helpers/apiHelper";
import { renderWithProviders, screen } from "../../../test-utils";
import AuthLayout from "./AuthLayout";

vi.mock("../../../helpers/apiHelper", async () => {
  const actual = await vi.importActual("../../../helpers/apiHelper");
  return { ...actual, getAccessToken: vi.fn() };
});

const tree = (
  <Routes>
    <Route path="/auth" element={<AuthLayout />}>
      <Route path="login" element={<div>Form Login</div>} />
    </Route>
    <Route path="/" element={<div>Beranda</div>} />
  </Routes>
);

describe("AuthLayout", () => {
  afterEach(() => vi.restoreAllMocks());

  it("menampilkan Outlet saat belum ada token", () => {
    apiHelper.getAccessToken.mockReturnValue(null);
    renderWithProviders(tree, { route: "/auth/login" });
    expect(screen.getByText("Form Login")).toBeInTheDocument();
  });

  it("redirect ke '/' saat token sudah ada", () => {
    apiHelper.getAccessToken.mockReturnValue("token");
    renderWithProviders(tree, { route: "/auth/login" });
    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });
});
