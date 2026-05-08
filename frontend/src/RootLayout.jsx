import Navbar from "./components/Navbar";
import AIChatbot from "./components/AIChatbot";
import { Outlet } from "react-router-dom";

function RootLayout({ setUser }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar setUser={setUser} />
      <main className="flex-1">
        <Outlet />
      </main>
      <AIChatbot />
    </div>
  );
}

export default RootLayout;