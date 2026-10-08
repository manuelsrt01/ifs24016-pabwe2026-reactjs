import { describe, it, expect, vi, afterEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

describe("toolsHelper", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("showSuccessDialog menampilkan dialog sukses", async () => {
    Swal.fire.mockResolvedValue({});
    await showSuccessDialog("OK");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", text: "OK" })
    );
  });

  it("showErrorDialog menampilkan dialog error", async () => {
    Swal.fire.mockResolvedValue({});
    await showErrorDialog("Gagal");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "Gagal" })
    );
  });

  it("showConfirmDialog mengembalikan true saat dikonfirmasi", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    expect(await showConfirmDialog("Hapus?")).toBe(true);
  });

  it("showConfirmDialog mengembalikan false saat dibatalkan", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    expect(await showConfirmDialog("Hapus?")).toBe(false);
  });

  it("formatDate memformat tanggal valid", () => {
    expect(formatDate("2026-01-05")).toMatch(/2026/);
  });

  it("formatDate mengembalikan '-' untuk nilai kosong atau tidak valid", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("bukan-tanggal")).toBe("-");
  });
});
