import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/states/reducer";
import lostFoundsReducer from "./features/lost-founds/states/reducer";
import usersReducer from "./features/users/states/reducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    lostFounds: lostFoundsReducer,
    users: usersReducer,
  },
});

export default store;
