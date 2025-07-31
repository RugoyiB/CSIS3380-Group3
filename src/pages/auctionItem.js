import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/authContext";

export default function AuctionItem() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [bid, setBid] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "items", id), (docSnap) => {
      if (docSnap.exists()) {
        setItem(docSnap.data());
      }
    });
    return () => unsub();
  }, [id]);

  const placeBid = async () => {
    const bidAmount = parseFloat(bid);
    if (!user || !bidAmount || bidAmount <= (item.currentBid || 0)) {
      alert("Bid must be greater than current top bid");
      return;
    }

    const itemRef = doc(db, "items", id);
    await updateDoc(itemRef, {
      currentBid: bidAmount,
      bids: arrayUnion({ uid: user.uid, amount: bidAmount })
    });

    setBid("");
  };

  if (!item) return <p className="p-6">Loading item...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
      <p>{item.description}</p>
      <p className="mt-2 font-semibold">Current Top Bid: ${item.currentBid || 0}</p>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="number"
          value={bid}
          onChange={(e) => setBid(e.target.value)}
          className="border p-2 rounded w-32"
          placeholder="Enter bid"
        />
        <button
          onClick={placeBid}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Place Bid
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-2">Bid History</h3>
        <ul className="list-disc pl-5 space-y-1">
          {(item.bids || [])
            .sort((a, b) => b.amount - a.amount)
            .map((b, i) => (
              <li key={i} className={b.amount === item.currentBid ? "font-bold text-green-700" : ""}>
                {b.uid}: ${b.amount}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
