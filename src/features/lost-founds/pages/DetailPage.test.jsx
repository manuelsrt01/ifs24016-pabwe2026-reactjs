import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../../test-utils";
import * as lostFoundAction from "../states/action";
import DetailPage from "./DetailPage";

const mockNavigate = vi.fn();
const mockParams = { id: "1" };
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

const sampleLostFound = {
  id: 1,
  title: "Dompet",
  description: "Warna coklat",
  status: "lost",
  is_completed: 0,
  created_at: "2026-01-01",
  user: { name: "Budi" },
};

describe("DetailPage", () => {
  let fetchSpy;

  beforeEach(() => {
    mockParams.id = "1";
    fetchSpy = vi.spyOn(lostFoundAction, "asyncFetchLostFound").mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it("memanggil asyncFetchLostFound dengan id dari URL", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: null, isLostFound: false } },
    });
    expect(fetchSpy).toHaveBeenCalledWith("1");
  });

  it("tidak memanggil asyncFetchLostFound saat id tidak ada", () => {
    mockParams.id = undefined;
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: null, isLostFound: false } },
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("menampilkan status memuat saat isLostFound true dan data belum ada", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: null, isLostFound: true } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(/memuat detail laporan/i);
  });

  it("menampilkan pesan tidak ditemukan saat lostFound null", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: null, isLostFound: false } },
    });
    expect(screen.getByText(/laporan tidak ditemukan/i)).toBeInTheDocument();
  });

  it("menampilkan detail laporan dengan lengkap", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: sampleLostFound, isLostFound: false } },
    });

    expect(screen.getByText("Dompet")).toBeInTheDocument();
    expect(screen.getByText("Warna coklat")).toBeInTheDocument();
    expect(screen.getByText("Barang Hilang")).toBeInTheDocument();
    expect(screen.getByText("Belum selesai")).toBeInTheDocument();
    expect(screen.getByText(/dilaporkan oleh budi/i)).toBeInTheDocument();
  });

  it("menampilkan cover, status ditemukan, selesai, dan pelapor default", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        lostFounds: {
          lostFound: {
            ...sampleLostFound,
            status: "found",
            is_completed: 1,
            cover: "cover.jpg",
            user: null,
          },
          isLostFound: false,
        },
      },
    });

    expect(screen.getByAltText("Dompet")).toHaveAttribute("src", "cover.jpg");
    expect(screen.getByText("Barang Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByText(/dilaporkan oleh pengguna/i)).toBeInTheDocument();
  });

  it("klik Ubah Data membuka dan menutup ChangeModal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: sampleLostFound, isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: /ubah data/i }));
    expect(screen.getByTestId("change-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.queryByTestId("change-form")).not.toBeInTheDocument();
  });

  it("klik Ubah Cover membuka dan menutup ChangeCoverModal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: sampleLostFound, isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: /ubah cover/i }));
    expect(screen.getByTestId("cover-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.queryByTestId("cover-form")).not.toBeInTheDocument();
  });

  it("klik Hapus memanggil asyncDeleteLostFound dan navigate saat sukses", async () => {
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncDeleteLostFound")
      .mockReturnValue(async () => true);
    const user = userEvent.setup();

    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: sampleLostFound, isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: /hapus/i }));

    expect(deleteSpy).toHaveBeenCalledWith("1");
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("tidak navigate saat hapus dibatalkan/gagal", async () => {
    vi.spyOn(lostFoundAction, "asyncDeleteLostFound").mockReturnValue(async () => false);
    const user = userEvent.setup();

    renderWithProviders(<DetailPage />, {
      preloadedState: { lostFounds: { lostFound: sampleLostFound, isLostFound: false } },
    });

    await user.click(screen.getByRole("button", { name: /hapus/i }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("menyembunyikan tombol ubah/hapus/cover bila bukan pemilik laporan", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        auth: { user: { id: 99 } },
        lostFounds: { lostFound: { ...sampleLostFound, user_id: 1 }, isLostFound: false },
      },
    });
    expect(screen.queryByRole("button", { name: /ubah data/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /hapus/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ubah cover/i })).not.toBeInTheDocument();
  });

  it("menampilkan tombol aksi bila pengguna adalah pemilik laporan", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        auth: { user: { id: 1 } },
        lostFounds: { lostFound: { ...sampleLostFound, user_id: 1 }, isLostFound: false },
      },
    });
    expect(screen.getByRole("button", { name: /ubah data/i })).toBeInTheDocument();
  });
});
