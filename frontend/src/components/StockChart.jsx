import {LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid} from "recharts"

function StockChart(props) {
  const { symbol } = props;

  // Dummy data (simulate market)
  const data = [
    { time: "9AM", price: 3500 },
    { time: "10AM", price: 3600 },
    { time: "11AM", price: 3700 },
    { time: "12PM", price: 3650 },
    { time: "1PM", price: 3800 }
  ];

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">
        {symbol} Price Chart
      </h2>

      <LineChart width={400} height={250} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="price" />
      </LineChart>
    </div>
  );
}

export default StockChart