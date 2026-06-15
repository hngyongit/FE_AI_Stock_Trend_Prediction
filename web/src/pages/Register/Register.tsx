import { useState, useEffect } from "react"
import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useFormik } from "formik"
import { object, string, ref, boolean } from "yup"

import { register } from "@/services/auth.service"
import "./Register.css"

/* ── Types ──────────────────────────────────────────── */

type RegisterFormValues = {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    agreeTerms: boolean
}

/* ── Yup schema ─────────────────────────────────────── */

const phoneRegex = /^[\d\s\-().+]{7,20}$/

const registerSchema = object({
    fullName: string()
        .required("Full name is required.")
        .min(2, "Full name must be at least 2 characters.")
        .max(100, "Full name must be under 100 characters."),
    email: string()
        .required("Email address is required.")
        .email("Enter a valid email address."),
    password: string()
        .required("Password is required.")
        .min(8, "Must be at least 8 characters.")
        .matches(/[a-z]/, "Must include a lowercase letter.")
        .matches(/[0-9]/, "Must include a number."),
    confirmPassword: string()
        .required("Please confirm your password.")
        .oneOf([ref("password")], "Passwords do not match."),
    phone: string()
        .notRequired()
        .test("phone-format", "Enter a valid phone number.", (value) => {
            if (!value || !value.trim()) return true
            return phoneRegex.test(value.trim())
        }),
    agreeTerms: boolean()
        .oneOf([true], "You must agree to the Terms of Service and Privacy Policy."),
})

/* ── Component ──────────────────────────────────────── */

export default function Register() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    useEffect(() => {
        const urlError = searchParams.get("error")
        if (urlError) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setServerError(
                urlError === "email_already_registered"
                    ? "This email is already registered with another account. Please log in."
                    : urlError === "google_auth_failed"
                        ? "Google registration failed. Please try again."
                        : urlError
            )
        }
    }, [searchParams])

    const handleGoogleRegister = () => {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ""
        window.location.href = `${apiBaseUrl}/api/auth/google/register`
    }

    const formik = useFormik<RegisterFormValues>({
        initialValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            agreeTerms: false,
        },
        validationSchema: registerSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            setServerError(null)

            try {
                await register({
                    full_name: values.fullName.trim(),
                    email: values.email.trim().toLowerCase(),
                    password: values.password,
                })

                navigate("/login", { replace: true })
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to create account. Please check your information and try again."
                setServerError(message)
            } finally {
                setSubmitting(false)
            }
        },
    })

    const getFieldClass = (field: keyof RegisterFormValues) =>
        [
            "register-input",
            field === "password" || field === "confirmPassword" ? "with-action" : "",
            formik.touched[field] && formik.errors[field] ? " register-input-error" : "",
        ]
            .filter(Boolean)
            .join(" ")

    return (
        <div className="register-root">
            <div className="register-frame">
                <div className="register-center">
                    <div className="register-card">
                        {/* Breadcrumb */}
                        <p className="register-breadcrumb">
                            <span className="register-breadcrumb-accent">Authentication</span>
                            {" "}› Register
                        </p>

                        {/* Title */}
                        <h1 className="register-title">Create your account</h1>
                        <p className="register-subtitle">
                            Create an account to access stock dashboards, watchlists, alerts, and market analytics.
                        </p>

                        <form
                            className="register-form"
                            onSubmit={formik.handleSubmit}
                            noValidate
                        >
                            {/* Server error */}
                            {serverError ? (
                                <div className="register-server-error" role="alert">
                                    <AlertTriangle className="size-3.5 shrink-0" />
                                    <span>{serverError}</span>
                                </div>
                            ) : null}

                            {/* Full name */}
                            <div className="register-field">
                                <label className="register-label" htmlFor="fullName">
                                    Full name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formik.values.fullName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="e.g. Jane Doe"
                                    aria-invalid={Boolean(formik.touched.fullName && formik.errors.fullName)}
                                    aria-describedby={
                                        formik.touched.fullName && formik.errors.fullName
                                            ? "fullName-error"
                                            : undefined
                                    }
                                    className={getFieldClass("fullName")}
                                />
                                {formik.touched.fullName && formik.errors.fullName ? (
                                    <p id="fullName-error" className="register-error">
                                        {formik.errors.fullName}
                                    </p>
                                ) : null}
                            </div>

                            {/* Email */}
                            <div className="register-field">
                                <label className="register-label" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.trimStart()
                                        formik.handleChange(e)
                                    }}
                                    onBlur={formik.handleBlur}
                                    placeholder="name@company.com"
                                    aria-invalid={Boolean(formik.touched.email && formik.errors.email)}
                                    aria-describedby={
                                        formik.touched.email && formik.errors.email
                                            ? "email-error"
                                            : undefined
                                    }
                                    className={getFieldClass("email")}
                                />
                                {formik.touched.email && formik.errors.email ? (
                                    <p id="email-error" className="register-error">
                                        {formik.errors.email}
                                    </p>
                                ) : null}
                            </div>

                            {/* Password + Confirm password side-by-side */}
                            <div className="register-row-duo">
                                {/* Password */}
                                <div className="register-field">
                                    <label className="register-label" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="register-input-wrapper">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="········"
                                            aria-invalid={Boolean(formik.touched.password && formik.errors.password)}
                                            aria-describedby={
                                                formik.touched.password && formik.errors.password
                                                    ? "password-error"
                                                    : undefined
                                            }
                                            className={getFieldClass("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="register-input-action rounded-sm p-1 text-slate-500 transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600/40"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </button>
                                    </div>
                                    {formik.touched.password && formik.errors.password ? (
                                        <p id="password-error" className="register-error">
                                            {formik.errors.password}
                                        </p>
                                    ) : null}
                                </div>

                                {/* Confirm password */}
                                <div className="register-field">
                                    <label className="register-label" htmlFor="confirmPassword">
                                        Confirm password
                                    </label>
                                    <div className="register-input-wrapper">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formik.values.confirmPassword}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="········"
                                            aria-invalid={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                                            aria-describedby={
                                                formik.touched.confirmPassword && formik.errors.confirmPassword
                                                    ? "confirmPassword-error"
                                                    : undefined
                                            }
                                            className={getFieldClass("confirmPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="register-input-action rounded-sm p-1 text-slate-500 transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600/40"
                                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        >
                                            {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </button>
                                    </div>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                                        <p id="confirmPassword-error" className="register-error">
                                            {formik.errors.confirmPassword}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            {/* Phone (optional) */}
                            <div className="register-field">
                                <label className="register-label" htmlFor="phone">
                                    Phone number <span className="text-slate-500">(Optional)</span>
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="+1 (555) 000-0000"
                                    aria-invalid={Boolean(formik.touched.phone && formik.errors.phone)}
                                    aria-describedby={
                                        formik.touched.phone && formik.errors.phone
                                            ? "phone-error"
                                            : undefined
                                    }
                                    className={getFieldClass("phone")}
                                />
                                {formik.touched.phone && formik.errors.phone ? (
                                    <p id="phone-error" className="register-error">
                                        {formik.errors.phone}
                                    </p>
                                ) : null}
                            </div>

                            {/* Terms checkbox */}
                            <div className="register-checkbox-row">
                                <input
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    type="checkbox"
                                    checked={formik.values.agreeTerms}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-invalid={Boolean(formik.touched.agreeTerms && formik.errors.agreeTerms)}
                                    aria-describedby={
                                        formik.touched.agreeTerms && formik.errors.agreeTerms
                                            ? "agreeTerms-error"
                                            : undefined
                                    }
                                />
                                <label htmlFor="agreeTerms">
                                    I agree to the{" "}
                                    <Link to="/terms-of-service" className="register-link">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy-policy" className="register-link">
                                        Privacy Policy
                                    </Link>.
                                </label>
                            </div>
                            {formik.touched.agreeTerms && formik.errors.agreeTerms ? (
                                <p id="agreeTerms-error" className="register-error" style={{ marginTop: -8 }}>
                                    {formik.errors.agreeTerms}
                                </p>
                            ) : null}

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="register-button"
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="size-3.5 animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        Create Account
                                        <ArrowRight className="size-3.5" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="social-divider">
                            <span>or continue with</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="google-register-button"
                        >
                            <svg className="google-icon" viewBox="0 0 24 24" width="16" height="16">
                                <path
                                    fill="#EA4335"
                                    d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.84 14.95 1 12 1 7.36 1 3.4 3.66 1.48 7.56l3.8 2.95C6.18 7.37 8.87 5.04 12 5.04z"
                                />
                                <path
                                    fill="#4285F4"
                                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.87 3.38-8.48z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.28 14.59c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17l-3.8-2.95C.52 9.07 0 10.48 0 12s.52 2.93 1.48 4.67l3.8-3.08z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.13 0-5.82-2.33-6.77-5.47l-3.8 2.95C3.4 20.34 7.36 23 12 23z"
                                />
                            </svg>
                            Sign up with Google
                        </button>

                        <p className="register-footer-text">
                            Already have an account?{" "}
                            <Link to="/login" className="register-link">
                                Log in to Terminal
                            </Link>
                        </p>

                        <div className="register-divider">
                            <p className="register-security-message">
                                EquiScope Pro Security
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
