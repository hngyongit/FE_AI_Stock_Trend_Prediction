import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { getDefaultHomeRouteByRole } from "@/lib/role-routes"
import { useAuth } from "@/providers/AuthProvider"

export default function NothingHere() {
    const auth = useAuth()
    const navigate = useNavigate()
    const home = getDefaultHomeRouteByRole(auth.user?.role)

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-6xl font-bold text-slate-300">404</h1>
            <h2 className="text-xl font-semibold text-slate-600">Nothing here</h2>
            <p className="max-w-md text-sm text-slate-400">
                The page you are looking for doesn't exist or you don't have permission to access it.
            </p>
            <Button variant="default" onClick={() => navigate(home, { replace: true })}>
                Back to home
            </Button>
        </div>
    )
}
