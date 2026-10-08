import { describe, it, expect } from "vitest";
import { extractList, extractItem, getInitial } from "./dataHelper";

describe("dataHelper", () => {
  it("extractList mengembalikan array apa adanya", () => {
    expect(extractList([1, 2])).toEqual([1, 2]);
  });
  it("extractList membaca key yang diberikan", () => {
    expect(extractList({ users: [1] }, ["users"])).toEqual([1]);
  });
  it("extractList memakai array pertama bila key tidak cocok", () => {
    expect(extractList({ other: [7], meta: 1 }, ["users"])).toEqual([7]);
  });
  it("extractList mengembalikan [] untuk data tidak valid", () => {
    expect(extractList(null)).toEqual([]);
    expect(extractList({ a: 1 })).toEqual([]);
    expect(extractList("x")).toEqual([]);
  });
  it("extractItem membuka key pembungkus", () => {
    expect(extractItem({ user: { id: 1 } }, ["user"])).toEqual({ id: 1 });
  });
  it("extractItem mengembalikan objek itu sendiri bila tanpa pembungkus", () => {
    expect(extractItem({ id: 2 }, ["user"])).toEqual({ id: 2 });
  });
  it("extractItem mengembalikan null untuk data tidak valid", () => {
    expect(extractItem(null)).toBeNull();
    expect(extractItem([1])).toBeNull();
    expect(extractItem("x")).toBeNull();
  });
  it("getInitial mengambil huruf pertama", () => {
    expect(getInitial("budi")).toBe("B");
    expect(getInitial("  ")).toBe("?");
    expect(getInitial(undefined)).toBe("?");
  });
});
