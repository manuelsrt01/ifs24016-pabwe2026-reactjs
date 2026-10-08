import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders, screen, waitFor } from "../../../test-utils";
import * as lostFoundAction from "../states/action";
import ChangeCoverModal from "./ChangeCoverModal";

describe("ChangeCoverModal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tidak merender apapun saat isOpen false", () => {
    renderWithProviders(
      <ChangeCoverModal isOpen={false} onClose={() => {}} lostFoundId={1} />
    );
    expect(screen.queryByTestId("cover-form")).not.toBeInTheDocument();
  });

  it("tombol Unggah nonaktif selama belum ada berkas dipilih", () => {
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={() => {}} lostFoundId={1} />
    );
    expect(screen.getByRole("button", { name: /unggah/i })).toBeDisabled();
  });

  it("memilih berkas menampilkan pratinjau dan mengaktifkan tombol Unggah", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={() => {}} lostFoundId={1} />
    );

    const file = new File(["isi"], "cover.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih berkas cover/i), file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /unggah/i })).toBeEnabled();
    });
    expect(await screen.findByAltText(/pratinjau cover/i)).toBeInTheDocument();
  });

  it("mengabaikan perubahan input tanpa berkas", () => {
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={() => {}} lostFoundId={1} />
    );
    fireEvent.change(screen.getByLabelText(/pilih berkas cover/i), {
      target: { files: [] },
    });
    expect(screen.getByRole("button", { name: /unggah/i })).toBeDisabled();
  });

  it("submit tanpa berkas tidak memanggil action", () => {
    const spy = vi.spyOn(lostFoundAction, "asyncChangeLostFoundCover");
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={() => {}} lostFoundId={1} />
    );
    fireEvent.submit(screen.getByTestId("cover-form"));
    expect(spy).not.toHaveBeenCalled();
  });

  it("submit memanggil asyncChangeLostFoundCover dan menutup modal saat sukses", async () => {
    const dispatchSpy = vi
      .spyOn(lostFoundAction, "asyncChangeLostFoundCover")
      .mockReturnValue(async () => true);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} lostFoundId={1} />
    );

    const file = new File(["isi"], "cover.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih berkas cover/i), file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /unggah/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /unggah/i }));

    expect(dispatchSpy).toHaveBeenCalledWith(1, file);
    expect(onClose).toHaveBeenCalled();
  });

  it("tidak menutup modal saat upload gagal", async () => {
    vi.spyOn(lostFoundAction, "asyncChangeLostFoundCover").mockReturnValue(
      async () => false
    );
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} lostFoundId={1} />
    );

    const file = new File(["isi"], "cover.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih berkas cover/i), file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /unggah/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /unggah/i }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal dan ikon tutup memanggil onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} lostFoundId={1} />
    );
    await user.click(screen.getByRole("button", { name: /batal/i }));
    await user.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
