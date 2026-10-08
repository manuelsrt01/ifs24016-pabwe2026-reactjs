import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders, screen, waitFor } from "../../../test-utils";
import * as lostFoundAction from "../states/action";
import AddModal from "./AddModal";

describe("AddModal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tidak merender apapun saat isOpen false", () => {
    renderWithProviders(<AddModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByTestId("add-form")).not.toBeInTheDocument();
  });

  it("merender form saat isOpen true", () => {
    renderWithProviders(<AddModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByTestId("add-form")).toBeInTheDocument();
  });

  it("submit form memanggil asyncAddLostFound dan onClose saat sukses", async () => {
    const dispatchSpy = vi
      .spyOn(lostFoundAction, "asyncAddLostFound")
      .mockReturnValue(async () => true);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    await user.type(screen.getByLabelText(/judul/i), "Dompet Hilang");
    await user.type(screen.getByLabelText(/deskripsi/i), "Hilang di kantin");
    await user.selectOptions(screen.getByLabelText(/jenis laporan/i), "found");
    await user.click(screen.getByRole("button", { name: /simpan/i }));

    expect(dispatchSpy).toHaveBeenCalledWith({
      title: "Dompet Hilang",
      description: "Hilang di kantin",
      status: "found",
    });
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByLabelText(/judul/i)).toHaveValue("");
    expect(screen.getByLabelText(/jenis laporan/i)).toHaveValue("lost");
  });

  it("tidak memanggil onClose saat gagal menambah", async () => {
    vi.spyOn(lostFoundAction, "asyncAddLostFound").mockReturnValue(async () => false);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    await user.type(screen.getByLabelText(/judul/i), "Dompet Hilang");
    await user.type(screen.getByLabelText(/deskripsi/i), "Hilang di kantin");
    await user.click(screen.getByRole("button", { name: /simpan/i }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("klik tombol Batal memanggil onClose tanpa submit", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /batal/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("klik ikon tutup memanggil onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    await user.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalled();
  });

  it("memilih gambar menampilkan pratinjau dan submit mengirim file", async () => {
    const dispatchSpy = vi
      .spyOn(lostFoundAction, "asyncAddLostFound")
      .mockReturnValue(async () => true);
    const onAdded = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<AddModal isOpen={true} onClose={() => {}} onAdded={onAdded} />);

    const file = new File(["isi"], "dompet.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih gambar laporan/i), file);
    expect(await screen.findByAltText(/pratinjau gambar/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/judul/i), "Dompet");
    await user.type(screen.getByLabelText(/deskripsi/i), "Di kantin");
    await user.click(screen.getByRole("button", { name: /simpan/i }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      { title: "Dompet", description: "Di kantin", status: "lost" },
      file
    );
    await waitFor(() => expect(onAdded).toHaveBeenCalled());
  });

  it("tombol hapus gambar menghilangkan pratinjau", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={() => {}} />);

    const file = new File(["isi"], "dompet.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih gambar laporan/i), file);
    await screen.findByAltText(/pratinjau gambar/i);

    await user.click(screen.getByLabelText(/hapus gambar/i));
    expect(screen.queryByAltText(/pratinjau gambar/i)).not.toBeInTheDocument();
  });

  it("menolak gambar lebih dari 5 MB dan menampilkan pesan error", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={() => {}} />);

    const big = new File(["isi"], "besar.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 6 * 1024 * 1024 });
    await user.upload(screen.getByLabelText(/pilih gambar laporan/i), big);

    expect(await screen.findByRole("alert")).toHaveTextContent(/maksimal 5 mb/i);
    expect(screen.queryByAltText(/pratinjau gambar/i)).not.toBeInTheDocument();
  });

  it("mengabaikan perubahan input gambar tanpa berkas", () => {
    renderWithProviders(<AddModal isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/pilih gambar laporan/i), {
      target: { files: [] },
    });
    expect(screen.queryByAltText(/pratinjau gambar/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});