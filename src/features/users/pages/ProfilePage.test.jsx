import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders, screen, waitFor } from "../../../test-utils";
import * as userAction from "../states/action";
import ProfilePage from "./ProfilePage";

const sampleProfile = { id: 1, name: "Budi", email: "budi@mail.com", photo: null };
const withProfile = (profile = sampleProfile) => ({
  preloadedState: { users: { profile, isProfile: false } },
});

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.spyOn(userAction, "asyncFetchProfile").mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("memanggil asyncFetchProfile saat halaman dimuat", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { users: { profile: null, isProfile: true } },
    });
    expect(userAction.asyncFetchProfile).toHaveBeenCalled();
  });

  it("menampilkan status memuat saat isProfile true dan profile belum ada", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { users: { profile: null, isProfile: true } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(/memuat profil/i);
  });

  it("mengisi form otomatis dari data profile", () => {
    renderWithProviders(<ProfilePage />, withProfile());
    expect(screen.getByLabelText(/nama lengkap/i)).toHaveValue("Budi");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("budi@mail.com");
  });

  it("memakai string kosong saat name/email profile tidak ada", () => {
    renderWithProviders(<ProfilePage />, withProfile({ id: 2 }));
    expect(screen.getByLabelText(/nama lengkap/i)).toHaveValue("");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("");
  });

  it("menampilkan foto profil bila tersedia", () => {
    renderWithProviders(<ProfilePage />, withProfile({ ...sampleProfile, photo: "foto.jpg" }));
    expect(screen.getByAltText("Foto profil")).toHaveAttribute("src", "foto.jpg");
  });

  it("submit form profil memanggil asyncChangeProfile dengan data terbaru", async () => {
    const changeSpy = vi
      .spyOn(userAction, "asyncChangeProfile")
      .mockReturnValue(async () => true);
    const user = userEvent.setup();

    renderWithProviders(<ProfilePage />, withProfile());

    await user.clear(screen.getByLabelText(/nama lengkap/i));
    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.click(screen.getByRole("button", { name: /simpan profil/i }));

    expect(changeSpy).toHaveBeenCalledWith({
      name: "Budi Santoso",
      email: "budi@mail.com",
    });
  });

  it("tombol unggah foto nonaktif sebelum memilih berkas", () => {
    renderWithProviders(<ProfilePage />, withProfile());
    expect(screen.getByRole("button", { name: /^unggah$/i })).toBeDisabled();
  });

  it("memilih foto menampilkan pratinjau, submit memanggil asyncChangeProfilePhoto", async () => {
    const photoSpy = vi
      .spyOn(userAction, "asyncChangeProfilePhoto")
      .mockReturnValue(async () => true);
    const user = userEvent.setup();

    renderWithProviders(<ProfilePage />, withProfile());

    const file = new File(["isi"], "foto.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih foto profil/i), file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^unggah$/i })).toBeEnabled();
    });
    expect(await screen.findByAltText("Foto profil")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^unggah$/i }));

    expect(photoSpy).toHaveBeenCalledWith(file);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^unggah$/i })).toBeDisabled();
    });
  });

  it("upload foto gagal mempertahankan berkas terpilih", async () => {
    vi.spyOn(userAction, "asyncChangeProfilePhoto").mockReturnValue(async () => false);
    const user = userEvent.setup();

    renderWithProviders(<ProfilePage />, withProfile());

    const file = new File(["isi"], "foto.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/pilih foto profil/i), file);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^unggah$/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /^unggah$/i }));

    expect(screen.getByRole("button", { name: /^unggah$/i })).toBeEnabled();
  });

  it("mengabaikan perubahan input foto tanpa berkas", () => {
    renderWithProviders(<ProfilePage />, withProfile());
    fireEvent.change(screen.getByLabelText(/pilih foto profil/i), { target: { files: [] } });
    expect(screen.getByRole("button", { name: /^unggah$/i })).toBeDisabled();
  });

  it("submit foto tanpa berkas tidak memanggil action", () => {
    const spy = vi.spyOn(userAction, "asyncChangeProfilePhoto");
    renderWithProviders(<ProfilePage />, withProfile());
    fireEvent.submit(screen.getByTestId("photo-form"));
    expect(spy).not.toHaveBeenCalled();
  });

  it("menampilkan peringatan dan menonaktifkan tombol saat konfirmasi kata sandi tidak sama", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, withProfile());

    await user.type(screen.getByLabelText(/kata sandi saat ini/i), "lama123");
    await user.type(screen.getByLabelText(/^kata sandi baru$/i), "baru123");
    await user.type(screen.getByLabelText(/konfirmasi kata sandi baru/i), "beda123");

    expect(screen.getByText(/konfirmasi kata sandi tidak sama/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /perbarui kata sandi/i })).toBeDisabled();
  });

  it("submit kata sandi tidak memanggil action saat konfirmasi berbeda", async () => {
    const spy = vi.spyOn(userAction, "asyncChangeProfilePassword");
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, withProfile());

    await user.type(screen.getByLabelText(/kata sandi saat ini/i), "lama123");
    await user.type(screen.getByLabelText(/^kata sandi baru$/i), "baru123");
    await user.type(screen.getByLabelText(/konfirmasi kata sandi baru/i), "beda123");
    fireEvent.submit(screen.getByTestId("password-form"));

    expect(spy).not.toHaveBeenCalled();
  });

  it("submit form kata sandi yang valid memanggil action dan mengosongkan form", async () => {
    const passwordSpy = vi
      .spyOn(userAction, "asyncChangeProfilePassword")
      .mockReturnValue(async () => true);
    const user = userEvent.setup();

    renderWithProviders(<ProfilePage />, withProfile());

    await user.type(screen.getByLabelText(/kata sandi saat ini/i), "lama123");
    await user.type(screen.getByLabelText(/^kata sandi baru$/i), "baru123");
    await user.type(screen.getByLabelText(/konfirmasi kata sandi baru/i), "baru123");
    await user.click(screen.getByRole("button", { name: /perbarui kata sandi/i }));

    expect(passwordSpy).toHaveBeenCalledWith({
      current_password: "lama123",
      new_password: "baru123",
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/kata sandi saat ini/i)).toHaveValue("");
    });
  });

  it("form kata sandi tidak dikosongkan saat gagal", async () => {
    vi.spyOn(userAction, "asyncChangeProfilePassword").mockReturnValue(async () => false);
    const user = userEvent.setup();

    renderWithProviders(<ProfilePage />, withProfile());

    await user.type(screen.getByLabelText(/kata sandi saat ini/i), "lama123");
    await user.type(screen.getByLabelText(/^kata sandi baru$/i), "baru123");
    await user.type(screen.getByLabelText(/konfirmasi kata sandi baru/i), "baru123");
    await user.click(screen.getByRole("button", { name: /perbarui kata sandi/i }));

    expect(screen.getByLabelText(/kata sandi saat ini/i)).toHaveValue("lama123");
  });
});