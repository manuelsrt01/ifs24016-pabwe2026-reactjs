import { createSlice } from "@reduxjs/toolkit";

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

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    fetchUsersStart(state) {
      state.isUsers = true;
    },
    fetchUsersSuccess(state, action) {
      state.isUsers = false;
      state.users = action.payload;
    },
    fetchUsersFailure(state) {
      state.isUsers = false;
    },
    fetchProfileStart(state) {
      state.isProfile = true;
    },
    fetchProfileSuccess(state, action) {
      state.isProfile = false;
      state.profile = action.payload;
    },
    fetchProfileFailure(state) {
      state.isProfile = false;
    },
    changeProfileStart(state) {
      state.isChangeProfile = true;
      state.isChangeProfileChanged = false;
    },
    changeProfileSuccess(state, action) {
      state.isChangeProfile = false;
      state.isChangeProfileChanged = true;
      if (state.profile && action.payload) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    changeProfileFailure(state) {
      state.isChangeProfile = false;
      state.isChangeProfileChanged = false;
    },
    changeProfilePhotoStart(state) {
      state.isChangeProfilePhoto = true;
      state.isChangeProfilePhotoChanged = false;
    },
    changeProfilePhotoSuccess(state, action) {
      state.isChangeProfilePhoto = false;
      state.isChangeProfilePhotoChanged = true;
      if (state.profile) {
        state.profile = { ...state.profile, photo: action.payload };
      }
    },
    changeProfilePhotoFailure(state) {
      state.isChangeProfilePhoto = false;
      state.isChangeProfilePhotoChanged = false;
    },
    changeProfilePasswordStart(state) {
      state.isChangeProfilePassword = true;
      state.isChangeProfilePasswordChanged = false;
    },
    changeProfilePasswordSuccess(state) {
      state.isChangeProfilePassword = false;
      state.isChangeProfilePasswordChanged = true;
    },
    changeProfilePasswordFailure(state) {
      state.isChangeProfilePassword = false;
      state.isChangeProfilePasswordChanged = false;
    },
  },
});

export const {
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
} = userSlice.actions;

export default userSlice.reducer;
