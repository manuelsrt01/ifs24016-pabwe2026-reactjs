import { describe, it, expect, vi, afterEach } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import authApi from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ default: vi.fn() }));

describe("authApi", () => {
  afterEach(() => vi.clearAllMocks());

  it("login memanggil POST /auth/login", async () => {
    const payload = { email: "a@b.c", password: "123456" };
    await authApi.login(payload);
    expect(apiHelper).toHaveBeenCalledWith("/auth/login", { method: "POST", body: payload });
  });

  it("register memanggil POST /auth/register", async () => {
    const payload = { name: "A", email: "a@b.c", password: "123456" };
    await authApi.register(payload);
    expect(apiHelper).toHaveBeenCalledWith("/auth/register", { method: "POST", body: payload });
  });

  it("getMe memanggil GET /users/me", async () => {
    await authApi.getMe();
    expect(apiHelper).toHaveBeenCalledWith("/users/me", { method: "GET" });
  });
});
