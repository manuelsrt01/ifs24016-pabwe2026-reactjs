import { describe, it, expect, vi, afterEach } from "vitest";
import lostFoundApi from "../api/lostFoundApi";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import {
  asyncFetchLostFounds,
  asyncFetchLostFound,
  asyncAddLostFound,
  asyncChangeLostFound,
  asyncChangeLostFoundCover,
  asyncDeleteLostFound,
  asyncFetchLostFoundStats,
} from "./action";
import {
  fetchLostFoundsStart,
  fetchLostFoundsSuccess,
  fetchLostFoundsFailure,
  fetchLostFoundStart,
  fetchLostFoundSuccess,
  fetchLostFoundFailure,
  addLostFoundStart,
  addLostFoundSuccess,
  addLostFoundFailure,
  changeLostFoundStart,
  changeLostFoundSuccess,
  changeLostFoundFailure,
  changeLostFoundCoverStart,
  changeLostFoundCoverSuccess,
  changeLostFoundCoverFailure,
  deleteLostFoundStart,
  deleteLostFoundSuccess,
  deleteLostFoundFailure,
  setLostFoundStats,
} from "./reducer";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFound: vi.fn(),
    addLostFound: vi.fn(),
    changeLostFound: vi.fn(),
    changeLostFoundCover: vi.fn(),
    deleteLostFound: vi.fn(),
    getDailyStats: vi.fn(),
    getMonthlyStats: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(true),
  showErrorDialog: vi.fn().mockResolvedValue(true),
  showConfirmDialog: vi.fn().mockResolvedValue(true),
}));

describe("lostFounds async actions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("asyncFetchLostFounds sukses: dispatch start & success", async () => {
    lostFoundApi.getLostFounds.mockResolvedValue({ data: [{ id: 1 }] });
    const dispatch = vi.fn();

    await asyncFetchLostFounds({ status: "lost" })(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundsStart());
    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundsSuccess([{ id: 1 }]));
  });

  it("asyncFetchLostFounds tanpa data memakai array kosong", async () => {
    lostFoundApi.getLostFounds.mockResolvedValue(undefined);
    const dispatch = vi.fn();

    await asyncFetchLostFounds()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundsSuccess([]));
  });

  it("asyncFetchLostFounds gagal: dispatch failure dan error dialog", async () => {
    lostFoundApi.getLostFounds.mockRejectedValue(new Error("Gagal memuat"));
    const dispatch = vi.fn();

    await asyncFetchLostFounds()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundsFailure());
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
  });

  it("asyncFetchLostFound sukses: dispatch start & success", async () => {
    lostFoundApi.getLostFound.mockResolvedValue({ data: { id: 1, title: "Dompet" } });
    const dispatch = vi.fn();

    await asyncFetchLostFound(1)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundStart());
    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundSuccess({ id: 1, title: "Dompet" }));
  });

  it("asyncFetchLostFound tanpa data memakai null", async () => {
    lostFoundApi.getLostFound.mockResolvedValue(undefined);
    const dispatch = vi.fn();

    await asyncFetchLostFound(1)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundSuccess(null));
  });

  it("asyncFetchLostFound gagal: dispatch failure dan error dialog", async () => {
    lostFoundApi.getLostFound.mockRejectedValue(new Error("Tidak ditemukan"));
    const dispatch = vi.fn();

    await asyncFetchLostFound(1)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchLostFoundFailure());
    expect(showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan");
  });

  it("asyncAddLostFound sukses: dispatch success dan return true", async () => {
    lostFoundApi.addLostFound.mockResolvedValue({ data: { id: 1 } });
    const dispatch = vi.fn();

    const result = await asyncAddLostFound({ title: "Dompet" })(dispatch);

    expect(dispatch).toHaveBeenCalledWith(addLostFoundStart());
    expect(dispatch).toHaveBeenCalledWith(addLostFoundSuccess());
    expect(showSuccessDialog).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("asyncAddLostFound gagal: dispatch failure dan return false", async () => {
    lostFoundApi.addLostFound.mockRejectedValue(new Error("Judul wajib diisi"));
    const dispatch = vi.fn();

    const result = await asyncAddLostFound({})(dispatch);

    expect(dispatch).toHaveBeenCalledWith(addLostFoundFailure());
    expect(result).toBe(false);
  });

  it("asyncAddLostFound dengan cover: id langsung dari respons dipakai untuk unggah cover", async () => {
    lostFoundApi.addLostFound.mockResolvedValue({ data: { id: 7 } });
    lostFoundApi.changeLostFoundCover.mockResolvedValue({});
    const dispatch = vi.fn();
    const file = new File(["x"], "cover.png");

    const result = await asyncAddLostFound({ title: "Dompet" }, file)(dispatch);

    expect(lostFoundApi.changeLostFoundCover).toHaveBeenCalledWith(7, file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Laporan berhasil ditambahkan.");
    expect(result).toBe(true);
  });

  it("asyncAddLostFound dengan cover: id dibaca dari lost_found_id atau lost_found.id", async () => {
    lostFoundApi.changeLostFoundCover.mockResolvedValue({});
    const file = new File(["x"], "cover.png");

    lostFoundApi.addLostFound.mockResolvedValueOnce({ data: { lost_found_id: 8 } });
    await asyncAddLostFound({ title: "A" }, file)(vi.fn());
    expect(lostFoundApi.changeLostFoundCover).toHaveBeenLastCalledWith(8, file);

    lostFoundApi.addLostFound.mockResolvedValueOnce({ data: { lost_found: { id: 9 } } });
    await asyncAddLostFound({ title: "B" }, file)(vi.fn());
    expect(lostFoundApi.changeLostFoundCover).toHaveBeenLastCalledWith(9, file);
  });

  it("asyncAddLostFound dengan cover: id dicari dari daftar saat respons tanpa id", async () => {
    lostFoundApi.addLostFound.mockResolvedValue({ data: {} });
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: {
        lost_founds: [
          { id: 3, title: "Dompet", description: "Kantin" },
          { id: 5, title: "Dompet", description: "Kantin" },
          { id: 6, title: "Lain", description: "Lain" },
        ],
      },
    });
    lostFoundApi.changeLostFoundCover.mockResolvedValue({});
    const file = new File(["x"], "cover.png");

    const result = await asyncAddLostFound(
      { title: "Dompet", description: "Kantin" },
      file
    )(vi.fn());

    expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({ is_me: 1 });
    expect(lostFoundApi.changeLostFoundCover).toHaveBeenCalledWith(5, file);
    expect(result).toBe(true);
  });

  it("asyncAddLostFound dengan cover: laporan baru tidak ditemukan tetap sukses dengan pesan peringatan", async () => {
    lostFoundApi.addLostFound.mockResolvedValue(undefined);
    lostFoundApi.getLostFounds.mockResolvedValue({ data: { lost_founds: [] } });
    const file = new File(["x"], "cover.png");

    const result = await asyncAddLostFound({ title: "X", description: "Y" }, file)(vi.fn());

    expect(lostFoundApi.changeLostFoundCover).not.toHaveBeenCalled();
    expect(showSuccessDialog).toHaveBeenCalledWith(
      expect.stringContaining("gambar gagal diunggah")
    );
    expect(result).toBe(true);
  });

  it("asyncAddLostFound dengan cover: unggah cover gagal tetap sukses dengan pesan peringatan", async () => {
    lostFoundApi.addLostFound.mockResolvedValue({ data: { id: 4 } });
    lostFoundApi.changeLostFoundCover.mockRejectedValue(new Error("gagal"));
    const file = new File(["x"], "cover.png");

    const result = await asyncAddLostFound({ title: "X" }, file)(vi.fn());

    expect(showSuccessDialog).toHaveBeenCalledWith(
      expect.stringContaining("gambar gagal diunggah")
    );
    expect(result).toBe(true);
  });

  it("asyncChangeLostFound sukses: dispatch success dengan payload", async () => {
    lostFoundApi.changeLostFound.mockResolvedValue({ data: {} });
    const dispatch = vi.fn();
    const payload = { title: "Baru" };

    const result = await asyncChangeLostFound(1, payload)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeLostFoundStart());
    expect(dispatch).toHaveBeenCalledWith(changeLostFoundSuccess(payload));
    expect(result).toBe(true);
  });

  it("asyncChangeLostFound gagal: dispatch failure dan return false", async () => {
    lostFoundApi.changeLostFound.mockRejectedValue(new Error("Gagal update"));
    const dispatch = vi.fn();

    const result = await asyncChangeLostFound(1, {})(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeLostFoundFailure());
    expect(result).toBe(false);
  });

  it("asyncChangeLostFoundCover sukses: dispatch success dengan url cover", async () => {
    lostFoundApi.changeLostFoundCover.mockResolvedValue({ data: { cover: "baru.jpg" } });
    const dispatch = vi.fn();
    const file = new File(["x"], "cover.png");

    const result = await asyncChangeLostFoundCover(1, file)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeLostFoundCoverStart());
    expect(dispatch).toHaveBeenCalledWith(changeLostFoundCoverSuccess("baru.jpg"));
    expect(result).toBe(true);
  });

  it("asyncChangeLostFoundCover gagal: dispatch failure dan return false", async () => {
    lostFoundApi.changeLostFoundCover.mockRejectedValue(new Error("Gagal unggah"));
    const dispatch = vi.fn();

    const result = await asyncChangeLostFoundCover(1, new File(["x"], "c.png"))(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeLostFoundCoverFailure());
    expect(result).toBe(false);
  });

  it("asyncDeleteLostFound: tidak menghapus jika tidak dikonfirmasi", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    const dispatch = vi.fn();

    const result = await asyncDeleteLostFound(1)(dispatch);

    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(deleteLostFoundStart());
    expect(result).toBe(false);
  });

  it("asyncDeleteLostFound sukses: dispatch success dan return true", async () => {
    showConfirmDialog.mockResolvedValueOnce(true);
    lostFoundApi.deleteLostFound.mockResolvedValue({});
    const dispatch = vi.fn();

    const result = await asyncDeleteLostFound(1)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(deleteLostFoundStart());
    expect(dispatch).toHaveBeenCalledWith(deleteLostFoundSuccess(1));
    expect(result).toBe(true);
  });

  it("asyncDeleteLostFound gagal: dispatch failure dan return false", async () => {
    showConfirmDialog.mockResolvedValueOnce(true);
    lostFoundApi.deleteLostFound.mockRejectedValue(new Error("Gagal hapus"));
    const dispatch = vi.fn();

    const result = await asyncDeleteLostFound(1)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(deleteLostFoundFailure());
    expect(result).toBe(false);
  });

  it("asyncFetchLostFoundStats sukses: dispatch setLostFoundStats", async () => {
    lostFoundApi.getDailyStats.mockResolvedValue({ data: [1, 2] });
    lostFoundApi.getMonthlyStats.mockResolvedValue({ data: [3] });
    const dispatch = vi.fn();

    await asyncFetchLostFoundStats()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(setLostFoundStats({ daily: [1, 2], monthly: [3] }));
  });

  it("asyncFetchLostFoundStats tanpa data memakai array kosong", async () => {
    lostFoundApi.getDailyStats.mockResolvedValue(undefined);
    lostFoundApi.getMonthlyStats.mockResolvedValue(undefined);
    const dispatch = vi.fn();

    await asyncFetchLostFoundStats()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(setLostFoundStats({ daily: [], monthly: [] }));
  });

  it("asyncFetchLostFoundStats gagal: menampilkan error dialog", async () => {
    lostFoundApi.getDailyStats.mockRejectedValue(new Error("Gagal statistik"));
    const dispatch = vi.fn();

    await asyncFetchLostFoundStats()(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal statistik");
  });
});