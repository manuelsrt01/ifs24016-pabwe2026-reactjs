import { describe, it, expect, vi, beforeEach } from "vitest";
import apiHelper, {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("GET dengan params mengabaikan nilai kosong dan tanpa header Authorization saat tidak ada token", async () => {
    await apiHelper("/lost-founds", {
      method: "GET",
      params: { status: "lost", a: "", b: null, c: undefined },
    });
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/lost-founds?status=lost");
    expect(url).not.toContain("a=");
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.body).toBeUndefined();
  });

  it("memanggil tanpa opsi menggunakan GET default", async () => {
    await apiHelper("/users");
    expect(global.fetch.mock.calls[0][1].method).toBe("GET");
  });

  it("menyertakan Authorization dan JSON body saat ada token", async () => {
    putAccessToken("token-1");
    await apiHelper("/auth/login", { method: "POST", body: { email: "a@b.c" } });
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer token-1");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ email: "a@b.c" }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const formData = new FormData();
    await apiHelper("/x", { method: "POST", body: formData, isFormData: true });
    const [, options] = global.fetch.mock.calls[0];
    expect(options.body).toBe(formData);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error dengan pesan server saat response tidak ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Tidak diizinkan" }),
    });
    await expect(apiHelper("/x")).rejects.toThrow("Tidak diizinkan");
  });

  it("melempar error saat success false", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: "Gagal" }),
    });
    await expect(apiHelper("/x")).rejects.toThrow("Gagal");
  });

  it("memakai pesan default saat body response bukan JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("bukan json");
      },
    });
    await expect(apiHelper("/x")).rejects.toThrow("Terjadi kesalahan pada server.");
  });

  it("memakai base URL default saat VITE_API_BASE_URL kosong", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "");
    const fresh = await import("./apiHelper");
    await fresh.default("/users");
    expect(global.fetch.mock.calls[0][0]).toBe("https://open-api.delcom.org/api/v1/users");
    vi.unstubAllEnvs();
  });

  it("memakai VITE_API_BASE_URL bila terisi", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://contoh.test/api");
    const fresh = await import("./apiHelper");
    await fresh.default("/users");
    expect(global.fetch.mock.calls[0][0]).toBe("https://contoh.test/api/users");
    vi.unstubAllEnvs();
  });
});