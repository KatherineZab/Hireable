// components/profile/PostsSection.js
import React from "react";
import "./PostsSection.css";
import AllPosts from "../Home/Posts/poststoshow/AllPosts";
export default function PostsSection({userId, refreshTrigger}) {
  return (
    <div className="no-posts-box">
         <AllPosts filterBy={userId} canViewPosts={true} refreshTrigger={refreshTrigger} context="profile"/>

    </div>
  );
}
