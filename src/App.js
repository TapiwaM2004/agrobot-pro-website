import React, { useState, useEffect } from "react";
import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Community    from "./pages/Community";
import Prices       from "./pages/Prices";
import Seeds        from "./pages/Seeds";
import Profile      from "./pages/Profile";
import Marketplace  from "./pages/Marketplace";
import Disease      from "./pages/Disease";
import Soil         from "./pages/Soil";
import Weather      from "./pages/Weather";
import News         from "./pages/News";
import HelpNearby   from "./pages/HelpNearby";
import Loans        from "./pages/Loans";
import FarmPlan     from "./pages/FarmPlan";
import PhotoAnalysis from "./pages/PhotoAnalysis";
import Admin        from "./pages/Admin";
import Support      from "./pages/Support";
import Notifications from "./pages/Notifications";
import Payment      from "./pages/Payment";
import Navbar       from "./components/Navbar";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const saved = localStorage.getItem("agrobot_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("agrobot_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("agrobot_user");
    setPage("dashboard");
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("agrobot_user", JSON.stringify(updated));
  };

  if (!user) return <Login onLogin={login} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":     return <Dashboard     user={user} setPage={setPage} />;
      case "community":     return <Community     user={user} />;
      case "prices":        return <Prices        user={user} />;
      case "seeds":         return <Seeds         user={user} />;
      case "marketplace":   return <Marketplace   user={user} />;
      case "profile":       return <Profile       user={user} onLogout={logout} setPage={setPage} />;
      case "disease":       return <Disease       user={user} />;
      case "soil":          return <Soil          user={user} />;
      case "weather":       return <Weather       user={user} />;
      case "news":          return <News          user={user} />;
      case "help":          return <HelpNearby    user={user} />;
      case "loans":         return <Loans         user={user} />;
      case "farmplan":      return <FarmPlan      user={user} />;
      case "photo":         return <PhotoAnalysis user={user} />;
      case "admin": return <Admin onExit={() => setPage("dashboard")} />;
      case "support":       return <Support       user={user} />;
      case "notifications": return <Notifications user={user} />;
      case "payment":       return (
        <Payment
          user={user}
          onSuccess={(plan) => {
            updateUser({ plan });
            setPage("dashboard");
          }}
        />
      );
      default: return <Dashboard user={user} setPage={setPage} />;
    }
  };

  return (
    <div>
      <Navbar page={page} setPage={setPage} user={user} onLogout={logout} />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:16 }}>
        {renderPage()}
      </div>
    </div>
  );
}