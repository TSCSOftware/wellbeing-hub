import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireRole from './components/RequireRole.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Counsellors from './pages/Counsellors.jsx'
import CounsellorDetails from './pages/CounsellorDetails.jsx'
import Resources from './pages/Resources.jsx'
import ResourceDetails from './pages/ResourceDetails.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'

import Dashboard from './pages/dashboard/Dashboard.jsx'
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import Bookings from './pages/dashboard/Bookings.jsx'
import SelfCare from './pages/dashboard/SelfCare.jsx'
import Profile from './pages/dashboard/Profile.jsx'
import Settings from './pages/dashboard/Settings.jsx'
import ManageCounsellors from './pages/dashboard/ManageCounsellors.jsx'
import ManageBlogs from './pages/dashboard/ManageBlogs.jsx'
import AdminNotifications from './pages/dashboard/AdminNotifications.jsx'

/**
 * THE COMPLETE PICTURE - every routing idea from the React Router deck,
 * living together in one file:
 *
 *   /                        Home
 *   /about                   About
 *   /counsellors             Counsellors
 *   /counsellors/:id         DYNAMIC route  -> useParams
 *   /resources               Resources
 *   /resources/:id           DYNAMIC route  -> useParams
 *   /contact                 Contact
 *   /login                   Login          -> useNavigate
 *   /dashboard               PROTECTED, NESTED layout with <Outlet />
 *       index                DashboardHome  (index route)
 *       bookings             Bookings
 *       selfcare             SelfCare
 *       profile              Profile
 *       settings             Settings
 *   *                        NotFound       (wildcard, always LAST)
 */
export default function App() {
  const location = useLocation()

  /* Scroll to the top on every navigation. Dependency list is the pathname,
     so the effect runs on route change only - not on every re-render. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/counsellors" element={<Counsellors />} />
          {/* :counsellorId is a placeholder - ONE route matches every counsellor */}
          <Route path="/counsellors/:counsellorId" element={<CounsellorDetails />} />

          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:resourceId" element={<ResourceDetails />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Nested routes: Dashboard is the shared layout, the children
              render inside its <Outlet />. RequireAuth wraps the element,
              so an anonymous visitor is redirected to /login. */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="manage-counsellors" element={<RequireRole allow={['admin', 'counsellor']}><ManageCounsellors /></RequireRole>} />
            <Route path="notifications" element={<RequireRole allow={['admin']}><AdminNotifications /></RequireRole>} />
            <Route path="manage-blogs" element={<RequireRole allow={['admin', 'counsellor']}><ManageBlogs /></RequireRole>} />
            <Route path="selfcare" element={<RequireRole allow={['student']}><SelfCare /></RequireRole>} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Order matters: Routes stops at the first match, so the
              wildcard must always come last. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
