import apiHelper from "../../../helpers/apiHelper";

export const userApi = {
  getUsers: () => apiHelper("/users", { method: "GET" }),

  getProfile: () => apiHelper("/users/me", { method: "GET" }),

  changeProfile: (data) =>
    apiHelper("/users/me", { method: "PUT", body: data }),

  changeProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiHelper("/users/me/photo", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },

  changeProfilePassword: (data) =>
    apiHelper("/users/me/password", { method: "PUT", body: data }),
};

export default userApi;
