import { useContext } from "react"
import { AppContext } from "../contexts/AppContext"

function Watchlist() {
  const { watchlist, removeFromWatchlist } =
    useContext(AppContext);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Watchlist
      </h1>

      {watchlist.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">
            No stocks in watchlist
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {watchlist.map(function (item, index) {
            return (
              <div
                key={index}
                className="bg-white p-5 rounded-xl shadow"
              >
                <h2 className="text-xl font-semibold">
                  {item.symbol}
                </h2>

                <p className="mt-2 text-gray-600">
                  Price: ₹{item.price}
                </p>

                <button
                  onClick={() =>
                    removeFromWatchlist(item.symbol)
                  }
                  className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Watchlist