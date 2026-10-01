import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMeetings } from "@/lib/meetingsStorage";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";

function Navbar() {
  /**
   * Liefert Informationen über die aktuell geöffnete Route.
   * Dadurch kann der aktive Navigationspunkt hervorgehoben werden.
   */
  const location = useLocation();
  const [meetingCount, setMeetingCount] = useState<number>(0);
  /**
   * updateMeetingCount ist jetzt async und awaits getMeetings
   */
  useEffect(() => {
    let ignore = false;

    const updateMeetingCount = async () => {
      const meetings = await getMeetings();
      if (!ignore) {
        setMeetingCount(meetings.length);
      }
    };

    // Beim Laden
    void updateMeetingCount();

    // Wenn ein neues Meeting gespeichert wurde
    window.addEventListener("meetingsUpdated", updateMeetingCount);

    return () => {
      ignore = true;
      window.removeEventListener("meetingsUpdated", updateMeetingCount);
    };
  }, []);

  /**
   * Erzeugt abhängig von der aktuellen Route die passenden CSS-Klassen.
   * Der aktive Menüpunkt wird farblich hervorgehoben,
   * während inaktive Einträge lediglich einen Hover-Effekt besitzen.
   */
  const linkClass = (path: string) => `
        px-3 py-1.5 rounded-md text-sm transition-colors
        ${
          location.pathname === path
            ? "bg-blue-100 text-blue-600 font-medium"
            : "hover:bg-gray-100 text-gray-600"
        }
    `;

  return (
    <nav className="flex px-6 py-4 h-screen border-r">
      {/* Vertikales Navigationsmenü */}
      <NavigationMenu className="items-start justify-start">
        <NavigationMenuList className="flex flex-col items-start gap-1">
          {/* Bereich: Hauptnavigation */}
          <NavigationMenuItem>
            <h1 className="-ml-3 mb-2 text-xs underline">Navigation</h1>

            <NavigationMenuLink asChild>
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Link zur Meetingübersicht */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/meetings" className={linkClass("/meetings")}>
                <span className="flex items-center gap-2">
                  Meetings
                  {/* Badge mit Anzahl der Meetings */}
                  <span className="text-white bg-blue-500 text-xs px-2 py-0.5 rounded-full">
                    {meetingCount}
                  </span>
                </span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Link zur Analyse-Seite */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/analyse" className={linkClass("/analyse")}>
                Analyse
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Bereich: Systemeinstellungen */}
          <NavigationMenuItem>
            <h1 className="-ml-3 mb-2 mt-2 text-xs underline">System</h1>

            <NavigationMenuLink asChild>
              <Link to="/einstellungen" className={linkClass("/einstellungen")}>
                Einstellungen
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}

export default Navbar;
