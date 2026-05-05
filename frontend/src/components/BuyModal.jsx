import { useState, useEffect } from "react"

function BuyModal(props) {
  const { stock, onClose, onConfirm } = props;
  const [qty, setQty] = useState(1);

  // Reset qty when stock changes
  useEffect(() => {
    setQty(1);
  }, [stock]);

  if (!stock) return null;

  function handleConfirm() {
    if (!qty || qty <= 0) {
      alert("Enter valid quantity");
      return;
    }

    onConfirm(stock.symbol, stock.price, qty);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-xl font-bold">Buy {stock.symbol}</h2>

        <p className="mt-2">Price: ₹{stock.price}</p>

        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="border p-2 mt-3 w-full"
          min="1"
        />

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="bg-gray-400 px-3 py-1">
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-3 py-1"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyModal