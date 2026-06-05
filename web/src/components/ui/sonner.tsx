import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      richColors={false}
      closeButton
      expand={true}
      gap={8}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "#111827",
          "--normal-text": "#F8FAFC",
          "--normal-border": "#334155",
          "--success-bg": "#111827",
          "--success-text": "#F8FAFC",
          "--success-border": "#22C55E",
          "--error-bg": "#111827",
          "--error-text": "#F8FAFC",
          "--error-border": "#EF4444",
          "--info-bg": "#111827",
          "--info-text": "#F8FAFC",
          "--info-border": "#38BDF8",
          "--warning-bg": "#111827",
          "--warning-text": "#F8FAFC",
          "--warning-border": "#FACC15",
          "--border-radius": "8px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          title: "text-sm font-medium",
          description: "text-xs text-[#94A3B8]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
