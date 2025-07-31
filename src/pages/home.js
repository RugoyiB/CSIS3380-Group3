import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
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
        <Link to="/login">
          <button className="login">Login</button>
        </Link>

        <Link to="/register">
          <button className="register">Register</button>
        </Link>

      </div>
    </div>
  );
}
