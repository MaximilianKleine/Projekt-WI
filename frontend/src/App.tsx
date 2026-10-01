import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import Meetings from "./pages/Meetings";
import Analyse from "./pages/Analyse";
import Einstellungen from "./pages/Einstellungen";
import MeetingDetails from "./pages/MeetingDetails";
import {AppUI, Authentifizierung} from "./components/ui/Auth.tsx";
import Login from "@/Authentication/Pages/Login.tsx";
import Registrierung from "@/Authentication/Pages/Registrierung.tsx";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Authentifizierung />} >
          <Route path="/" element={<Login />} />
          <Route path="/registrierung" element={<Registrierung />} />
        </Route>
        <Route element={<AppUI/>}>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/meetings/:id" element={<MeetingDetails />} />
          <Route path="/analyse" element={<Analyse />} />
          <Route path="/einstellungen" element={<Einstellungen />} />
        </Route>
      </Routes>
      <Toaster richColors position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
