import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useLanguage } from './contexts/LanguageContext'
import { getTranslation } from './utils/translations'
import DFODashboard from './dashboards/DFODashboard'
import RangeOfficerDashboard from './dashboards/RangeOfficerDashboard'
import PolicymakerDashboard from './dashboards/PolicymakerDashboard'
import './App.css'

function App() {
  const location = useLocation()
  const { language, changeLanguage } = useLanguage()
  const t = (key) => getTranslation(key, language)

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">{t('navTitle')}</h1>
          <div className="nav-right">
            <div className="nav-links">
              <Link 
                to="/dfo" 
                className={location.pathname === '/dfo' ? 'active' : ''}
              >
                {t('dfoDashboard')}
              </Link>
              <Link 
                to="/range-officer" 
                className={location.pathname === '/range-officer' ? 'active' : ''}
              >
                {t('rangeOfficer')}
              </Link>
              <Link 
                to="/policymaker" 
                className={location.pathname === '/policymaker' ? 'active' : ''}
              >
                {t('policymaker')}
              </Link>
            </div>
            <div className="language-selector">
              <label className="language-label">{t('selectLanguage')}:</label>
              <select 
                className="language-dropdown"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">{t('english')}</option>
                <option value="te">{t('telugu')}</option>
                <option value="ta">{t('tamil')}</option>
                <option value="kn">{t('kannada')}</option>
                <option value="hi">{t('hindi')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="nav-logo">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="logo-image" />
          <p className="logo-text">Powered by Geo-Intel Lab, IITTNIF, Tirupati</p>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DFODashboard />} />
          <Route path="/dfo" element={<DFODashboard />} />
          <Route path="/range-officer" element={<RangeOfficerDashboard />} />
          <Route path="/policymaker" element={<PolicymakerDashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
