import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store";
import App from "./App";
import { getAccessToken } from "./helpers/apiHelper";
import { asyncFetchMe } from "./features/auth/states/action";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";

if (getAccessToken()) {
  store.dispatch(asyncFetchMe());
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);