import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../Pages/Home";
import SearchPage from "../Pages/SearchPage";
import PostPage from "../Pages/PostPage";

const Navigation = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/post" element={<PostPage />} />
      </Routes>
    </Router>
  );
};

export default Navigation;
