import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [] }),
  });
});
