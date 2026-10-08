import { describe, it, expect, vi, afterEach } from "vitest";
import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncFetchMe,
  asyncLoginUser,
  asyncRegisterUser,
  asyncLogoutUser,
} from "./action";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  setUser,
  clearUser,
} from "./reducer";

vi.mock("../api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn(), getMe: vi.fn() },
}));
vi.mock("../../../helpers/apiHelper", () => ({
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(true),
  showErrorDialog: vi.fn().mockResolvedValue(true),
}));

describe("auth async actions", () => {
  afterEach(() => vi.clearAllMocks());

  it("asyncFetchMe sukses: dispatch setUser", async () => {
    authApi.getMe.mockResolvedValue({ data: { id: 1 } });
    const dispatch = vi.fn();
    await asyncFetchMe()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(setUser({ id: 1 }));
  });

  it("asyncFetchMe sukses tanpa data: dispatch setUser(null)", async () => {
    authApi.getMe.mockResolvedValue(undefined);
    const dispatch = vi.fn();
    await asyncFetchMe()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(setUser(null));
  });

  it("asyncFetchMe gagal: dispatch clearUser", async () => {
    authApi.getMe.mockRejectedValue(new Error("x"));
    const dispatch = vi.fn();
    await asyncFetchMe()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(clearUser());
  });

  it("asyncLoginUser sukses: simpan token dan return true", async () => {
    authApi.login.mockResolvedValue({ data: { token: "tkn" } });
    const dispatch = vi.fn();
    const result = await asyncLoginUser({ email: "a@b.c", password: "123456" })(dispatch);
    expect(dispatch).toHaveBeenCalledWith(loginStart());
    expect(putAccessToken).toHaveBeenCalledWith("tkn");
    expect(dispatch).toHaveBeenCalledWith(loginSuccess());
    expect(result).toBe(true);
  });

  it("asyncLoginUser gagal: dispatch failure dan return false", async () => {
    authApi.login.mockRejectedValue(new Error("Email atau sandi salah"));
    const dispatch = vi.fn();
    const result = await asyncLoginUser({ email: "a", password: "b" })(dispatch);
    expect(dispatch).toHaveBeenCalledWith(loginFailure());
    expect(showErrorDialog).toHaveBeenCalledWith("Email atau sandi salah");
    expect(result).toBe(false);
  });

  it("asyncRegisterUser sukses: dialog sukses dan return true", async () => {
    authApi.register.mockResolvedValue({});
    const dispatch = vi.fn();
    const result = await asyncRegisterUser({ name: "A", email: "a@b.c", password: "123456" })(dispatch);
    expect(dispatch).toHaveBeenCalledWith(registerStart());
    expect(dispatch).toHaveBeenCalledWith(registerSuccess());
    expect(showSuccessDialog).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("asyncRegisterUser gagal: dispatch failure dan return false", async () => {
    authApi.register.mockRejectedValue(new Error("Email sudah terdaftar"));
    const dispatch = vi.fn();
    const result = await asyncRegisterUser({ name: "A", email: "a", password: "b" })(dispatch);
    expect(dispatch).toHaveBeenCalledWith(registerFailure());
    expect(result).toBe(false);
  });

  it("asyncLogoutUser menghapus token dan user", () => {
    const dispatch = vi.fn();
    asyncLogoutUser()(dispatch);
    expect(removeAccessToken).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(clearUser());
  });
});
