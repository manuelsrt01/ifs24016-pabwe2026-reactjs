import apiHelper from "../../../helpers/apiHelper";

export const lostFoundApi = {
  getLostFounds: (filters = {}) =>
    apiHelper("/lost-founds", { method: "GET", params: filters }),

  getLostFound: (id) => apiHelper(`/lost-founds/${id}`, { method: "GET" }),

  addLostFound: (data) =>
    apiHelper("/lost-founds", { method: "POST", body: data }),

  changeLostFound: (id, data) =>
    apiHelper(`/lost-founds/${id}`, { method: "PUT", body: data }),

  changeLostFoundCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiHelper(`/lost-founds/${id}/cover`, {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },

  deleteLostFound: (id) => apiHelper(`/lost-founds/${id}`, { method: "DELETE" }),

  getDailyStats: () => apiHelper("/lost-founds/stats/daily", { method: "GET" }),

  getMonthlyStats: () => apiHelper("/lost-founds/stats/monthly", { method: "GET" }),
};

export default lostFoundApi;
