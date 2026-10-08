import { describe, it, expect, vi, afterEach } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import userApi from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: vi.fn(),
}));

describe("userApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getUsers memanggil GET /users", async () => {
    apiHelper.mockResolvedValue({ data: [] });
    await userApi.getUsers();
    expect(apiHelper).toHaveBeenCalledWith("/users", { method: "GET" });
  });

  it("getProfile memanggil GET /users/me", async () => {
    apiHelper.mockResolvedValue({ data: {} });
    await userApi.getProfile();
    expect(apiHelper).toHaveBeenCalledWith("/users/me", { method: "GET" });
  });

  it("changeProfile memanggil PUT /users/me dengan body data", async () => {
    apiHelper.mockResolvedValue({ data: {} });
    const payload = { name: "Budi", bio: "Mahasiswa" };
    await userApi.changeProfile(payload);
    expect(apiHelper).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: payload,
    });
  });

  it("changeProfilePhoto mengirim FormData ke endpoint photo", async () => {
    apiHelper.mockResolvedValue({ data: { photo: "foto.jpg" } });
    const file = new File(["isi"], "foto.png", { type: "image/png" });

    await userApi.changeProfilePhoto(file);

    expect(apiHelper).toHaveBeenCalledWith(
      "/users/me/photo",
      expect.objectContaining({ method: "POST", isFormData: true })
    );
    const formData = apiHelper.mock.calls[0][1].body;
    expect(formData.get("photo")).toBe(file);
  });

  it("changeProfilePassword memanggil PUT /users/me/password dengan body data", async () => {
    apiHelper.mockResolvedValue({});
    const payload = { current_password: "lama", new_password: "baru" };
    await userApi.changeProfilePassword(payload);
    expect(apiHelper).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: payload,
    });
  });
});
