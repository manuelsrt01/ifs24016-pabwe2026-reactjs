import { describe, it, expect } from "vitest";
import reducer, {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  changeProfileStart,
  changeProfileSuccess,
  changeProfileFailure,
  changeProfilePhotoStart,
  changeProfilePhotoSuccess,
  changeProfilePhotoFailure,
  changeProfilePasswordStart,
  changeProfilePasswordSuccess,
  changeProfilePasswordFailure,
} from "./reducer";

const initialState = {
  users: [],
  profile: null,
  isUsers: false,
  isProfile: false,
  isChangeProfile: false,
  isChangeProfileChanged: false,
  isChangeProfilePhoto: false,
  isChangeProfilePhotoChanged: false,
  isChangeProfilePassword: false,
  isChangeProfilePasswordChanged: false,
};

describe("users reducer", () => {
  it("mengembalikan initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("fetchUsersStart/Success/Failure mengatur isUsers dan users", () => {
    let state = reducer(initialState, fetchUsersStart());
    expect(state.isUsers).toBe(true);

    const users = [{ id: 1 }, { id: 2 }];
    state = reducer(state, fetchUsersSuccess(users));
    expect(state.isUsers).toBe(false);
    expect(state.users).toEqual(users);

    state = reducer({ ...initialState, isUsers: true }, fetchUsersFailure());
    expect(state.isUsers).toBe(false);
  });

  it("fetchProfileStart/Success/Failure mengatur isProfile dan profile", () => {
    let state = reducer(initialState, fetchProfileStart());
    expect(state.isProfile).toBe(true);

    const profile = { id: 1, name: "Budi" };
    state = reducer(state, fetchProfileSuccess(profile));
    expect(state.profile).toEqual(profile);

    state = reducer({ ...initialState, isProfile: true }, fetchProfileFailure());
    expect(state.isProfile).toBe(false);
  });

  it("changeProfileStart/Success menggabungkan payload ke profile aktif", () => {
    let state = reducer(initialState, changeProfileStart());
    expect(state.isChangeProfile).toBe(true);

    state = reducer(
      { ...state, profile: { id: 1, name: "Lama" } },
      changeProfileSuccess({ name: "Baru" })
    );
    expect(state.isChangeProfileChanged).toBe(true);
    expect(state.profile).toEqual({ id: 1, name: "Baru" });
  });

  it("changeProfileSuccess tanpa profile aktif tidak mengubah profile", () => {
    const state = reducer(initialState, changeProfileSuccess({ name: "Baru" }));
    expect(state.profile).toBeNull();
  });

  it("changeProfileFailure mengatur flag gagal", () => {
    const state = reducer({ ...initialState, isChangeProfile: true }, changeProfileFailure());
    expect(state.isChangeProfile).toBe(false);
    expect(state.isChangeProfileChanged).toBe(false);
  });

  it("changeProfilePhotoStart/Success memperbarui foto pada profile aktif", () => {
    let state = reducer(initialState, changeProfilePhotoStart());
    expect(state.isChangeProfilePhoto).toBe(true);

    state = reducer(
      { ...state, profile: { id: 1, photo: "lama.jpg" } },
      changeProfilePhotoSuccess("baru.jpg")
    );
    expect(state.isChangeProfilePhotoChanged).toBe(true);
    expect(state.profile.photo).toBe("baru.jpg");
  });

  it("changeProfilePhotoSuccess tanpa profile aktif tidak mengubah profile", () => {
    const state = reducer(initialState, changeProfilePhotoSuccess("baru.jpg"));
    expect(state.profile).toBeNull();
  });

  it("changeProfilePhotoFailure mengatur flag gagal", () => {
    const state = reducer(
      { ...initialState, isChangeProfilePhoto: true },
      changeProfilePhotoFailure()
    );
    expect(state.isChangeProfilePhoto).toBe(false);
  });

  it("changeProfilePasswordStart/Success/Failure mengatur flag", () => {
    let state = reducer(initialState, changeProfilePasswordStart());
    expect(state.isChangeProfilePassword).toBe(true);

    state = reducer(state, changeProfilePasswordSuccess());
    expect(state.isChangeProfilePasswordChanged).toBe(true);

    state = reducer(
      { ...initialState, isChangeProfilePassword: true },
      changeProfilePasswordFailure()
    );
    expect(state.isChangeProfilePassword).toBe(false);
  });
});
