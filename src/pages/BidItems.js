import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function BidItems() {
  const [userEmail, setUserEmail] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "items"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().closed ? "Closed" : "Open",
      }));

      const sortedItems = items.sort((a, b) => {
        // Sort by status: 'Open' items first
        if (a.status === "Open" && b.status !== "Open") return -1;
        if (a.status !== "Open" && b.status === "Open") return 1;

        // If both are the same status, sort alphabetically by description
        return a.description.localeCompare(b.description);
      });

      setAllItems(sortedItems);
    });

    return () => unsub();
  }, []);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (term === "") return allItems;
    return allItems.filter((item) =>
      item.description.toLowerCase().includes(term)
    );
  };

  const handleReturn = () => {
    navigate("/LoginMove");
  };

  const displayedItems = handleSearch();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Auction Items</h1>

      <button
        onClick={handleReturn}
        className="bg-gray-700 text-white px-4 py-2 mb-4 rounded"
      >
        Back to Dashboard
      </button>

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search by description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full max-w-md"
        />
        <button
          onClick={() => setAllItems(handleSearch())}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {displayedItems.length === 0 ? (
        <p className="italic text-gray-500">No matching auction items found.</p>
      ) : (
        <ul className="bg-white rounded shadow p-4">
          {displayedItems.map((item) => (
            <li
              key={item.id}
              className={`p-2 mb-2 border rounded ${item.status === "Open" ? "bg-green-50" : "bg-gray-100"
                }`}
            >
              <div className="font-semibold text-lg">{item.description}</div>
              <div>Status: <span className="text-sm italic">{item.status}</span></div>
              {item.bids?.length > 0 && (
                <div>
                  <strong>Bids:</strong>
                  <ul className="ml-4 list-disc">
                    {item.bids.map((bid, i) => (
                      <li key={i}>
                        {bid.uid} bid <span className="font-bold">${bid.amount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
