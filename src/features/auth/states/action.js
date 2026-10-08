import authApi from "../api/authApi";
import { extractItem } from "../../../helpers/dataHelper";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  setUser,
  clearUser,
} from "./reducer";

export function asyncFetchMe() {
  return async (dispatch) => {
    try {
      const result = await authApi.getMe();
      dispatch(setUser(extractItem(result?.data, ["user"])));
    } catch {
      dispatch(clearUser());
    }
  };
}

export function asyncLoginUser({ email, password }) {
  return async (dispatch) => {
    dispatch(loginStart());
    try {
      const result = await authApi.login({ email, password });
      putAccessToken(result.data.token);
      dispatch(loginSuccess());
      await dispatch(asyncFetchMe());
      return true;
    } catch (error) {
      dispatch(loginFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncRegisterUser({ name, email, password }) {
  return async (dispatch) => {
    dispatch(registerStart());
    try {
      await authApi.register({ name, email, password });
      dispatch(registerSuccess());
      await showSuccessDialog("Registrasi berhasil. Silakan masuk.");
      return true;
    } catch (error) {
      dispatch(registerFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncLogoutUser() {
  return (dispatch) => {
    removeAccessToken();
    dispatch(clearUser());
  };
}
