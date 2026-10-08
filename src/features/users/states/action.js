import userApi from "../api/userApi";
import { extractList, extractItem } from "../../../helpers/dataHelper";
import { asyncFetchMe } from "../../auth/states/action";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import {
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

export function asyncFetchUsers() {
  return async (dispatch) => {
    dispatch(fetchUsersStart());
    try {
      const result = await userApi.getUsers();
      dispatch(fetchUsersSuccess(extractList(result?.data, ["users"])));
    } catch (error) {
      dispatch(fetchUsersFailure());
      await showErrorDialog(error.message);
    }
  };
}

export function asyncFetchProfile() {
  return async (dispatch) => {
    dispatch(fetchProfileStart());
    try {
      const result = await userApi.getProfile();
      dispatch(fetchProfileSuccess(extractItem(result?.data, ["user"])));
    } catch (error) {
      dispatch(fetchProfileFailure());
      await showErrorDialog(error.message);
    }
  };
}

export function asyncChangeProfile(data) {
  return async (dispatch) => {
    dispatch(changeProfileStart());
    try {
      await userApi.changeProfile(data);
      dispatch(changeProfileSuccess(data));
      await dispatch(asyncFetchMe());
      await showSuccessDialog("Profil berhasil diperbarui.");
      return true;
    } catch (error) {
      dispatch(changeProfileFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncChangeProfilePhoto(file) {
  return async (dispatch) => {
    dispatch(changeProfilePhotoStart());
    try {
      const result = await userApi.changeProfilePhoto(file);
      dispatch(changeProfilePhotoSuccess(result?.data?.photo));
      await dispatch(asyncFetchProfile());
      await dispatch(asyncFetchMe());
      await showSuccessDialog("Foto profil berhasil diperbarui.");
      return true;
    } catch (error) {
      dispatch(changeProfilePhotoFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncChangeProfilePassword(data) {
  return async (dispatch) => {
    dispatch(changeProfilePasswordStart());
    try {
      await userApi.changeProfilePassword(data);
      dispatch(changeProfilePasswordSuccess());
      await showSuccessDialog("Kata sandi berhasil diperbarui.");
      return true;
    } catch (error) {
      dispatch(changeProfilePasswordFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}
