import {LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid} from "recharts"

function PortfolioChart(props) {
  const { portfolio } = props;

  // Convert portfolio into chart data
  const data = portfolio.map(function (item) {
    return {
      name: item.symbol,
      value: item.buyPrice*item.quantity
    };
  });

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">
        Portfolio Distribution
      </h2>

      <LineChart width={400} height={250} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" />
      </LineChart>
    </div>
  );
}

export default PortfolioChart