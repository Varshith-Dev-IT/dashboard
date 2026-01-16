import React, { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateBounds, calculateCenter } from '../utils/geojsonUtils'
import { downloadEvidencePackage, downloadLegalEvidence, downloadAlertData } from '../utils/downloadUtils'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../utils/translations'
import Modal from '../components/Modal'
import ToastContainer from '../components/ToastContainer'
import './Dashboard.css'

// Component to fit bounds when GeoJSON loads
function FitBounds({ bounds }) {
  const map = useMap()
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])
  
  return null
}

const RangeOfficerDashboard = () => {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)
  
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [boundaryData, setBoundaryData] = useState(null)
  const [mapBounds, setMapBounds] = useState(null)
  const [mapCenter, setMapCenter] = useState([15.90, 78.85])
  const [mapZoom, setMapZoom] = useState(12)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [currentEvidence, setCurrentEvidence] = useState(null)
  const [toasts, setToasts] = useState([])
  const [sharingState, setSharingState] = useState({
    revenue: false,
    lawEnforcement: false
  })

  // Load GeoJSON boundary
  useEffect(() => {
    // Use import.meta.env.BASE_URL for proper base path support
    const baseUrl = import.meta.env.BASE_URL || '/'
    const geojsonPath = `${baseUrl}boundary_nallamalla_geojson.geojson`.replace(/\/\//g, '/')
    fetch(geojsonPath)
      .then(response => response.json())
      .then(data => {
        setBoundaryData(data)
        const bounds = calculateBounds(data)
        if (bounds) {
          setMapBounds(bounds)
          setMapCenter(calculateCenter(bounds))
          setMapZoom(9)
        }
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error)
      })
  }, [])

  const [fieldAlerts, setFieldAlerts] = useState([
    {
      id: 1,
      priority: 'High',
      type: 'Agriculture',
      location: 'Atmakur Range, Nallamalla',
      coordinates: [15.78, 78.95],
      area: '15.2 ha',
      detectedDate: '2024-06-15',
      status: 'Pending Verification',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-15', url: 'evidence1.jpg', coordinates: [15.78, 78.95] }
      ],
      assignedTo: 'Range Officer',
      description: 'Unauthorized agricultural expansion detected near forest boundary'
    },
    {
      id: 2,
      priority: 'Critical',
      type: 'Agriculture',
      location: 'Udayagiri Reserve Forest',
      coordinates: [15.85, 79.15],
      area: '8.5 ha',
      detectedDate: '2024-06-14',
      status: 'Action Required',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-14', url: 'evidence3.jpg', coordinates: [15.85, 79.15] }
      ],
      assignedTo: 'Range Officer',
      description: 'Unauthorized agricultural expansion detected near forest boundary'
    },
    {
      id: 3,
      priority: 'Medium',
      type: 'Logging',
      location: 'Gundla Brahmeswaram Wildlife Sanctuary',
      coordinates: [15.92, 79.05],
      area: '22.1 ha',
      detectedDate: '2024-06-13',
      status: 'In Progress',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-13', url: 'evidence5.jpg', coordinates: [15.92, 79.05] }
      ],
      assignedTo: 'Range Officer',
      description: 'Selective logging detected in protected forest area'
    },
    {
      id: 5,
      priority: 'Medium',
      type: 'Agriculture',
      location: 'Ahobilam Reserve Forest',
      coordinates: [15.75, 78.85],
      area: '12.3 ha',
      detectedDate: '2024-06-11',
      status: 'Verified',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-11', url: 'evidence8.jpg', coordinates: [15.75, 78.85] }
      ],
      assignedTo: 'Range Officer',
      description: 'Crop expansion into forest buffer zone'
    },
  ])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleViewEvidence = (alert, evidenceIndex = null) => {
    if (evidenceIndex !== null) {
      setCurrentEvidence(alert.evidence[evidenceIndex])
      setSelectedAlert(alert)
    } else {
      setCurrentEvidence(alert.evidence[0])
      setSelectedAlert(alert)
    }
    setShowEvidenceModal(true)
  }

  const handleVerifyLocation = (alert) => {
    setFieldAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, status: 'Verified', verifiedDate: new Date().toISOString().split('T')[0] }
        : a
    ))
    addToast(`${t('location')} ${alert.location} ${t('locationVerified')}`, 'success')
    setSelectedAlert(prev => prev ? { ...prev, status: 'Verified' } : null)
  }

  const handleUpdateStatus = (alert) => {
    setSelectedAlert(alert)
    setShowStatusModal(true)
  }

  const handleStatusUpdate = (alertId, newStatus, notes) => {
    setFieldAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: newStatus, notes: notes || a.notes }
        : a
    ))
    addToast(`${t('statusUpdated')}: ${newStatus}`, 'success')
    setShowStatusModal(false)
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const handleDownloadEvidence = (alert, evidence) => {
    if (evidence) {
      // Download specific evidence for legal proceedings
      downloadLegalEvidence(alert, evidence)
      addToast(`${t('legalPackageReady')}: ${evidence.type}`, 'success')
    } else {
      // Download full evidence package
      downloadEvidencePackage(alert)
      addToast(`${t('evidenceDownloaded')} ${alert.location}`, 'success')
    }
  }

  const handleUpdateSharing = (alertId, sharingData) => {
    setSharingState(sharingData)
    addToast(t('sharingUpdated'), 'success')
    setShowSharingModal(false)
  }

  const taskStats = [
    { name: 'Pending', value: 15 },
    { name: 'In Progress', value: 8 },
    { name: 'Verified', value: 32 },
    { name: 'Resolved', value: 45 },
  ]

  const priorityDistribution = [
    { priority: 'Critical', count: 3 },
    { priority: 'High', count: 8 },
    { priority: 'Medium', count: 12 },
    { priority: 'Low', count: 5 },
  ]

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return '#DC2626'
      case 'High': return '#F59E0B'
      case 'Medium': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Action Required': return '#DC2626'
      case 'Pending Verification': return '#F59E0B'
      case 'In Progress': return '#3B82F6'
      case 'Verified': return '#10B981'
      default: return '#6B7280'
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('rangeOfficerTitle')}</h1>
        <p>{t('rangeOfficerSubtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#F59E0B' }}>📋</div>
          <div className="kpi-content">
            <h3>15</h3>
            <p>{t('pendingTasks')}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#3B82F6' }}>🔄</div>
          <div className="kpi-content">
            <h3>8</h3>
            <p>{t('inProgress')}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#DC2626' }}>🚨</div>
          <div className="kpi-content">
            <h3>3</h3>
            <p>{t('criticalAlerts')}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#10B981' }}>✅</div>
          <div className="kpi-content">
            <h3>32</h3>
            <p>{t('verifiedThisMonth')}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>{t('taskStatusDistribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('alertPriorityDistribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Content: Map and Alerts */}
      <div className="map-alerts-row">
        <div className="map-card">
          <h3>{t('fieldAlertLocations')}</h3>
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '500px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {boundaryData && (
                <>
                  <GeoJSON 
                    data={boundaryData} 
                    style={{
                      color: '#059669',
                      weight: 3,
                      fillColor: '#10B981',
                      fillOpacity: 0.1
                    }}
                  />
                  {mapBounds && <FitBounds bounds={mapBounds} />}
                </>
              )}
              {fieldAlerts.map((alert) => (
                <Marker
                  key={alert.id}
                  position={alert.coordinates}
                  eventHandlers={{
                    click: () => setSelectedAlert(alert)
                  }}
                >
                  <Popup>
                    <strong>{alert.location}</strong><br />
                    Type: {alert.type}<br />
                    Priority: {alert.priority}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="alerts-list-card">
          <h3>{t('fieldAlertsActionItems')}</h3>
          <div className="alerts-list">
            {fieldAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item detailed ${selectedAlert?.id === alert.id ? 'selected' : ''}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="alert-header">
                  <div>
                    <span className="alert-type">{alert.type}</span>
                    <span 
                      className="alert-priority"
                      style={{ background: getPriorityColor(alert.priority) }}
                    >
                      {t(alert.priority.toLowerCase())}
                    </span>
                  </div>
                  <span 
                    className="alert-status"
                    style={{ background: getStatusColor(alert.status) }}
                  >
                    {t(alert.status.toLowerCase().replace(/\s+/g, '')) || alert.status}
                  </span>
                </div>
                <div className="alert-body">
                  <p><strong>{t('location')}:</strong> {alert.location}</p>
                  <p><strong>{t('area')}:</strong> {alert.area}</p>
                  <p><strong>{t('detected')}:</strong> {alert.detectedDate}</p>
                  <p className="alert-description">{alert.description}</p>
                  <div className="evidence-section">
                    <strong>{t('evidence')}:</strong>
                    <div className="evidence-list">
                      {alert.evidence.map((ev, idx) => (
                        <div key={idx} className="evidence-item">
                          <span>{ev.type}</span>
                          <span>{ev.date}</span>
                          <button 
                            className="view-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewEvidence(alert, idx)
                            }}
                            title={`View ${ev.type} Satellite Imagery`}
                          >
                            {ev.type === 'Sentinel-2' ? 'View Sentinel-2' : t('view')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="alert-actions">
                  <button 
                    className="action-btn primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVerifyLocation(alert)
                    }}
                  >
                    Verify Location
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateStatus(alert)
                    }}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Alert Detail */}
      {selectedAlert && (
        <div className="detail-panel">
          <div className="detail-header">
            <h3>Alert Details: {selectedAlert.location}</h3>
            <button onClick={() => setSelectedAlert(null)}>×</button>
          </div>
          <div className="detail-content">
            <div className="detail-section">
              <h4>{t('classificationDetails')}</h4>
              <div className="detail-grid">
                <div><strong>{t('type')}:</strong> {selectedAlert.type}</div>
                <div><strong>{t('priority')}:</strong> {t(selectedAlert.priority.toLowerCase())}</div>
                <div><strong>{t('areaAffected')}:</strong> {selectedAlert.area}</div>
                <div><strong>{t('status')}:</strong> {selectedAlert.status}</div>
                <div><strong>{t('detectedDate')}:</strong> {selectedAlert.detectedDate}</div>
                <div><strong>{t('assignedTo')}:</strong> {selectedAlert.assignedTo}</div>
                <div><strong>{t('location')}:</strong> {selectedAlert.coordinates[0].toFixed(4)}, {selectedAlert.coordinates[1].toFixed(4)}</div>
                <div><strong>{t('geoTagged')}:</strong> <span className="status-badge verified">{t('verified')}</span></div>
              </div>
            </div>
            <div className="detail-section">
              <h4>{t('visualEvidence')} ({t('geoTagged')})</h4>
              <div className="evidence-gallery">
                {selectedAlert.evidence.map((ev, idx) => (
                  <div key={idx} className="evidence-card">
                    <div className="evidence-placeholder">
                      📸 {ev.type} Image
                      <div className="geo-tag-badge">📍 Geo-Tagged</div>
                    </div>
                    <div className="evidence-info">
                      <p><strong>{ev.type}</strong></p>
                      <p>{ev.date}</p>
                      <p className="evidence-coords">📍 {selectedAlert.coordinates[0].toFixed(6)}, {selectedAlert.coordinates[1].toFixed(6)}</p>
                      <button 
                        className="view-full-btn"
                        onClick={() => {
                          setShowEvidenceModal(false)
                          setTimeout(() => {
                            handleViewEvidence(selectedAlert, idx)
                          }, 300)
                        }}
                        title={`View ${ev.type} Satellite Map`}
                      >
                        {ev.type === 'Sentinel-2' ? 'View Sentinel-2 Map' : t('viewFullImage')}
                      </button>
                      <button 
                        className="download-evidence-btn"
                        onClick={() => handleDownloadEvidence(selectedAlert, ev)}
                      >
                        {t('downloadForLegal')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="evidence-note">All evidence is geo-tagged and suitable for legal/administrative proceedings</p>
            </div>
            <div className="detail-section">
              <h4>{t('description')}</h4>
              <p>{selectedAlert.description}</p>
            </div>
            <div className="detail-section">
              <h4>{t('interAgencySharing')}</h4>
              <div className="agency-sharing">
                <label className="agency-checkbox">
                  <input 
                    type="checkbox" 
                    checked={sharingState.revenue}
                    onChange={(e) => setSharingState(prev => ({ ...prev, revenue: e.target.checked }))}
                  />
                  <span>{t('shareWithRevenue')}</span>
                </label>
                <label className="agency-checkbox">
                  <input 
                    type="checkbox" 
                    checked={sharingState.lawEnforcement}
                    onChange={(e) => setSharingState(prev => ({ ...prev, lawEnforcement: e.target.checked }))}
                  />
                  <span>{t('shareWithLawEnforcement')}</span>
                </label>
                <button 
                  className="share-btn"
                  onClick={() => handleUpdateSharing(selectedAlert.id, sharingState)}
                >
                  {t('updateSharingStatus')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Staff Impact Section */}
      <div className="outcomes-section">
        <h2 className="section-title">Field Staff Impact & Outcomes</h2>
        <div className="outcomes-grid">
          <div className="outcome-card">
            <div className="outcome-icon">⚡</div>
            <h3>Reduced Manual Effort</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Manual Patrolling Reduced</span>
                <span className="metric-value">72%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Time Saved Per Week</span>
                <span className="metric-value">15 hours</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">AI-Guided Patrols</span>
                <span className="metric-value">85%</span>
              </div>
            </div>
            <p className="outcome-description">Automated AI detection eliminates need for random patrolling, enabling targeted, efficient field work</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">🛡️</div>
            <h3>Safer, Targeted Patrols</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Risk Reduction</span>
                <span className="metric-value">65%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Pre-Mission Intelligence</span>
                <span className="metric-value">100%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Accident Reduction</span>
                <span className="metric-value">58%</span>
              </div>
            </div>
            <p className="outcome-description">Geo-tagged alerts with visual evidence allow field staff to plan safer, evidence-based patrols</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">📋</div>
            <h3>Evidence for Legal Action</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Geo-Tagged Evidence</span>
                <span className="metric-value">100%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Legal Case Support</span>
                <span className="metric-value">156 cases</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Evidence Acceptance</span>
                <span className="metric-value">92%</span>
              </div>
            </div>
            <p className="outcome-description">All evidence is geo-tagged with satellite imagery, providing defensible digital records for legal proceedings</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">🤝</div>
            <h3>Inter-Agency Coordination</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Shared with Revenue</span>
                <span className="metric-value">89%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Shared with Law Enforcement</span>
                <span className="metric-value">76%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Joint Actions</span>
                <span className="metric-value">42</span>
              </div>
            </div>
            <p className="outcome-description">Improved coordination with Revenue and Law Enforcement agencies through shared alerts and evidence</p>
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => {
          setShowEvidenceModal(false)
          setCurrentEvidence(null)
        }}
        title={`${t('evidenceInformation')} - ${currentEvidence?.type || 'Satellite Imagery'}`}
        size="large"
      >
        {currentEvidence && selectedAlert && (
          <div className="evidence-modal-content">
            <div className="evidence-image-container" style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer
                center={selectedAlert.coordinates || (currentEvidence?.coordinates ? currentEvidence.coordinates : [15.90, 78.85])}
                zoom={15}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom={true}
              >
                {/* Satellite Imagery Tile Layer */}
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
                {/* Marker for alert location */}
                <Marker
                  position={selectedAlert.coordinates || (currentEvidence?.coordinates ? currentEvidence.coordinates : [15.90, 78.85])}
                  icon={L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div>
                      <strong>{selectedAlert.location}</strong><br />
                      {t('type')}: {selectedAlert.type}<br />
                      {t('priority')}: {t(selectedAlert.priority.toLowerCase())}<br />
                      {t('source')}: {currentEvidence.type}<br />
                      {t('captureDate')}: {currentEvidence.date}<br />
                      {t('geoTagged')}: {selectedAlert.coordinates?.[0]?.toFixed(6)}, {selectedAlert.coordinates?.[1]?.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="evidence-details">
              <div className="evidence-detail-item">
                <strong>{t('evidenceInformation')}</strong>
                <span>{t('source')}: {currentEvidence.type}</span>
                <span>{t('captureDate')}: {currentEvidence.date}</span>
                <span>{t('location')}: {selectedAlert.location}</span>
                <span>{t('alertInformation')} {t('type')}: {selectedAlert.type}</span>
                <span>{t('priority')}: {t(selectedAlert.priority.toLowerCase())}</span>
                <span>{t('areaAffected')}: {selectedAlert.area}</span>
              </div>
              <div className="evidence-detail-item">
                <strong>{t('geoTagged')} {t('evidenceInformation')}</strong>
                <span>{t('location')}: {selectedAlert.coordinates[0].toFixed(6)}, {selectedAlert.coordinates[1].toFixed(6)}</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>✓ {t('geoTagged')} {t('verified')}</span>
              </div>
              <div className="evidence-detail-item">
                <strong>{t('description')}</strong>
                <span>{selectedAlert.description}</span>
              </div>
              <div className="form-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => handleDownloadEvidence(selectedAlert, currentEvidence)}
                >
                  {t('downloadEvidencePackage')}
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    if (currentEvidence) {
                      downloadLegalEvidence(selectedAlert, currentEvidence)
                      addToast(t('legalPackageReady'), 'success')
                    } else {
                      downloadEvidencePackage(selectedAlert)
                      addToast(t('legalPackageReady'), 'success')
                    }
                  }}
                >
                  {t('downloadForLegal')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false)
        }}
        title={`${t('updateStatusFor')} ${selectedAlert?.location || t('activeAlerts')}`}
        size="medium"
      >
        {selectedAlert && (
          <div className="status-update-form">
            <div className="form-group">
              <label>{t('currentStatus')}</label>
              <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: getStatusColor(selectedAlert.status) }}>
                  {selectedAlert.status}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>{t('newStatus')}</label>
              <select
                id="statusSelect"
                defaultValue={selectedAlert.status}
              >
                <option value="Pending Verification">{t('pendingVerification')}</option>
                <option value="In Progress">{t('inProgress')}</option>
                <option value="Verified">{t('verified')}</option>
                <option value="Action Required">{t('actionRequired')}</option>
                <option value="Resolved">{t('resolved')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('notes')}</label>
              <textarea
                id="statusNotes"
                placeholder={t('notes')}
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button 
                className="action-btn secondary"
                onClick={() => setShowStatusModal(false)}
              >
                {t('cancel')}
              </button>
              <button 
                className="action-btn primary"
                onClick={() => {
                  const select = document.getElementById('statusSelect')
                  const notes = document.getElementById('statusNotes')
                  handleStatusUpdate(selectedAlert.id, select.value, notes.value)
                }}
              >
                {t('updateStatus')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}

export default RangeOfficerDashboard
