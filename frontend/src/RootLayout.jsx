import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

function RootLayout({ setUser }) {
  return (
    <div>
      <Navbar setUser={setUser} />
      <Outlet />
    </div>
  );
}

export default RootLayout