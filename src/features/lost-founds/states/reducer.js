import { createSlice } from "@reduxjs/toolkit";

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

const lostFoundSlice = createSlice({
  name: "lostFounds",
  initialState,
  reducers: {
    fetchLostFoundsStart(state) {
      state.isLostFound = true;
    },
    fetchLostFoundsSuccess(state, action) {
      state.isLostFound = false;
      state.lostFounds = action.payload;
    },
    fetchLostFoundsFailure(state) {
      state.isLostFound = false;
    },
    fetchLostFoundStart(state) {
      state.isLostFound = true;
      state.lostFound = null;
    },
    fetchLostFoundSuccess(state, action) {
      state.isLostFound = false;
      state.lostFound = action.payload;
    },
    fetchLostFoundFailure(state) {
      state.isLostFound = false;
    },
    addLostFoundStart(state) {
      state.isLostFoundAdd = true;
      state.isLostFoundAdded = false;
    },
    addLostFoundSuccess(state) {
      state.isLostFoundAdd = false;
      state.isLostFoundAdded = true;
    },
    addLostFoundFailure(state) {
      state.isLostFoundAdd = false;
      state.isLostFoundAdded = false;
    },
    changeLostFoundStart(state) {
      state.isLostFoundChange = true;
      state.isLostFoundChanged = false;
    },
    changeLostFoundSuccess(state, action) {
      state.isLostFoundChange = false;
      state.isLostFoundChanged = true;
      if (state.lostFound && action.payload) {
        state.lostFound = { ...state.lostFound, ...action.payload };
      }
    },
    changeLostFoundFailure(state) {
      state.isLostFoundChange = false;
      state.isLostFoundChanged = false;
    },
    changeLostFoundCoverStart(state) {
      state.isLostFoundChangeCover = true;
      state.isLostFoundChangedCover = false;
    },
    changeLostFoundCoverSuccess(state, action) {
      state.isLostFoundChangeCover = false;
      state.isLostFoundChangedCover = true;
      if (state.lostFound && action.payload) {
        state.lostFound = { ...state.lostFound, cover: action.payload };
      }
    },
    changeLostFoundCoverFailure(state) {
      state.isLostFoundChangeCover = false;
      state.isLostFoundChangedCover = false;
    },
    deleteLostFoundStart(state) {
      state.isLostFoundDelete = true;
      state.isLostFoundDeleted = false;
    },
    deleteLostFoundSuccess(state, action) {
      state.isLostFoundDelete = false;
      state.isLostFoundDeleted = true;
      state.lostFounds = state.lostFounds.filter((item) => String(item.id) !== String(action.payload));
    },
    deleteLostFoundFailure(state) {
      state.isLostFoundDelete = false;
      state.isLostFoundDeleted = false;
    },
    setLostFoundStats(state, action) {
      state.lostFoundStats = action.payload;
    },
    resetLostFoundFlags(state) {
      state.isLostFoundAdded = false;
      state.isLostFoundChanged = false;
      state.isLostFoundChangedCover = false;
      state.isLostFoundDeleted = false;
    },
  },
});

export const {
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
} = lostFoundSlice.actions;

export default lostFoundSlice.reducer;
