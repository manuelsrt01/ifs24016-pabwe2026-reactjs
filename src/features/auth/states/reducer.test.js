import { describe, it, expect } from "vitest";
import reducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  setUser,
  clearUser,
} from "./reducer";

const initialState = { user: null, isLogin: false, isRegister: false };

describe("auth reducer", () => {
  it("mengembalikan initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("login start/success/failure mengatur isLogin", () => {
    let state = reducer(initialState, loginStart());
    expect(state.isLogin).toBe(true);
    state = reducer(state, loginSuccess());
    expect(state.isLogin).toBe(false);
    state = reducer({ ...initialState, isLogin: true }, loginFailure());
    expect(state.isLogin).toBe(false);
  });

  it("register start/success/failure mengatur isRegister", () => {
    let state = reducer(initialState, registerStart());
    expect(state.isRegister).toBe(true);
    state = reducer(state, registerSuccess());
    expect(state.isRegister).toBe(false);
    state = reducer({ ...initialState, isRegister: true }, registerFailure());
    expect(state.isRegister).toBe(false);
  });

  it("setUser dan clearUser mengatur user", () => {
    let state = reducer(initialState, setUser({ id: 1, name: "Budi" }));
    expect(state.user).toEqual({ id: 1, name: "Budi" });
    state = reducer(state, clearUser());
    expect(state.user).toBeNull();
  });
});
