import { describe, it, expect } from "vitest";
import reducer, {
  fetchLostFoundsStart,
  fetchLostFoundsSuccess,
  fetchLostFoundsFailure,
  fetchLostFoundStart,
  fetchLostFoundSuccess,
  fetchLostFoundFailure,
  addLostFoundStart,
  addLostFoundSuccess,
  addLostFoundFailure,
  changeLostFoundStart,
  changeLostFoundSuccess,
  changeLostFoundFailure,
  changeLostFoundCoverStart,
  changeLostFoundCoverSuccess,
  changeLostFoundCoverFailure,
  deleteLostFoundStart,
  deleteLostFoundSuccess,
  deleteLostFoundFailure,
  setLostFoundStats,
  resetLostFoundFlags,
} from "./reducer";

const initialState = {
  lostFounds: [],
  lostFound: null,
  isLostFound: false,
  isLostFoundAdd: false,
  isLostFoundAdded: false,
  isLostFoundChange: false,
  isLostFoundChanged: false,
  isLostFoundChangeCover: false,
  isLostFoundChangedCover: false,
  isLostFoundDelete: false,
  isLostFoundDeleted: false,
  lostFoundStats: { daily: [], monthly: [] },
};

describe("lostFounds reducer", () => {
  it("mengembalikan initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("fetchLostFoundsStart/Success/Failure mengatur isLostFound dan lostFounds", () => {
    let state = reducer(initialState, fetchLostFoundsStart());
    expect(state.isLostFound).toBe(true);

    const items = [{ id: 1 }, { id: 2 }];
    state = reducer(state, fetchLostFoundsSuccess(items));
    expect(state.isLostFound).toBe(false);
    expect(state.lostFounds).toEqual(items);

    state = reducer({ ...initialState, isLostFound: true }, fetchLostFoundsFailure());
    expect(state.isLostFound).toBe(false);
  });

  it("fetchLostFoundStart/Success/Failure mengatur isLostFound dan lostFound", () => {
    let state = reducer(initialState, fetchLostFoundStart());
    expect(state.isLostFound).toBe(true);

    const item = { id: 1, title: "Dompet" };
    state = reducer(state, fetchLostFoundSuccess(item));
    expect(state.lostFound).toEqual(item);

    state = reducer({ ...initialState, isLostFound: true }, fetchLostFoundFailure());
    expect(state.isLostFound).toBe(false);
  });

  it("addLostFoundStart/Success/Failure mengatur flag penambahan", () => {
    let state = reducer(initialState, addLostFoundStart());
    expect(state.isLostFoundAdd).toBe(true);

    state = reducer(state, addLostFoundSuccess());
    expect(state.isLostFoundAdd).toBe(false);
    expect(state.isLostFoundAdded).toBe(true);

    state = reducer({ ...initialState, isLostFoundAdd: true }, addLostFoundFailure());
    expect(state.isLostFoundAdd).toBe(false);
    expect(state.isLostFoundAdded).toBe(false);
  });

  it("changeLostFoundStart mengatur flag proses", () => {
    const state = reducer(initialState, changeLostFoundStart());
    expect(state.isLostFoundChange).toBe(true);
  });

  it("changeLostFoundSuccess menggabungkan payload ke lostFound aktif", () => {
    const state = reducer(
      { ...initialState, lostFound: { id: 1, title: "Lama" } },
      changeLostFoundSuccess({ title: "Baru" })
    );
    expect(state.isLostFoundChanged).toBe(true);
    expect(state.lostFound).toEqual({ id: 1, title: "Baru" });
  });

  it("changeLostFoundSuccess tanpa lostFound aktif tidak mengubah lostFound", () => {
    const state = reducer(initialState, changeLostFoundSuccess({ title: "Baru" }));
    expect(state.lostFound).toBeNull();
  });

  it("changeLostFoundFailure mengatur flag gagal", () => {
    const state = reducer({ ...initialState, isLostFoundChange: true }, changeLostFoundFailure());
    expect(state.isLostFoundChange).toBe(false);
    expect(state.isLostFoundChanged).toBe(false);
  });

  it("changeLostFoundCoverStart/Success memperbarui cover pada lostFound aktif", () => {
    let state = reducer(initialState, changeLostFoundCoverStart());
    expect(state.isLostFoundChangeCover).toBe(true);

    state = reducer(
      { ...state, lostFound: { id: 1, cover: "lama.jpg" } },
      changeLostFoundCoverSuccess("baru.jpg")
    );
    expect(state.isLostFoundChangedCover).toBe(true);
    expect(state.lostFound.cover).toBe("baru.jpg");
  });

  it("changeLostFoundCoverSuccess tanpa lostFound aktif tidak mengubah lostFound", () => {
    const state = reducer(initialState, changeLostFoundCoverSuccess("baru.jpg"));
    expect(state.lostFound).toBeNull();
  });

  it("changeLostFoundCoverFailure mengatur flag gagal", () => {
    const state = reducer(
      { ...initialState, isLostFoundChangeCover: true },
      changeLostFoundCoverFailure()
    );
    expect(state.isLostFoundChangeCover).toBe(false);
  });

  it("deleteLostFoundStart/Success menghapus item dari lostFounds", () => {
    let state = reducer(
      { ...initialState, lostFounds: [{ id: 1 }, { id: 2 }] },
      deleteLostFoundStart()
    );
    expect(state.isLostFoundDelete).toBe(true);

    state = reducer(state, deleteLostFoundSuccess(1));
    expect(state.isLostFoundDeleted).toBe(true);
    expect(state.lostFounds).toEqual([{ id: 2 }]);
  });

  it("deleteLostFoundFailure mengatur flag gagal", () => {
    const state = reducer({ ...initialState, isLostFoundDelete: true }, deleteLostFoundFailure());
    expect(state.isLostFoundDelete).toBe(false);
  });

  it("setLostFoundStats menyimpan data statistik", () => {
    const stats = { daily: [1, 2], monthly: [3] };
    const state = reducer(initialState, setLostFoundStats(stats));
    expect(state.lostFoundStats).toEqual(stats);
  });

  it("resetLostFoundFlags mengembalikan semua flag selesai ke false", () => {
    const dirtyState = {
      ...initialState,
      isLostFoundAdded: true,
      isLostFoundChanged: true,
      isLostFoundChangedCover: true,
      isLostFoundDeleted: true,
    };
    const state = reducer(dirtyState, resetLostFoundFlags());
    expect(state.isLostFoundAdded).toBe(false);
    expect(state.isLostFoundChanged).toBe(false);
    expect(state.isLostFoundChangedCover).toBe(false);
    expect(state.isLostFoundDeleted).toBe(false);
  });
});
