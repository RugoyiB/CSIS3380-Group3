import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuctionItem from "./pages/auctionItem";
import BidItems from "./pages/BidItems";
import LoginMove from "./pages/LoginMove";
import { AuthProvider } from "./contexts/authContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Admin" element={<Dashboard />} />
          <Route path="/item/:id" element={<AuctionItem />} />
          <Route path="/bid" element={<BidItems />} />
          <Route path="/LoginMove" element={<LoginMove />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
