import { describe, it, expect } from "vitest";
import store from "./store";

describe("store", () => {
  it("memiliki slice auth, lostFounds, dan users dengan state awal yang benar", () => {
    const state = store.getState();

    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("lostFounds");
    expect(state).toHaveProperty("users");

    expect(state.auth.user).toBeNull();
    expect(state.lostFounds.lostFounds).toEqual([]);
    expect(state.users.users).toEqual([]);
  });
});
