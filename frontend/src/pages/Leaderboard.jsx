import { useEffect, useState } from "react"
import { getLeaderboard } from "../api/data.js"

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getLeaderboard();

        if (Array.isArray(res)) {
          setUsers(res);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }

      } catch (err) {
        console.log("Leaderboard error:", err);
        setUsers([]);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      {users.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p>No leaderboard data</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow">
          {users.map((user, i) => (
            <div
              key={i}
              className="flex justify-between p-4 border-b"
            >
              <span>
                #{i + 1} {user.name || "User"}
              </span>

              <span className="font-bold text-green-600">
                ₹{user.walletBalance || 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard