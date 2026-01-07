import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const fetchData = async (url) => {
  const token = localStorage.getItem("token");
  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export default fetchData;
