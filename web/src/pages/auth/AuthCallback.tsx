import { useEffect, useState, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react"
import { useAuth } from "@/providers/AuthProvider"
import { exchangeOAuthCode } from "@/services/auth.service"
import { Button } from "@/components/ui/button"

export default function AuthCallbackPage() {
    const navigate = useNavigate()
    const auth = useAuth()
    const [searchParams] = useSearchParams()
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(true)
    const initiated = useRef(false)

    useEffect(() => {
        // Prevent double invocation in React 18 strict mode
        if (initiated.current) return
        initiated.current = true

        const code = searchParams.get("code")
        const urlError = searchParams.get("error")

        if (urlError) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(
                urlError === "google_auth_failed"
                    ? "Google authentication failed. Please try again."
                    : urlError === "email_already_registered"
                        ? "This email is already registered with another account. Please sign in instead."
                        : urlError
            )
            setIsProcessing(false)
            return
        }

        if (!code) {
            setError("No authorization code provided from Google.")
            setIsProcessing(false)
            return
        }

        async function processCallback() {
            try {
                const response = await exchangeOAuthCode(code!)
                const authData = response?.data

                if (!authData?.access_token || !authData?.refresh_token || !authData?.user) {
                    setError("Failed to obtain user session from Server.")
                    setIsProcessing(false)
                    return
                }

                // Save session (default to rememberMe = true for OAuth logins)
                auth.setSession(
                    {
                        accessToken: authData.access_token,
                        refreshToken: authData.refresh_token,
                        user: authData.user,
                    },
                    true
                )

                const role = String(authData.user.role || "").toUpperCase()
                const destination = role === "ADMIN" ? "/admin/dashboard" : role === "STAFF" ? "/staff/dashboard" : "/dashboard"
                navigate(destination, { replace: true })
            } catch (err) {
                const message = err instanceof Error ? err.message : "Authentication failed"
                setError(message)
                setIsProcessing(false)
            }
        }

        processCallback()
    }, [searchParams, navigate, auth])

    return (
        <div className="login-root">
            <div className="login-frame">
                <div className="login-center">
                    <div className="login-card animate-fade-in">
                        <div className="text-center space-y-4">
                            <h1 className="login-title">AI Stock Trend</h1>
                            
                            {isProcessing && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <Loader2 className="size-8 animate-spin text-blue-500" />
                                    <p className="text-sm text-slate-400">Verifying session with Google...</p>
                                    <p className="text-xs text-slate-500">Please wait while we establish your secure session.</p>
                                </div>
                            )}

                            {error && (
                                <div className="space-y-4 py-4">
                                    <div className="flex justify-center">
                                        <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-full">
                                            <AlertTriangle className="size-6 text-red-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-md font-semibold text-slate-200">Authentication Error</h2>
                                        <p className="text-xs text-red-400 leading-relaxed bg-red-950/20 p-2.5 rounded border border-red-950/50">{error}</p>
                                    </div>
                                    <Button
                                        onClick={() => navigate("/login", { replace: true })}
                                        className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold h-9"
                                    >
                                        Back to Login Page
                                        <ArrowRight className="size-3.5 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
