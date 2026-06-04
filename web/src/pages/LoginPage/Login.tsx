import { useState, useEffect } from "react"
import {
    AlertTriangle,
    ArrowRight,
    Eye,
    EyeOff,
    Globe,
    Lock,
    Mail,
    ShieldCheck,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { login } from "@/services/auth.service.ts"
import { useAuth } from "@/providers/AuthProvider"
import { Input } from "@/components/ui/input"
import "./login.css"

type LoginErrors = {
    email?: string
    password?: string
    auth?: string
}

function validateEmail(value: string) {
    if (!value.trim()) {
        return "Email address is required."
    }

    const normalized = value.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(normalized)) {
        return "Enter a valid email address."
    }

    return undefined
}

function validatePassword(value: string) {
    if (!value.trim()) {
        return "Password is required."
    }

    return undefined
}

export default function LoginPage() {
    const navigate = useNavigate()
    const auth = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<LoginErrors>({})

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const nextErrors: LoginErrors = {
            email: validateEmail(email),
            password: validatePassword(password),
        }

        setErrors(nextErrors)

        if (nextErrors.email || nextErrors.password) {
            return
        }

        setIsSubmitting(true)

        try {
            const response = await login({ email: email.trim(), password })
            const authData = response?.data

            if (!authData?.access_token || !authData?.refresh_token || !authData?.user) {
                setErrors({ auth: "Login failed. Please try again." })
                return
            }

            auth.setSession(
                {
                    accessToken: authData.access_token,
                    refreshToken: authData.refresh_token,
                    user: authData.user,
                },
                rememberMe
            )

            const role = String(authData.user.role || "").toUpperCase()
            const destination = role === "ADMIN" ? "/admin/dashboard" : role === "STAFF" ? "/staff/dashboard" : "/dashboard"
            navigate(destination, { replace: true })
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login failed"
            setErrors({ auth: message })
        } finally {
            setIsSubmitting(false)
        }
    }

    const passwordHasError = Boolean(errors.password || errors.auth)

    useEffect(() => {
        if (auth.isAuthenticated) {
            const role = String(auth.user?.role || "").toUpperCase()
            const destination = role === "ADMIN" ? "/admin/dashboard" : role === "STAFF" ? "/staff/dashboard" : "/dashboard"
            navigate(destination, { replace: true })
        }
    }, [auth, navigate])

    return (
        <div className="login-root">
            <div className="login-frame">
                <div className="login-center">
                    <div className="login-card">
                        <div className="text-center">
                            <h1 className="login-title">AI Stock Trend</h1>
                            <p className="login-subtitle">Welcome back!</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="login-label" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="login-input-wrapper">
                                    <Mail className="login-input-icon size-3.5" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value.trimStart())
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: undefined,
                                                auth: undefined,
                                            }))
                                        }}
                                        placeholder="name@institution.com"
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                        className={cn(
                                            "login-input",
                                            errors.email && "login-input-error"
                                        )}
                                    />
                                </div>
                                {errors.email ? (
                                    <p id="email-error" className="login-error">
                                        {errors.email}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-1.5">
                                <label className="login-label" htmlFor="password">
                                    Password
                                </label>
                                <div className="login-input-wrapper">
                                    <Lock className="login-input-icon size-3.5" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value)
                                            setErrors((prev) => ({
                                                ...prev,
                                                password: undefined,
                                                auth: undefined,
                                            }))
                                        }}
                                        placeholder="********"
                                        aria-invalid={passwordHasError}
                                        aria-describedby={
                                            passwordHasError ? "password-error" : undefined
                                        }
                                        className={cn(
                                            "login-input with-action",
                                            passwordHasError && "login-input-error"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="login-input-action rounded-sm p-1 text-slate-500 transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600/40"
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-3.5" />
                                        ) : (
                                            <Eye className="size-3.5" />
                                        )}
                                    </button>
                                </div>
                                {passwordHasError ? (
                                    <div id="password-error" className="login-error">
                                        <AlertTriangle className="size-3.5" />
                                        <span>{errors.password ?? errors.auth}</span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="login-row">
                                <label className="login-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(event) => setRememberMe(event.target.checked)}
                                    />
                                    Remember me
                                </label>
                                <Link className="login-link" to="/forgot-password">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="login-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="size-3.5 animate-spin rounded-full border border-white/40 border-t-white" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        Login Securely
                                        <ArrowRight className="size-3.5" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <p className="login-footer-text">
                            Don&apos;t have an institutional account?{" "}
                            <Link to="/register" className="login-link">
                                Register
                            </Link>
                        </p>

                        <div className="login-divider">
                            <p className="login-security-message">
                                Protected by End-to-End Encryption
                            </p>
                            <div className="login-security-icons">
                                <ShieldCheck className="size-4" aria-hidden="true" />
                                <Lock className="size-4" aria-hidden="true" />
                                <Globe className="size-4" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
