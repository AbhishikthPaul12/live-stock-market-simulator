import { useState, useEffect } from "react"

function SellModal(props) {
  const { stock, onClose, onConfirm } = props;
  const [qty, setQty] = useState(1);

  // Reset qty when stock changes
  useEffect(() => {
    setQty(1);
  }, [stock]);

  if (!stock || !stock.symbol) return null;

  function handleConfirm() {
    if (!qty || qty <= 0) {
      alert("Enter valid quantity");
      return;
    }

    if (qty > stock.quantity) {
      alert("Cannot sell more than owned");
      return;
    }

    onConfirm(stock.symbol, stock.currentPrice, qty);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-xl font-bold">
          Sell {stock.symbol}
        </h2>

        <p className="mt-2 text-gray-600">
          Available: {stock.quantity}
        </p>

        <p className="mt-1 text-gray-500">
          Current Price: ₹{stock.currentPrice || stock.buyPrice}
        </p>

        <input
          type="number"
          min="1"
          max={stock.quantity}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="border p-2 mt-3 w-full rounded"
        />

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-400 px-3 py-1 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellModal