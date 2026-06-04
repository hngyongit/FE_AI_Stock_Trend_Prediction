import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type SearchInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Search by symbol or company" }: SearchInputProps) {
    return (
        <label className="shared-search">
            <Search className="shared-search__icon size-4" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="shared-search__input"
            />
        </label>
    )
}