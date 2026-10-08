import apiHelper from "../../../helpers/apiHelper";

export const authApi = {
  login: (data) => apiHelper("/auth/login", { method: "POST", body: data }),
  register: (data) => apiHelper("/auth/register", { method: "POST", body: data }),
  getMe: () => apiHelper("/users/me", { method: "GET" }),
};

export default authApi;
