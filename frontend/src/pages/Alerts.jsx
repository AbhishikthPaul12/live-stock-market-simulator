function Alerts() {
  const alerts = [
    { message: "TCS crossed ₹4000 📈" },
    { message: "INFY dropped below ₹1500 📉" },
    { message: "RELIANCE showing strong momentum 🚀" }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Alerts</h1>

      <div className="bg-white rounded shadow">
        {alerts.map((alert, i) => (
          <div key={i} className="p-4 border-b">
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts