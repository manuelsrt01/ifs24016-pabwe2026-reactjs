import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../../test-utils";
import * as lostFoundAction from "../states/action";
import ChangeModal from "./ChangeModal";

const sampleLostFound = {
  id: 1,
  title: "Dompet",
  description: "Warna coklat",
  status: "lost",
  is_completed: 0,
};

describe("ChangeModal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tidak merender apapun saat isOpen false", () => {
    renderWithProviders(
      <ChangeModal isOpen={false} onClose={() => {}} lostFound={sampleLostFound} />
    );
    expect(screen.queryByTestId("change-form")).not.toBeInTheDocument();
  });

  it("mengisi form otomatis dari data lostFound saat dibuka", () => {
    renderWithProviders(
      <ChangeModal isOpen={true} onClose={() => {}} lostFound={sampleLostFound} />
    );
    expect(screen.getByLabelText(/judul/i)).toHaveValue("Dompet");
    expect(screen.getByLabelText(/deskripsi/i)).toHaveValue("Warna coklat");
    expect(screen.getByLabelText(/tandai sudah selesai/i)).not.toBeChecked();
  });

  it("memakai nilai default saat field lostFound kosong", () => {
    renderWithProviders(
      <ChangeModal isOpen={true} onClose={() => {}} lostFound={{ id: 2 }} />
    );
    expect(screen.getByLabelText(/judul/i)).toHaveValue("");
    expect(screen.getByLabelText(/jenis laporan/i)).toHaveValue("lost");
  });

  it("tetap merender form kosong saat lostFound belum ada", () => {
    renderWithProviders(<ChangeModal isOpen={true} onClose={() => {}} lostFound={null} />);
    expect(screen.getByLabelText(/judul/i)).toHaveValue("");
  });

  it("submit memanggil asyncChangeLostFound dengan data terbaru dan menutup modal saat sukses", async () => {
    const dispatchSpy = vi
      .spyOn(lostFoundAction, "asyncChangeLostFound")
      .mockReturnValue(async () => true);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChangeModal isOpen={true} onClose={onClose} lostFound={sampleLostFound} />
    );

    await user.click(screen.getByLabelText(/tandai sudah selesai/i));
    await user.click(screen.getByRole("button", { name: /simpan perubahan/i }));

    expect(dispatchSpy).toHaveBeenCalledWith(1, {
      title: "Dompet",
      description: "Warna coklat",
      status: "lost",
      is_completed: 1,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("mengirim is_completed 0 saat tidak dicentang", async () => {
    const dispatchSpy = vi
      .spyOn(lostFoundAction, "asyncChangeLostFound")
      .mockReturnValue(async () => true);
    const user = userEvent.setup();

    renderWithProviders(
      <ChangeModal isOpen={true} onClose={() => {}} lostFound={sampleLostFound} />
    );
    await user.selectOptions(screen.getByLabelText(/jenis laporan/i), "found");
    await user.click(screen.getByRole("button", { name: /simpan perubahan/i }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: "found", is_completed: 0 })
    );
  });

  it("tidak menutup modal saat gagal menyimpan perubahan", async () => {
    vi.spyOn(lostFoundAction, "asyncChangeLostFound").mockReturnValue(async () => false);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChangeModal isOpen={true} onClose={onClose} lostFound={sampleLostFound} />
    );

    await user.click(screen.getByRole("button", { name: /simpan perubahan/i }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal dan ikon tutup memanggil onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ChangeModal isOpen={true} onClose={onClose} lostFound={sampleLostFound} />
    );

    await user.click(screen.getByRole("button", { name: /batal/i }));
    await user.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
