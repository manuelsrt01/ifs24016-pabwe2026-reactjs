import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai nilai default string kosong", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("onChange memperbarui nilai teks", () => {
    const { result } = renderHook(() => useInput("a"));
    act(() => result.current[1]({ target: { type: "text", value: "baru" } }));
    expect(result.current[0]).toBe("baru");
  });

  it("onChange memperbarui nilai checkbox dengan checked", () => {
    const { result } = renderHook(() => useInput(false));
    act(() =>
      result.current[1]({ target: { type: "checkbox", checked: true, value: "on" } })
    );
    expect(result.current[0]).toBe(true);
  });

  it("setValue dan reset bekerja", () => {
    const { result } = renderHook(() => useInput("awal"));
    act(() => result.current[2]("lain"));
    expect(result.current[0]).toBe("lain");
    act(() => result.current[3]());
    expect(result.current[0]).toBe("awal");
  });
});
