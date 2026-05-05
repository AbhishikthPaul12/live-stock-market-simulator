import { useContext } from "react"
import { AppContext } from "../contexts/AppContext"

function Transactions() {
  const { transactions } = useContext(AppContext);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Transaction History
      </h1>

      {transactions.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">
            No transactions yet
          </p>
        </div>
      ) : (
        <div className="bg-white rounded shadow">
          {transactions.map(function (txn, index) {
            return (
              <div
                key={index}
                className="flex justify-between items-center p-4 border-b"
              >
                <div>
                  <p className="font-semibold">
                    {txn.type} - {txn.symbol}
                  </p>
                  <p className="text-sm text-gray-500">
                    {txn.date}
                  </p>
                </div>

                <div className="text-right">
                  <p>Qty: {txn.quantity}</p>
                  <p>₹{txn.price}</p>
                </div>

                <span
                  className={
                    "font-bold " +
                    (txn.type === "BUY"
                      ? "text-blue-500"
                      : "text-red-500")
                  }
                >
                  {txn.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Transactions