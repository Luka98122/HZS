import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Account from './pages/Account.tsx'
import Terms from './pages/Terms.tsx'
import Privacy from './pages/Privacy.tsx'
import Onboarding from './pages/Onboarding.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Workout from './pages/Workout.tsx'
import Study from './pages/Study.tsx'
import Focus from './pages/Focus.tsx'
import Stress from './pages/Stress.tsx'
import Hydration from './pages/Hydration.tsx'
import Home from './pages/Home.tsx'
import ScrollToTop from "./utils/ScrollToTop";
import SidebarMenu from './utils/SidebarMenu';
import RequireSession from './utils/RequireSession.tsx'
import LogOut from './pages/Logout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ScrollToTop />
      <SidebarMenu />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* 🔒 Protected routes */}
        <Route element={<RequireSession />}>
          <Route path="/account" element={<Account />} />
          <Route path="/home" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/study" element={<Study />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/stress" element={<Stress />} />
          <Route path="/hydration" element={<Hydration />} />
          <Route path="/logout" element={<LogOut />} />
          
        </Route>
      </Routes>

    </Router>
  </StrictMode>,
)