import React from "react";
import { Link } from "react-router-dom";

export default function LoginMove() {
  return (
    <div>
      <div className="hero-container">
        <img
          src="images/online_auction.jpg"
          alt="Online Auction"
          className="home_image"
        />
        <div className="hero-text">
          <h1 className="head">Silent Auction App</h1>
          <p className="text1">Welcome! Choose an action below:</p>
        </div>
      </div>

      <div className="main">
        <Link to="/admin">
          <button className="login">Dashboard</button>
        </Link>

        <Link to="/bid">
          <button className="register">BidItems</button>
        </Link>

        <Link to="/">
          <button className="register">Exit</button>
        </Link>
      </div>
    </div>
  );
}








