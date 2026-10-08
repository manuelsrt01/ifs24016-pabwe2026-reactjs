import { describe, it, expect, vi, afterEach } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import lostFoundApi from "./lostFoundApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: vi.fn(),
}));

describe("lostFoundApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getLostFounds memanggil GET /lost-founds dengan filter sebagai params", async () => {
    apiHelper.mockResolvedValue({ data: [] });
    await lostFoundApi.getLostFounds({ status: "lost" });
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds", {
      method: "GET",
      params: { status: "lost" },
    });
  });

  it("getLostFounds tanpa argumen memakai filter kosong", async () => {
    apiHelper.mockResolvedValue({ data: [] });
    await lostFoundApi.getLostFounds();
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds", { method: "GET", params: {} });
  });

  it("getLostFound memanggil GET /lost-founds/:id", async () => {
    apiHelper.mockResolvedValue({ data: {} });
    await lostFoundApi.getLostFound(5);
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds/5", { method: "GET" });
  });

  it("addLostFound memanggil POST /lost-founds dengan body data", async () => {
    apiHelper.mockResolvedValue({ data: {} });
    const payload = { title: "Dompet", description: "Hilang di kelas" };
    await lostFoundApi.addLostFound(payload);
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds", {
      method: "POST",
      body: payload,
    });
  });

  it("changeLostFound memanggil PUT /lost-founds/:id dengan body data", async () => {
    apiHelper.mockResolvedValue({ data: {} });
    const payload = { title: "Dompet Ditemukan" };
    await lostFoundApi.changeLostFound(5, payload);
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds/5", {
      method: "PUT",
      body: payload,
    });
  });

  it("changeLostFoundCover mengirim FormData ke endpoint cover", async () => {
    apiHelper.mockResolvedValue({ data: { cover: "url.jpg" } });
    const file = new File(["isi"], "cover.png", { type: "image/png" });

    await lostFoundApi.changeLostFoundCover(5, file);

    expect(apiHelper).toHaveBeenCalledWith(
      "/lost-founds/5/cover",
      expect.objectContaining({ method: "POST", isFormData: true })
    );
    const formData = apiHelper.mock.calls[0][1].body;
    expect(formData.get("cover")).toBe(file);
  });

  it("deleteLostFound memanggil DELETE /lost-founds/:id", async () => {
    apiHelper.mockResolvedValue({});
    await lostFoundApi.deleteLostFound(5);
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds/5", { method: "DELETE" });
  });

  it("getDailyStats memanggil GET /lost-founds/stats/daily", async () => {
    apiHelper.mockResolvedValue({ data: [] });
    await lostFoundApi.getDailyStats();
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds/stats/daily", {
      method: "GET",
    });
  });

  it("getMonthlyStats memanggil GET /lost-founds/stats/monthly", async () => {
    apiHelper.mockResolvedValue({ data: [] });
    await lostFoundApi.getMonthlyStats();
    expect(apiHelper).toHaveBeenCalledWith("/lost-founds/stats/monthly", {
      method: "GET",
    });
  });
});
