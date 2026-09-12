import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import CustomerLayout from './layouts/CustomerLayout'
import ProviderLayout from './layouts/ProviderLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'

// Public
import Landing from './pages/public/Landing'
import Services from './pages/public/Services'
import HowItWorks from './pages/public/HowItWorks'
import About from './pages/public/About'
import Contact from './pages/public/Contact'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import VerifyOTP from './pages/auth/VerifyOTP'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Customer
import Dashboard from './pages/customer/Dashboard'
import Vehicles from './pages/customer/Vehicles'
import AssistanceLocation from './pages/customer/AssistanceLocation'
import AssistanceVehicle from './pages/customer/AssistanceVehicle'
import AssistanceProblem from './pages/customer/AssistanceProblem'
import AssistanceProviders from './pages/customer/AssistanceProviders'
import ProviderDetails from './pages/customer/ProviderDetails'
import AssistanceConfirm from './pages/customer/AssistanceConfirm'
import Requests from './pages/customer/Requests'
import Tracking from './pages/customer/Tracking'
import History from './pages/customer/History'
import HistoryDetail from './pages/customer/HistoryDetail'
import Payments from './pages/customer/Payments'
import InvoiceDetail from './pages/customer/InvoiceDetail'
import Review from './pages/customer/Review'
import AIAssistant from './pages/customer/AIAssistant'
import Notifications from './pages/customer/Notifications'
import Profile from './pages/customer/Profile'

// Provider
import ProviderDashboard from './pages/provider/Dashboard'
import ProviderRequests from './pages/provider/Requests'
import ActiveService from './pages/provider/ActiveService'
import ProviderHistory from './pages/provider/History'
import Earnings from './pages/provider/Earnings'
import ProviderNotifications from './pages/provider/Notifications'
import ProviderProfile from './pages/provider/Profile'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminProviders from './pages/admin/Providers'
import AdminRequests from './pages/admin/Requests'
import AdminPayments from './pages/admin/Payments'
import AdminReviews from './pages/admin/Reviews'
import AdminReports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'
import AdminSettings from './pages/admin/Settings'
import AdminProfile from './pages/admin/Profile'

import NotFound from './pages/common/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Customer application */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<Dashboard />} />
          <Route path="/customer/vehicles" element={<Vehicles />} />
          <Route path="/customer/assistance/location" element={<AssistanceLocation />} />
          <Route path="/customer/assistance/vehicle" element={<AssistanceVehicle />} />
          <Route path="/customer/assistance/problem" element={<AssistanceProblem />} />
          <Route path="/customer/assistance/providers" element={<AssistanceProviders />} />
          <Route path="/customer/providers/:providerId" element={<ProviderDetails />} />
          <Route path="/customer/assistance/confirm" element={<AssistanceConfirm />} />
          <Route path="/customer/requests" element={<Requests />} />
          <Route path="/customer/tracking/:requestId" element={<Tracking />} />
          <Route path="/customer/history" element={<History />} />
          <Route path="/customer/history/:serviceId" element={<HistoryDetail />} />
          <Route path="/customer/payments" element={<Payments />} />
          <Route path="/customer/invoices/:invoiceId" element={<InvoiceDetail />} />
          <Route path="/customer/review/:requestId" element={<Review />} />
          <Route path="/customer/ai-assistant" element={<AIAssistant />} />
          <Route path="/customer/notifications" element={<Notifications />} />
          <Route path="/customer/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Service provider application */}
      <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
        <Route element={<ProviderLayout />}>
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/requests" element={<ProviderRequests />} />
          <Route path="/provider/active-service" element={<ActiveService />} />
          <Route path="/provider/history" element={<ProviderHistory />} />
          <Route path="/provider/earnings" element={<Earnings />} />
          <Route path="/provider/notifications" element={<ProviderNotifications />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
        </Route>
      </Route>

      {/* Admin application */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
