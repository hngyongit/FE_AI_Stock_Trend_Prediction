import { useState } from "react"
import { Bell, Shield, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { Breadcrumb } from "@/shared/components"

export default function SettingsPage() {
    const { user } = useAuthStore()
    const [emailAlerts, setEmailAlerts] = useState(true)

    const isPro = user?.plan === "PRO" || user?.subscription?.plan === "PRO"

    return (
        <div className="p-6 text-[var(--foreground)] flex flex-col gap-6">
            <Breadcrumb items={["Home", "Settings"]} />
            
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-[var(--muted-foreground)]">Manage your account preferences and alert settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Plan Card */}
                <div className="bg-[#111827] p-6 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-4">
                        <Shield className="text-blue-400 size-5" />
                        <h2 className="text-lg font-semibold">Account Plan</h2>
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Current Plan</div>
                        <div className="text-xl font-bold text-white uppercase">{isPro ? "PRO" : "FREE"}</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Watchlist Capacity</div>
                        <div className="text-md font-medium text-slate-200">
                            {isPro ? "Up to 50 Stocks" : "Up to 5 Stocks (Limited)"}
                        </div>
                    </div>
                    {!isPro && (
                        <Button asChild variant="default" size="sm" className="mt-2">
                            <Link to="/upgrade">Upgrade to Pro</Link>
                        </Button>
                    )}
                </div>

                {/* Alert Preferences Card */}
                <div className="bg-[#111827] p-6 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-4">
                        <Bell className="text-yellow-400 size-5" />
                        <h2 className="text-lg font-semibold">Alert Preferences</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-200 flex items-center gap-2">
                                <Mail className="size-4" /> Email Notifications
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Receive alert triggers via email.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={emailAlerts} 
                                onChange={(e) => setEmailAlerts(e.target.checked)} 
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}