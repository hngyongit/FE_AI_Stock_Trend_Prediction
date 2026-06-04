import { useEffect, useMemo, useState } from "react"
import { RefreshCw, User, Mail, Shield, Calendar, CheckCircle, XCircle, Loader2, Save, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { useFormik } from "formik"
import { object, string, ref } from "yup"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/providers/AuthProvider"
import { getMyProfile, updateMyProfile, changeMyPassword, type UserProfile } from "@/services/users.service"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

/* ── Helpers ────────────────────────────────────────── */

function textOrPlaceholder(value?: string | null) {
    return value?.trim() ? value : "--"
}

function formatDate(value?: string) {
    if (!value) return "--"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "--"
    return date.toLocaleString()
}

function getInitials(name?: string) {
    if (!name) return "U"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function getRoleBadgeVariant(role?: string) {
    switch (role?.toUpperCase()) {
        case "ADMIN":
            return "default" as const
        case "STAFF":
            return "secondary" as const
        default:
            return "outline" as const
    }
}

function getStatusIcon(status?: string) {
    return status?.toUpperCase() === "ACTIVE" ? (
        <CheckCircle className="size-3.5 text-[#22C55E]" />
    ) : (
        <XCircle className="size-3.5 text-[#EF4444]" />
    )
}

/* ── Yup schemas ────────────────────────────────────── */

const profileSchema = object({
    fullName: string()
        .required("Full name is required.")
        .min(2, "Full name must be at least 2 characters.")
        .max(100, "Full name must be under 100 characters."),
})

const passwordSchema = object({
    currentPassword: string().required("Current password is required."),
    newPassword: string()
        .required("New password is required.")
        .min(8, "Must be at least 8 characters.")
        .matches(/[a-z]/, "Must include a lowercase letter.")
        .matches(/[0-9]/, "Must include a number."),
    confirmNewPassword: string()
        .required("Please confirm your new password.")
        .oneOf([ref("newPassword")], "Passwords do not match."),
})

/* ── Component ──────────────────────────────────────── */

export default function UserProfilePage() {
    const auth = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadTick, setReloadTick] = useState(0)

    // Dialog open states
    const [editProfileOpen, setEditProfileOpen] = useState(false)
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)

    // Password visibility
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)

    // Profile submission state
    const [profileSubError, setProfileSubError] = useState<string | null>(null)

    // Password submission state
    const [pwSubError, setPwSubError] = useState<string | null>(null)

    /* ── Load profile ────────────────────────────────── */

    useEffect(() => {
        let isActive = true

        async function loadProfile() {
            if (!auth.accessToken) {
                if (isActive) {
                    setProfile(null)
                    setError("Missing access token")
                    setIsLoading(false)
                }
                return
            }

            setIsLoading(true)
            setError(null)
            try {
                const data = await getMyProfile()
                if (isActive) setProfile(data)
            } catch (err) {
                if (isActive) {
                    setProfile(null)
                    setError(err instanceof Error ? err.message : "Unable to load profile")
                }
            } finally {
                if (isActive) setIsLoading(false)
            }
        }

        loadProfile()
        return () => {
            isActive = false
        }
    }, [auth.accessToken, reloadTick])

    /* ── Edit Profile Formik ─────────────────────────── */

    const profileFormik = useFormik({
        initialValues: {
            fullName: profile?.full_name ?? "",
        },
        validationSchema: profileSchema,
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            setProfileSubError(null)
            try {
                const updated = await updateMyProfile({ full_name: values.fullName.trim() })
                setProfile((prev) => ({ ...prev, ...updated }))
                setEditProfileOpen(false)
            } catch (err) {
                setProfileSubError(err instanceof Error ? err.message : "Unable to update profile")
            } finally {
                setSubmitting(false)
            }
        },
    })

    /* ── Change Password Formik ──────────────────────── */

    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        validationSchema: passwordSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setPwSubError(null)
            try {
                await changeMyPassword({
                    current_password: values.currentPassword,
                    new_password: values.newPassword,
                })
                setChangePasswordOpen(false)
                resetForm()
            } catch (err) {
                setPwSubError(err instanceof Error ? err.message : "Unable to change password")
            } finally {
                setSubmitting(false)
            }
        },
    })

    /* ── Derived data ────────────────────────────────── */

    const rows = useMemo(
        () => [
            { label: "Full Name", value: textOrPlaceholder(profile?.full_name), icon: User },
            { label: "Email", value: textOrPlaceholder(profile?.email), icon: Mail },
            { label: "Role", value: textOrPlaceholder(profile?.role), icon: Shield },
            { label: "Created At", value: formatDate(profile?.created_at), icon: Calendar },
        ],
        [profile]
    )

    const handleEditProfileOpen = () => {
        profileFormik.setFieldValue("fullName", profile?.full_name ?? "")
        profileFormik.setErrors({})
        setProfileSubError(null)
        setEditProfileOpen(true)
    }

    const handleChangePasswordOpen = () => {
        passwordFormik.resetForm()
        setPwSubError(null)
        setChangePasswordOpen(true)
    }

    if (isLoading) {
        return (
            <section className="terminal-workspace-page flex items-center justify-center" aria-label="User profile">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </section>
        )
    }

    if (error) {
        return (
            <section className="terminal-workspace-page" aria-label="User profile">
                <header className="terminal-workspace-page__header">
                    <h1 className="terminal-workspace-page__title">User Profile</h1>
                </header>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center">
                    <AlertTriangle className="size-8 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => setReloadTick((prev) => prev + 1)}>
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Retry
                    </Button>
                </div>
            </section>
        )
    }

    return (
        <section className="terminal-workspace-page" aria-label="User profile">
            {/* Header */}
            <header className="terminal-workspace-page__header">
                <div>
                    <h1 className="terminal-workspace-page__title">User Profile</h1>
                    <p className="terminal-workspace-page__subtitle">Manage your profile information and security settings</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setReloadTick((prev) => prev + 1)}>
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Refresh
                </Button>
            </header>

            {/* Profile Avatar + Identity Card */}
            <div className="mt-5 rounded-lg border border-border bg-[#111827] p-5">
                <div className="flex items-start gap-4">
                    <Avatar size="lg" className="size-14">
                        <AvatarFallback className="bg-[#1E293B] text-lg font-semibold text-[#F8FAFC]">
                            {getInitials(profile?.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-[#F8FAFC]">
                            {textOrPlaceholder(profile?.full_name)}
                        </h2>
                        <p className="mt-0.5 text-sm text-[#94A3B8]">
                            {textOrPlaceholder(profile?.email)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(profile?.role)}>
                                {textOrPlaceholder(profile?.role)}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                                {getStatusIcon(profile?.status)}
                                {textOrPlaceholder(profile?.status)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {rows.map((row) => {
                    const Icon = row.icon
                    return (
                        <div
                            key={row.label}
                            className="rounded-lg border border-border bg-[#111827] px-4 py-3 transition hover:border-[#334155]"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="size-3.5 text-[#64748B]" />
                                <span className="text-[0.72rem] font-medium text-[#94A3B8] uppercase tracking-wider">
                                    {row.label}
                                </span>
                            </div>
                            <div className="mt-1.5 text-sm text-[#F8FAFC]">{row.value}</div>
                        </div>
                    )
                })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleEditProfileOpen}>
                    <User className="mr-1.5 size-3.5" />
                    Edit Profile
                </Button>
                <Button variant="outline" onClick={handleChangePasswordOpen}>
                    <Lock className="mr-1.5 size-3.5" />
                    Change Password
                </Button>
            </div>

            {/* ─── Edit Profile Dialog ─── */}
            <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your full name displayed on your account.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={profileFormik.handleSubmit} noValidate>
                        {profileSubError ? (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                {profileSubError}
                            </div>
                        ) : null}

                        <div className="space-y-1.5">
                            <label htmlFor="edit-fullName" className="text-xs font-medium text-[#94A3B8]">
                                Full name
                            </label>
                            <Input
                                id="edit-fullName"
                                name="fullName"
                                value={profileFormik.values.fullName}
                                onChange={profileFormik.handleChange}
                                onBlur={profileFormik.handleBlur}
                                placeholder="e.g. Jane Doe"
                                aria-invalid={Boolean(profileFormik.touched.fullName && profileFormik.errors.fullName)}
                                className={profileFormik.touched.fullName && profileFormik.errors.fullName ? "border-red-500" : ""}
                            />
                            {profileFormik.touched.fullName && profileFormik.errors.fullName ? (
                                <p className="text-xs text-red-400">{profileFormik.errors.fullName}</p>
                            ) : null}
                        </div>

                        <DialogFooter className="mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={profileFormik.isSubmitting}>
                                {profileFormik.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-3.5" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ─── Change Password Dialog ─── */}
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and a new strong password.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={passwordFormik.handleSubmit} noValidate>
                        {pwSubError ? (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                {pwSubError}
                            </div>
                        ) : null}

                        <div className="space-y-4">
                            {/* Current password */}
                            <div className="space-y-1.5">
                                <label htmlFor="currentPassword" className="text-xs font-medium text-[#94A3B8]">
                                    Current password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type={showCurrentPw ? "text" : "password"}
                                        value={passwordFormik.values.currentPassword}
                                        onChange={passwordFormik.handleChange}
                                        onBlur={passwordFormik.handleBlur}
                                        placeholder="Current password"
                                        aria-invalid={Boolean(passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword)}
                                        className={`pr-10${passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? " border-red-500" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw((prev) => !prev)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
                                    >
                                        {showCurrentPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                    </button>
                                </div>
                                {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? (
                                    <p className="text-xs text-red-400">{passwordFormik.errors.currentPassword}</p>
                                ) : null}
                            </div>

                            {/* New password */}
                            <div className="space-y-1.5">
                                <label htmlFor="newPassword" className="text-xs font-medium text-[#94A3B8]">
                                    New password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPw ? "text" : "password"}
                                        value={passwordFormik.values.newPassword}
                                        onChange={passwordFormik.handleChange}
                                        onBlur={passwordFormik.handleBlur}
                                        placeholder="New password"
                                        aria-invalid={Boolean(passwordFormik.touched.newPassword && passwordFormik.errors.newPassword)}
                                        className={`pr-10${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? " border-red-500" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw((prev) => !prev)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        aria-label={showNewPw ? "Hide new password" : "Show new password"}
                                    >
                                        {showNewPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                    </button>
                                </div>
                                {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? (
                                    <p className="text-xs text-red-400">{passwordFormik.errors.newPassword}</p>
                                ) : null}
                            </div>

                            {/* Confirm new password */}
                            <div className="space-y-1.5">
                                <label htmlFor="confirmNewPassword" className="text-xs font-medium text-[#94A3B8]">
                                    Confirm new password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="confirmNewPassword"
                                        name="confirmNewPassword"
                                        type={showConfirmPw ? "text" : "password"}
                                        value={passwordFormik.values.confirmNewPassword}
                                        onChange={passwordFormik.handleChange}
                                        onBlur={passwordFormik.handleBlur}
                                        placeholder="Confirm new password"
                                        aria-invalid={Boolean(passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword)}
                                        className={`pr-10${passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword ? " border-red-500" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw((prev) => !prev)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                                    >
                                        {showConfirmPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                    </button>
                                </div>
                                {passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword ? (
                                    <p className="text-xs text-red-400">{passwordFormik.errors.confirmNewPassword}</p>
                                ) : null}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={passwordFormik.isSubmitting}>
                                {passwordFormik.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-1.5 size-3.5" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    )
}
