import React, { useState, useEffect } from "react";
import FriendsList from "../../components/friends/FriendsList";
import FriendRequests from "../../components/friends/FriendRequests";
import UserCard from "../../components/friends/UserCard";

import {
  getFriends,
  getRequests,
  searchUsers,
  sendFriendRequest
} from "../../services/friendServices";

import "./Friends.css";

export default function Friends() {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const loadData = async () => {
    try {
      const f = await getFriends();
      const r = await getRequests();

      setFriends(f);
      setRequests(r);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await searchUsers(value);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await sendFriendRequest(userId);
      alert("İstek gönderildi 🔥");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-bg">
      <div className="friends-container">

        {/* 💥 HEADER */}
        <div className="friends-header-card">
          <div className="header-row">
            <div>
              <h1>Connections</h1>
              <p>Dashboard / Connections</p>
            </div>

            {/* 🌿 SAĞDAKİ TATLI ŞEY */}
            <div className="header-badge">
              🌿
            </div>
          </div>
        </div>

        {/* 💥 CONTENT */}
        <div className="friends-content-card">

          {/* TABS */}
          <div className="tabs">
            <div className="tab-left">
              <button
                className={activeTab === "friends" ? "active" : ""}
                onClick={() => setActiveTab("friends")}
              >
                Friends
              </button>

              <button
                className={activeTab === "requests" ? "active" : ""}
                onClick={() => setActiveTab("requests")}
              >
                Requests ({requests.length})
              </button>
            </div>

            <div className="tab-right">
              <div className="cloud-icon"></div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="search-bar">
            <input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* SEARCH RESULTS */}
          {searchResults.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              {searchResults.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onAdd={handleAddFriend}
                />
              ))}
            </div>
          )}

          {/* CONTENT */}
          <div className="content">
            <div className="left">
              {activeTab === "friends" ? (
                <FriendsList friends={friends} />
              ) : (
                <FriendRequests
                  requests={requests}
                  refresh={loadData}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}