type UserPlaceholderPageProps = {
    title: string
}

export default function UserPlaceholderPage({ title }: UserPlaceholderPageProps) {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-slate-400">This page is coming soon.</p>
        </div>
    )
}
