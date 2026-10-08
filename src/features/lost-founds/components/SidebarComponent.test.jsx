import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";

describe("SidebarComponent", () => {
  it("menampilkan tiga menu navigasi", () => {
    render(
      <MemoryRouter>
        <SidebarComponent isOpen={false} onClose={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
  });

  it("menandai menu aktif sesuai rute", () => {
    render(
      <MemoryRouter initialEntries={["/users"]}>
        <SidebarComponent isOpen={false} onClose={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("Pengguna").closest("a")).toHaveClass("bg-indigo-50");
    expect(screen.getByText("Dashboard").closest("a")).not.toHaveClass("bg-indigo-50");
  });

  it("tidak menampilkan backdrop saat isOpen false", () => {
    render(
      <MemoryRouter>
        <SidebarComponent isOpen={false} onClose={() => {}} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("menampilkan backdrop saat isOpen true dan memanggil onClose saat diklik", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SidebarComponent isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("klik tombol tutup menu memanggil onClose", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SidebarComponent isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByLabelText(/tutup menu/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("klik tautan navigasi memanggil onClose", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SidebarComponent isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Pengguna"));
    expect(onClose).toHaveBeenCalled();
  });
});
