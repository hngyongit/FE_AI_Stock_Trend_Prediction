import { BrowserRouter } from "react-router-dom"
import AppRoutes from "@/routes/AppRoutes"
import { AuthProvider } from "@/providers/AuthProvider"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
