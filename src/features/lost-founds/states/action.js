import lostFoundApi from "../api/lostFoundApi";
import { extractList, extractItem } from "../../../helpers/dataHelper";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import {
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
} from "./reducer";

export function asyncFetchLostFounds(filters = {}) {
  return async (dispatch) => {
    dispatch(fetchLostFoundsStart());
    try {
      const result = await lostFoundApi.getLostFounds(filters);
      dispatch(fetchLostFoundsSuccess(extractList(result?.data, ["lost_founds"])));
    } catch (error) {
      dispatch(fetchLostFoundsFailure());
      await showErrorDialog(error.message);
    }
  };
}

export function asyncFetchLostFound(id, { silent = false } = {}) {
  return async (dispatch) => {
    if (!silent) dispatch(fetchLostFoundStart());
    try {
      const result = await lostFoundApi.getLostFound(id);
      dispatch(fetchLostFoundSuccess(extractItem(result?.data, ["lost_found"])));
    } catch (error) {
      dispatch(fetchLostFoundFailure());
      await showErrorDialog(error.message);
    }
  };
}

// Mencari id laporan yang baru dibuat. Bila respons API tidak menyertakan id,
// cari di daftar laporan milik pengguna berdasarkan judul dan deskripsi.
async function resolveNewLostFoundId(result, data) {
  const created = result?.data;
  const directId = created?.id ?? created?.lost_found_id ?? created?.lost_found?.id;
  if (directId) return directId;

  const response = await lostFoundApi.getLostFounds({ is_me: 1 });
  const match = extractList(response?.data, ["lost_founds"])
    .filter((item) => item.title === data.title && item.description === data.description)
    .sort((a, b) => b.id - a.id)[0];
  if (!match) throw new Error("Laporan baru tidak ditemukan.");
  return match.id;
}

export function asyncAddLostFound(data, coverFile = null) {
  return async (dispatch) => {
    dispatch(addLostFoundStart());
    try {
      const result = await lostFoundApi.addLostFound(data);

      let coverFailed = false;
      if (coverFile) {
        try {
          const newId = await resolveNewLostFoundId(result, data);
          await lostFoundApi.changeLostFoundCover(newId, coverFile);
        } catch {
          coverFailed = true;
        }
      }

      dispatch(addLostFoundSuccess());
      await showSuccessDialog(
        coverFailed
          ? "Laporan berhasil ditambahkan, tetapi gambar gagal diunggah. Anda bisa menambahkannya lewat halaman detail."
          : "Laporan berhasil ditambahkan."
      );
      return true;
    } catch (error) {
      dispatch(addLostFoundFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncChangeLostFound(id, data) {
  return async (dispatch) => {
    dispatch(changeLostFoundStart());
    try {
      await lostFoundApi.changeLostFound(id, data);
      dispatch(changeLostFoundSuccess(data));
      await showSuccessDialog("Laporan berhasil diperbarui.");
      return true;
    } catch (error) {
      dispatch(changeLostFoundFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncChangeLostFoundCover(id, file) {
  return async (dispatch) => {
    dispatch(changeLostFoundCoverStart());
    try {
      const result = await lostFoundApi.changeLostFoundCover(id, file);
      dispatch(changeLostFoundCoverSuccess(result?.data?.cover));
      await dispatch(asyncFetchLostFound(id, { silent: true }));
      await showSuccessDialog("Cover berhasil diperbarui.");
      return true;
    } catch (error) {
      dispatch(changeLostFoundCoverFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncDeleteLostFound(id) {
  return async (dispatch) => {
    const confirmed = await showConfirmDialog(
      "Laporan yang dihapus tidak dapat dikembalikan."
    );
    if (!confirmed) return false;

    dispatch(deleteLostFoundStart());
    try {
      await lostFoundApi.deleteLostFound(id);
      dispatch(deleteLostFoundSuccess(id));
      await showSuccessDialog("Laporan berhasil dihapus.");
      return true;
    } catch (error) {
      dispatch(deleteLostFoundFailure());
      await showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncFetchLostFoundStats() {
  return async (dispatch) => {
    try {
      const [daily, monthly] = await Promise.all([
        lostFoundApi.getDailyStats(),
        lostFoundApi.getMonthlyStats(),
      ]);
      dispatch(
        setLostFoundStats({
          daily: daily?.data ?? [],
          monthly: monthly?.data ?? [],
        })
      );
    } catch (error) {
      await showErrorDialog(error.message);
    }
  };
}