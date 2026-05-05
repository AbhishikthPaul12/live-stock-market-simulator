import { useEffect, useState } from "react"
import { getTransactions } from "../api/data.js"

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getTransactions();
      setTransactions(data);
    }
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Transactions
      </h1>

      <div className="bg-white rounded shadow">
        {transactions.map((txn, i) => (
          <div
            key={i}
            className="flex justify-between p-4 border-b"
          >
            <div>
              <p className="font-semibold">
                {txn.type} - {txn.symbol}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(txn.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              Qty: {txn.quantity} <br />
              ₹{txn.price}
            </div>

            <span
              className={
                txn.type === "BUY"
                  ? "text-blue-500"
                  : "text-red-500"
              }
            >
              {txn.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transactions