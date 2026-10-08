import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../../test-utils";
import * as lostFoundAction from "../states/action";
import HomePage from "./HomePage";

const sampleItems = [
  { id: 1, title: "Dompet Hilang", status: "lost", is_completed: 0, created_at: "2026-01-01" },
  { id: 2, title: "Kunci Ditemukan", status: "found", is_completed: 1, created_at: "2026-01-02" },
  { id: 3, status: "found", is_completed: 1, created_at: "2026-01-03" },
];

function statValue(label) {
  return screen.getByText(label, { selector: "p" }).nextElementSibling;
}

describe("HomePage", () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(lostFoundAction, "asyncFetchLostFounds").mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("memanggil asyncFetchLostFounds tanpa filter saat dimuat", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: [], isLostFound: false } },
    });
    expect(fetchSpy).toHaveBeenCalledWith({});
  });

  it("menampilkan statistik sesuai data lostFounds", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: sampleItems, isLostFound: false } },
    });

    expect(statValue("Total")).toHaveTextContent("3");
    expect(statValue("Barang Hilang")).toHaveTextContent("1");
    expect(statValue("Barang Ditemukan")).toHaveTextContent("2");
    expect(statValue("Selesai")).toHaveTextContent("2");
  });

  it("menampilkan daftar laporan dengan badge status", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: sampleItems, isLostFound: false } },
    });

    expect(screen.getByText("Dompet Hilang")).toBeInTheDocument();
    expect(screen.getByText("Kunci Ditemukan")).toBeInTheDocument();
    expect(screen.getAllByText("Ditemukan", { selector: "span" })).toHaveLength(2);
    expect(screen.getByText("Hilang", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Dompet Hilang").closest("a")).toHaveAttribute("href", "/lost-founds/1");
  });

  it("menampilkan pesan memuat saat isLostFound true", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: [], isLostFound: true } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(/memuat data laporan/i);
  });

  it("menampilkan pesan kosong saat tidak ada data", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: [], isLostFound: false } },
    });
    expect(screen.getByText(/belum ada laporan yang cocok/i)).toBeInTheDocument();
  });

  it("mencari berdasarkan judul memfilter daftar secara client-side", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: sampleItems, isLostFound: false } },
    });

    await user.type(screen.getByPlaceholderText(/cari judul laporan/i), "Dompet");

    expect(screen.getByText("Dompet Hilang")).toBeInTheDocument();
    expect(screen.queryByText("Kunci Ditemukan")).not.toBeInTheDocument();
  });

  it("hanya filter Milik Saya yang memanggil ulang asyncFetchLostFounds", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: [], isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: "Milik Saya" }));
    expect(fetchSpy).toHaveBeenLastCalledWith({ is_me: 1 });

    await user.click(screen.getByRole("button", { name: "Milik Saya" }));
    expect(fetchSpy).toHaveBeenLastCalledWith({});
  });

  it("filter status dan selesai bekerja di sisi klien tanpa mengubah statistik", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: sampleItems, isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: "Hilang" }));
    expect(screen.getByText("Dompet Hilang")).toBeInTheDocument();
    expect(screen.queryByText("Kunci Ditemukan")).not.toBeInTheDocument();
    expect(statValue("Total")).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: "Semua" }));
    await user.click(screen.getByRole("button", { name: "Selesai" }));
    expect(screen.queryByText("Dompet Hilang")).not.toBeInTheDocument();
    expect(screen.getByText("Kunci Ditemukan")).toBeInTheDocument();
  });

  it("tidak crash saat data dari store bukan array", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: { lost_founds: [] }, isLostFound: false } },
    });
    expect(screen.getByText(/belum ada laporan yang cocok/i)).toBeInTheDocument();
  });

  it("menampilkan cover dan deskripsi bila tersedia", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        lostFounds: {
          lostFounds: [{ id: 9, title: "Tas", status: "lost", cover: "tas.jpg", description: "Tas hitam" }],
          isLostFound: false,
        },
      },
    });
    expect(screen.getByText("Tas hitam")).toBeInTheDocument();
    expect(document.querySelector('img[src="tas.jpg"]')).toBeInTheDocument();
  });

  it("klik Tambah Laporan membuka AddModal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, {
      preloadedState: { lostFounds: { lostFounds: [], isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: /tambah laporan/i }));
    expect(screen.getByTestId("add-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.queryByTestId("add-form")).not.toBeInTheDocument();
  });

  it("tetap menampilkan laporan yang tidak punya created_at", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        lostFounds: {
          lostFounds: [
            { id: 10, title: "Tanpa Tanggal A", status: "lost", is_completed: 0 },
            { id: 11, title: "Tanpa Tanggal B", status: "lost", is_completed: 0 },
          ],
          isLostFound: false,
        },
      },
    });

    expect(screen.getByText("Tanpa Tanggal A")).toBeInTheDocument();
    expect(screen.getByText("Tanpa Tanggal B")).toBeInTheDocument();
  });
});