import Navbar from "./components/Navbar";
import AIChatbot from "./components/AIChatbot";
import { Outlet } from "react-router-dom";

function RootLayout({ user, setUser }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} setUser={setUser} />
      <main className="flex-1">
        <Outlet />
      </main>
      <AIChatbot user={user} />
    </div>
  );
}

export default RootLayout;