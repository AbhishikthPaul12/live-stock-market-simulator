function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Balance:</strong> ₹{user?.walletBalance}</p>
      </div>
    </div>
  );
}

export default Profile