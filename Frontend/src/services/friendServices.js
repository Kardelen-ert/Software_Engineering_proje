const BASE_URL = "http://127.0.0.1:8000";

// TOKEN
const getToken = () => localStorage.getItem("token");

// ORTAK HEADER
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

// FRIENDS
export const getFriends = async () => {
  const res = await fetch(`${BASE_URL}/connections/friends`, {
    headers: authHeader()
  });

  if (!res.ok) throw new Error("Friends alınamadı");
  return res.json();
};

// REQUESTS
export const getRequests = async () => {
  const res = await fetch(`${BASE_URL}/connections/incoming`, {
    headers: authHeader()
  });

  if (!res.ok) throw new Error("Requests alınamadı");
  return res.json();
};

// SEARCH
export const searchUsers = async (query) => {
  const res = await fetch(
    `${BASE_URL}/connections/users/search?query=${query}`,
    {
      headers: authHeader()
    }
  );

  if (!res.ok) throw new Error("Search başarısız");
  return res.json();
};

// SEND REQUEST
export const sendFriendRequest = async (userId) => {
  const res = await fetch(`${BASE_URL}/connections/request`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      receiver_id: userId
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "İstek gönderilemedi");
  }

  return data;
};

// ACCEPT
export const acceptRequest = async (requestId) => {
  const res = await fetch(`${BASE_URL}/connections/accept`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      request_id: requestId
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail);
  }

  return data;
};

// REJECT
export const rejectRequest = async (requestId) => {
  const res = await fetch(`${BASE_URL}/connections/reject`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      request_id: requestId
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail);
  }

  return data;
};