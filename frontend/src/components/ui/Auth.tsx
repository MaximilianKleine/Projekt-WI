import { Outlet} from "react-router-dom"
import {Button} from "@/components/ui/button.tsx";
import Navbar from "@/components/Navbar.tsx";

export function Authentifizierung(){
    return(

            <div className="flex flex-col h-screen">
                {/* Login und Registrierung mit header*/}
                <header className="border-b pb-2 pt-2">
                      <div className="w-full px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 bg-blue-400 rounded-md"></div>
                          <h1 className="text-xl font-bold">Meeting AI</h1>
                        </div>
                      </div>
                    </header>

                <main className="flex-1 flex items-center justify-center bg-[#eeede9]">
                    <Outlet/>
                </main>
            </div>
    )
}

export function AppUI(){
    return(
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="border-b pb-2 pt-2">
                <div className="w-full px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-7 bg-blue-400 rounded-md"></div>
                        <h1 className="text-xl font-bold">Meeting AI</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 md:items-center">
                        <Button variant="secondary">Hochladen</Button>
                        <Button variant="secondary" className="bg-blue-400 hover:bg-blue-500 text-white rounded-xl">
                            Neues Meeting
                        </Button>
                    </div>
                </div>
            </header>

            {/* Body: Navbar + Seite nebeneinander */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <Navbar />

                {/* Seiteninhalt */}
                <main className="flex-1 p-6 overflow-auto bg-[#eeede9]">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}

