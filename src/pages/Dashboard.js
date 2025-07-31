import React, { useEffect, useState } from "react";
import { db, functions } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  getDoc,
  setDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ description: "", startBid: "" });
  const [userEmail, setUserEmail] = useState("");
  const [bidValues, setBidValues] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const unsubscribe = onSnapshot(collection(db, "items"), (snap) => {
      const allItems = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredItems = allItems.filter(
        (item) => item.createdBy === "admin@auction.com"
      );
      // Sort: Open items first, then by auction number
      const sortedItems = filteredItems.sort((a, b) => {
        if (a.closed !== b.closed) return a.closed ? 1 : -1;
        return a.auctionNumber - b.auctionNumber;
      });

      setItems(sortedItems);
    });

    return unsubscribe;
  }, [userEmail]);

  const getNextAuctionNumber = async () => {
    const counterRef = doc(db, "counters", "auctions");
    let nextNumber;

    await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(counterRef);
      if (!counterSnap.exists()) {
        nextNumber = 1;
        tx.set(counterRef, { current: nextNumber });
      } else {
        const current = counterSnap.data().current || 0;
        nextNumber = current + 1;
        tx.update(counterRef, { current: nextNumber });
      }
    });

    return nextNumber;
  };

  const handleSaveAuction = async () => {
    if (!form.description || !form.startBid) {
      alert("Please fill in description and starting bid.");
      return;
    }

    try {
      const auctionNumber = await getNextAuctionNumber();

      await addDoc(collection(db, "items"), {
        createdBy: userEmail,
        auctionNumber,
        description: form.description,
        currentBid: parseFloat(form.startBid),
        bids: [],
        closed: false,
        winner: null
      });

      setForm({ description: "", startBid: "" });
      alert("Auction item saved successfully.");
    } catch (err) {
      console.error("Error saving item:", err);
      alert("Failed to save item.");
    }
  };

  async function handlePlaceBid(itemId, currentBid, bids) {
    const bidAmount = parseFloat(bidValues[itemId]);
    if (isNaN(bidAmount) || bidAmount <= currentBid) {
      alert("Please bid a higher amount.");
      return;
    }

    const itemRef = doc(db, "items", itemId);
    try {
      await runTransaction(db, async (tx) => {
        const docSnap = await tx.get(itemRef);
        if (!docSnap.exists()) throw "Item does not exist!";
        const latestBid = docSnap.data().currentBid;
        if (bidAmount <= latestBid) throw "Bid too low";
        tx.update(itemRef, {
          currentBid: bidAmount,
          bids: [...(docSnap.data().bids || []), { uid: userEmail, amount: bidAmount }]
        });
      });
      setBidValues({ ...bidValues, [itemId]: "" });
    } catch (e) {
      alert(e);
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "items", itemId));
      alert("Auction item deleted.");
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleCloseAuction = async (item) => {
    if (!item.bids || item.bids.length === 0) {
      alert("No bids to close the auction with.");
      return;
    }

    const highestBid = item.bids.reduce((max, bid) =>
      bid.amount > max.amount ? bid : max, item.bids[0]
    );

    const itemRef = doc(db, "items", item.id);

    try {
      await updateDoc(itemRef, {
        closed: true,
        winner: highestBid
      });

      const sendEmail = httpsCallable(functions, "sendAuctionEmail");
      alert(`Sending email to: ${highestBid.uid}`);
      console.log("Calling sendAuctionEmail with:", {
        to: highestBid.uid,
        subject: `You won the auction for "${item.description}"!`,
      });

      await sendEmail({
        to: highestBid.uid,
        subject: `You won the auction for "${item.description}"!`,
        text: `Congratulations! You won the auction with a bid of $${highestBid.amount}.`,
        html: `<p>Congratulations!</p><p>You won the auction for <strong>${item.description}</strong> with a bid of <strong>$${highestBid.amount}</strong>.</p>`
      });

      alert(`Auction closed. Winner: ${highestBid.uid} - $${highestBid.amount}`);
    } catch (err) {
      console.error("Error closing auction or sending email:", err);
      alert("Failed to close auction or send email.");
    }
  };

  const handleReturn = () => {
    navigate("/LoginMove");
  };

  const isAdmin = userEmail === "admin@auction.com";

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-heading">Auction Dashboard</h1>

      <button
        onClick={handleReturn}
        className="bg-gray-700 text-white px-4 py-2 mb-4 rounded"
      >
        Back to Dashboard
      </button>

      {isAdmin && (
        <div className="auction-form">
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Starting Bid"
            value={form.startBid}
            onChange={(e) => setForm({ ...form, startBid: e.target.value })}
            className="input-field"
          />
          <button onClick={handleSaveAuction} className="btn-save">
            Save Auction Item
          </button>
        </div>
      )}

      <ul className="auction-list">
        {items.map((item) => (
          <li key={item.id} className="auction-item">
            <h2 className="bidder-name">Auction Number: {item.auctionNumber}</h2>
            <p className="item-description">{item.description}</p>
            <p
              className="bid-amount"
              style={{
                backgroundColor: "#e0ffe0",
                color: "darkgreen",
                padding: "6px",
                borderRadius: "4px"
              }}
            >
              Top Bid: ${item.currentBid}
            </p>
            <p className="auction-status">
              Status: {item.closed ? "Closed" : "Open"}
            </p>

            {!item.closed && (
              <div className="place-bid-form">
                <input
                  type="number"
                  placeholder="Enter your bid"
                  value={bidValues[item.id] || ""}
                  onChange={(e) =>
                    setBidValues({ ...bidValues, [item.id]: e.target.value })
                  }
                  className="bid-input"
                />
                <button
                  onClick={() =>
                    handlePlaceBid(item.id, item.currentBid, item.bids)
                  }
                  className="btn-place-bid"
                >
                  Place Bid
                </button>
              </div>
            )}

            {item.winner && (
              <div className="winner-box">
                <p className="winner-text">
                  Winner: {item.winner.uid} - ${item.winner.amount}
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="admin-actions">
                <button onClick={() => handleDeleteItem(item.id)} className="btn-delete">
                  Delete Item
                </button>
                {!item.closed && (
                  <button onClick={() => handleCloseAuction(item)} className="btn-close">
                    Close Auction
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
