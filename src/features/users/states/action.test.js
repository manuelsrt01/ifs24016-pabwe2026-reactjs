import { describe, it, expect, vi, afterEach } from "vitest";
import userApi from "../api/userApi";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncFetchUsers,
  asyncFetchProfile,
  asyncChangeProfile,
  asyncChangeProfilePhoto,
  asyncChangeProfilePassword,
} from "./action";
import {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  changeProfileStart,
  changeProfileSuccess,
  changeProfileFailure,
  changeProfilePhotoStart,
  changeProfilePhotoSuccess,
  changeProfilePhotoFailure,
  changeProfilePasswordStart,
  changeProfilePasswordSuccess,
  changeProfilePasswordFailure,
} from "./reducer";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(),
    getProfile: vi.fn(),
    changeProfile: vi.fn(),
    changeProfilePhoto: vi.fn(),
    changeProfilePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(true),
  showErrorDialog: vi.fn().mockResolvedValue(true),
}));

describe("users async actions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("asyncFetchUsers sukses: dispatch start & success", async () => {
    userApi.getUsers.mockResolvedValue({ data: [{ id: 1 }] });
    const dispatch = vi.fn();

    await asyncFetchUsers()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchUsersStart());
    expect(dispatch).toHaveBeenCalledWith(fetchUsersSuccess([{ id: 1 }]));
  });

  it("asyncFetchUsers tanpa data memakai array kosong", async () => {
    userApi.getUsers.mockResolvedValue(undefined);
    const dispatch = vi.fn();
    await asyncFetchUsers()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(fetchUsersSuccess([]));
  });

  it("asyncFetchUsers gagal: dispatch failure dan error dialog", async () => {
    userApi.getUsers.mockRejectedValue(new Error("Gagal memuat pengguna"));
    const dispatch = vi.fn();

    await asyncFetchUsers()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchUsersFailure());
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat pengguna");
  });

  it("asyncFetchProfile sukses: dispatch start & success", async () => {
    userApi.getProfile.mockResolvedValue({ data: { id: 1, name: "Budi" } });
    const dispatch = vi.fn();

    await asyncFetchProfile()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchProfileStart());
    expect(dispatch).toHaveBeenCalledWith(fetchProfileSuccess({ id: 1, name: "Budi" }));
  });

  it("asyncFetchProfile tanpa data memakai null", async () => {
    userApi.getProfile.mockResolvedValue(undefined);
    const dispatch = vi.fn();
    await asyncFetchProfile()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(fetchProfileSuccess(null));
  });

  it("asyncFetchProfile gagal: dispatch failure dan error dialog", async () => {
    userApi.getProfile.mockRejectedValue(new Error("Sesi berakhir"));
    const dispatch = vi.fn();

    await asyncFetchProfile()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(fetchProfileFailure());
    expect(showErrorDialog).toHaveBeenCalledWith("Sesi berakhir");
  });

  it("asyncChangeProfile sukses: dispatch success dan return true", async () => {
    userApi.changeProfile.mockResolvedValue({ data: {} });
    const dispatch = vi.fn();
    const payload = { name: "Budi Santoso" };

    const result = await asyncChangeProfile(payload)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeProfileStart());
    expect(dispatch).toHaveBeenCalledWith(changeProfileSuccess(payload));
    expect(showSuccessDialog).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("asyncChangeProfile gagal: dispatch failure dan return false", async () => {
    userApi.changeProfile.mockRejectedValue(new Error("Nama wajib diisi"));
    const dispatch = vi.fn();

    const result = await asyncChangeProfile({})(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeProfileFailure());
    expect(result).toBe(false);
  });

  it("asyncChangeProfilePhoto sukses: dispatch success dengan url foto", async () => {
    userApi.changeProfilePhoto.mockResolvedValue({ data: { photo: "baru.jpg" } });
    const dispatch = vi.fn();
    const file = new File(["x"], "foto.png");

    const result = await asyncChangeProfilePhoto(file)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeProfilePhotoStart());
    expect(dispatch).toHaveBeenCalledWith(changeProfilePhotoSuccess("baru.jpg"));
    expect(result).toBe(true);
  });

  it("asyncChangeProfilePhoto gagal: dispatch failure dan return false", async () => {
    userApi.changeProfilePhoto.mockRejectedValue(new Error("Gagal unggah foto"));
    const dispatch = vi.fn();

    const result = await asyncChangeProfilePhoto(new File(["x"], "f.png"))(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeProfilePhotoFailure());
    expect(result).toBe(false);
  });

  it("asyncChangeProfilePassword sukses: dispatch success dan return true", async () => {
    userApi.changeProfilePassword.mockResolvedValue({});
    const dispatch = vi.fn();
    const payload = { current_password: "lama", new_password: "baru" };

    const result = await asyncChangeProfilePassword(payload)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeProfilePasswordStart());
    expect(dispatch).toHaveBeenCalledWith(changeProfilePasswordSuccess());
    expect(result).toBe(true);
  });

  it("asyncChangeProfilePassword gagal: dispatch failure dan return false", async () => {
    userApi.changeProfilePassword.mockRejectedValue(new Error("Kata sandi salah"));
    const dispatch = vi.fn();

    const result = await asyncChangeProfilePassword({})(dispatch);

    expect(dispatch).toHaveBeenCalledWith(changeProfilePasswordFailure());
    expect(result).toBe(false);
  });
});
