import React, { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Popup, GeoJSON, useMap, Marker } from 'react-leaflet'
import L from 'leaflet'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateBounds, calculateCenter } from '../utils/geojsonUtils'
import { downloadEvidencePackage } from '../utils/downloadUtils'
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

const DFODashboard = () => {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)
  
  const [boundaryData, setBoundaryData] = useState(null)
  const [mapBounds, setMapBounds] = useState(null)
  const [mapCenter, setMapCenter] = useState([15.90, 78.85])
  const [mapZoom, setMapZoom] = useState(10)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [toasts, setToasts] = useState([])

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

  // Mock data for land-use changes
  const landUseData = [
    { name: 'Jan', Forest: 8500, Agriculture: 1200, Construction: 300, Logging: 450, Mining: 150 },
    { name: 'Feb', Forest: 8200, Agriculture: 1450, Construction: 320, Logging: 520, Mining: 180 },
    { name: 'Mar', Forest: 8100, Agriculture: 1600, Construction: 380, Logging: 580, Mining: 210 },
    { name: 'Apr', Forest: 7950, Agriculture: 1750, Construction: 420, Logging: 620, Mining: 240 },
    { name: 'May', Forest: 7800, Agriculture: 1900, Construction: 480, Logging: 680, Mining: 270 },
    { name: 'Jun', Forest: 7650, Agriculture: 2050, Construction: 540, Logging: 730, Mining: 300 },
  ]

  const encroachmentTypes = useMemo(() => [
    { name: t('agriculture'), value: 2050, color: '#FFA726' },
    { name: t('construction'), value: 540, color: '#EF5350' },
    { name: t('logging'), value: 730, color: '#AB47BC' },
    { name: t('mining'), value: 300, color: '#5C6BC0' },
  ], [language])

  const [alertsData, setAlertsData] = useState([
    { 
      id: 1, 
      type: 'Agriculture', 
      location: 'Atmakur Range, Nallamalla', 
      severity: 'High', 
      area: '15.2 ha', 
      date: '2024-06-15',
      coordinates: [15.78, 78.95],
      detectedDate: '2024-06-15',
      status: 'Pending Verification',
      priority: 'High',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-15', coordinates: [15.78, 78.95] }
      ],
      description: 'Unauthorized agricultural expansion detected near forest boundary'
    },
    { 
      id: 2, 
      type: 'Agriculture', 
      location: 'Udayagiri Reserve Forest', 
      severity: 'Critical', 
      area: '8.5 ha', 
      date: '2024-06-14',
      coordinates: [15.85, 79.15],
      detectedDate: '2024-06-14',
      status: 'Action Required',
      priority: 'Critical',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-14', coordinates: [15.85, 79.15] }
      ],
      description: 'Unauthorized agricultural expansion detected near forest boundary'
    },
    { 
      id: 3, 
      type: 'Logging', 
      location: 'Gundla Brahmeswaram Wildlife Sanctuary', 
      severity: 'Medium', 
      area: '22.1 ha', 
      date: '2024-06-13',
      coordinates: [15.92, 79.05],
      detectedDate: '2024-06-13',
      status: 'In Progress',
      priority: 'Medium',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-13', coordinates: [15.92, 79.05] }
      ],
      description: 'Selective logging detected in protected forest area'
    },
    { 
      id: 5, 
      type: 'Agriculture', 
      location: 'Ahobilam Reserve Forest', 
      severity: 'Medium', 
      area: '12.3 ha', 
      date: '2024-06-11',
      coordinates: [15.75, 78.85],
      detectedDate: '2024-06-11',
      status: 'Verified',
      priority: 'Medium',
      evidence: [
        { type: 'Sentinel-2', date: '2024-06-11', coordinates: [15.75, 78.85] }
      ],
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

  const handleViewEvidence = (alert) => {
    setSelectedAlert(alert)
    setShowEvidenceModal(true)
  }

  const mapMarkers = [
    { lat: 15.78, lng: 78.95, name: 'Atmakur Range', type: 'Agriculture' },
    { lat: 15.85, lng: 79.15, name: 'Udayagiri Reserve Forest', type: 'Agriculture' },
    { lat: 15.92, lng: 79.05, name: 'Gundla Brahmeswaram', type: 'Logging' },
  ]

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return '#DC2626'
      case 'High': return '#F59E0B'
      case 'Medium': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('dfoTitle')}</h1>
        <p>{t('dfoSubtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#10B981' }}>🌳</div>
          <div className="kpi-content">
            <h3>6,125 ha</h3>
            <p>{t('forestArea')}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EF4444' }}>⚠️</div>
          <div className="kpi-content">
            <h3>24</h3>
            <p>{t('activeAlerts')}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#F59E0B' }}>📊</div>
          <div className="kpi-content">
            <h3>1,620</h3>
            <p>{t('totalEncroachment')}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#3B82F6' }}>📅</div>
          <div className="kpi-content">
            <h3>5</h3>
            <p>{t('pendingVerifications')}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>{t('landUseChanges')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={landUseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Forest" stroke="#10B981" strokeWidth={2} name={t('forest')} />
              <Line type="monotone" dataKey="Agriculture" stroke="#FFA726" strokeWidth={2} name={t('agriculture')} />
              <Line type="monotone" dataKey="Construction" stroke="#EF5350" strokeWidth={2} name={t('construction')} />
              <Line type="monotone" dataKey="Logging" stroke="#AB47BC" strokeWidth={2} name={t('logging')} />
              <Line type="monotone" dataKey="Mining" stroke="#5C6BC0" strokeWidth={2} name={t('mining')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('encroachmentByType')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={encroachmentTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {encroachmentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map and Alerts Row */}
      <div className="map-alerts-row">
        <div className="map-card">
          <h3>{t('geographicVisualization')}</h3>
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '400px', width: '100%', borderRadius: '8px' }}
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
              {mapMarkers.map((marker, idx) => {
                // Map encroachment types to marker colors
                const getMarkerColor = (type) => {
                  switch(type) {
                    case t('agriculture'): return 'orange'
                    case t('construction'): return 'red'
                    case t('logging'): return 'violet'
                    case t('mining'): return 'blue'
                    default: return 'red'
                  }
                }
                
                // Also check English names as fallback
                const markerColor = marker.type === 'Agriculture' ? 'orange' :
                                   marker.type === 'Construction' ? 'red' :
                                   marker.type === 'Logging' ? 'violet' :
                                   marker.type === 'Mining' ? 'blue' :
                                   getMarkerColor(marker.type) || 'red'
                
                return (
                  <Marker
                    key={idx}
                    position={[marker.lat, marker.lng]}
                    icon={L.icon({
                      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${markerColor}.png`,
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    })}
                  >
                    <Popup>
                      <strong>{marker.name}</strong><br />
                      {t('type')}: {marker.type}
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        <div className="alerts-card">
          <h3>{t('recentAlerts')}</h3>
          <div className="alerts-list">
            {alertsData.map(alert => (
              <div key={alert.id} className="alert-item">
                <div className="alert-header">
                  <span className="alert-type">{alert.type}</span>
                  <span 
                    className="alert-severity"
                    style={{ background: getSeverityColor(alert.severity) }}
                  >
                    {t(alert.severity.toLowerCase())}
                  </span>
                </div>
                <div className="alert-body">
                  <p><strong>{t('location')}:</strong> {alert.location}</p>
                  <p><strong>{t('area')}:</strong> {alert.area}</p>
                  <p><strong>{t('date')}:</strong> {alert.date}</p>
                </div>
                <button 
                  className="view-evidence-btn"
                  onClick={() => handleViewEvidence(alert)}
                >
                  {t('viewEvidence')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Encroachment Summary Table */}
      <div className="table-card">
        <h3>{t('encroachmentSummary')}</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('zone')}</th>
              <th>{t('agriculture')}</th>
              <th>{t('construction')}</th>
              <th>{t('logging')}</th>
              <th>{t('mining')}</th>
              <th>{t('total')}</th>
              <th>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Atmakur Range</td>
              <td>850 ha</td>
              <td>180 ha</td>
              <td>220 ha</td>
              <td>100 ha</td>
              <td>1,350 ha</td>
              <td><span className="status-badge critical">{t('critical')}</span></td>
            </tr>
            <tr>
              <td>Udayagiri Reserve</td>
              <td>700 ha</td>
              <td>200 ha</td>
              <td>280 ha</td>
              <td>120 ha</td>
              <td>1,300 ha</td>
              <td><span className="status-badge high">{t('high')}</span></td>
            </tr>
            <tr>
              <td>Gundla Brahmeswaram</td>
              <td>500 ha</td>
              <td>160 ha</td>
              <td>230 ha</td>
              <td>80 ha</td>
              <td>970 ha</td>
              <td><span className="status-badge medium">{t('medium')}</span></td>
            </tr>
            <tr style={{ fontWeight: 'bold', background: '#f9fafb' }}>
              <td>{t('total')}</td>
              <td>2,050 ha</td>
              <td>540 ha</td>
              <td>730 ha</td>
              <td>300 ha</td>
              <td>3,620 ha</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* System Outcomes Section */}
      <div className="outcomes-section">
        <h2 className="section-title">{t('systemOutcomes')}</h2>
        <div className="outcomes-grid">
          <div className="outcome-card">
            <div className="outcome-icon">🤖</div>
            <h3>{t('automatedAIMonitoring')}</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Monitoring Coverage</span>
                <span className="metric-value">98.5%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">AI Detection Accuracy</span>
                <span className="metric-value">94.2%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Automation Rate</span>
                <span className="metric-value">87%</span>
              </div>
            </div>
            <p className="outcome-description">{t('automatedAIMonitoring')}: {t('automatedAIMonitoring')} {t('systemOutcomes')}</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">⚡</div>
            <h3>{t('fasterDetection')}</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Detection Time</span>
                <span className="metric-value">2.4 days</span>
                <span className="metric-trend positive">↓ 65% faster</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Manual Effort Reduced</span>
                <span className="metric-value">72%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Patrol Efficiency</span>
                <span className="metric-value">+85%</span>
              </div>
            </div>
            <p className="outcome-description">{t('fasterDetection')}</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">📍</div>
            <h3>{t('geoTaggedEvidence')}</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Geo-Tagged Evidence</span>
                <span className="metric-value">100%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Legal Cases Supported</span>
                <span className="metric-value">156</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Evidence Acceptance Rate</span>
                <span className="metric-value">92%</span>
              </div>
            </div>
            <p className="outcome-description">{t('geoTaggedEvidence')}</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">🤝</div>
            <h3>{t('interAgencyCoordination')}</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Agencies Connected</span>
                <span className="metric-value">3</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Shared Alerts</span>
                <span className="metric-value">89%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Response Time</span>
                <span className="metric-value">-45%</span>
              </div>
            </div>
            <p className="outcome-description">{t('interAgencyCoordination')}</p>
          </div>
        </div>
      </div>

      {/* Expected Impact Section */}
      <div className="impact-section">
        <h2 className="section-title">{t('expectedImpact')}</h2>
        <div className="impact-grid">
          <div className="impact-card field-staff">
            <h3>{t('fieldStaffImpact')}</h3>
            <ul className="impact-list">
              <li>
                <strong>Reduced Manual Monitoring:</strong> 72% reduction in manual patrolling efforts
              </li>
              <li>
                <strong>Safer, Targeted Patrols:</strong> AI-guided patrols reduce risk by 65%
              </li>
              <li>
                <strong>Time Savings:</strong> 15 hours/week saved per field officer
              </li>
              <li>
                <strong>Evidence Collection:</strong> 100% geo-tagged evidence for field verification
              </li>
              <li>
                <strong>Actionable Intelligence:</strong> Real-time alerts with priority classification
              </li>
            </ul>
          </div>

          <div className="impact-card system-impact">
            <h3>{t('systemImpact')}</h3>
            <ul className="impact-list">
              <li>
                <strong>Evidence-Based Enforcement:</strong> 92% evidence acceptance rate in legal proceedings
              </li>
              <li>
                <strong>Inter-Agency Coordination:</strong> 89% alert sharing with Revenue & Law Enforcement
              </li>
              <li>
                <strong>Digital Records:</strong> 100% defensible digital evidence trail
              </li>
              <li>
                <strong>Legal Proceedings:</strong> 156 cases supported with geo-tagged visual evidence
              </li>
              <li>
                <strong>Administrative Action:</strong> 45% faster case resolution with documented evidence
              </li>
            </ul>
          </div>

          <div className="impact-card environmental">
            <h3>{t('environmentalImpact')}</h3>
            <ul className="impact-list">
              <li>
                <strong>Ecosystem Protection:</strong> Enhanced protection of forest ecosystems
              </li>
              <li>
                <strong>Degradation Reduction:</strong> 38% reduction in encroachment-related degradation
              </li>
              <li>
                <strong>Early Detection:</strong> 65% faster detection prevents large-scale damage
              </li>
              <li>
                <strong>Recovery Rate:</strong> 45% forest recovery rate from detected encroachments
              </li>
              <li>
                <strong>Preventive Action:</strong> 84% resolution rate of alerts before escalation
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => {
          setShowEvidenceModal(false)
          setSelectedAlert(null)
        }}
        title={`${t('evidenceFor')} ${selectedAlert?.location || t('activeAlerts')}`}
        size="large"
      >
        {selectedAlert && (
          <div className="evidence-modal-content">
            <div className="evidence-image-container" style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer
                center={selectedAlert.coordinates || (selectedAlert.evidence && selectedAlert.evidence[0]?.coordinates ? selectedAlert.evidence[0].coordinates : [15.90, 78.85])}
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
                  position={selectedAlert.coordinates || (selectedAlert.evidence && selectedAlert.evidence[0]?.coordinates ? selectedAlert.evidence[0].coordinates : [15.90, 78.85])}
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
                      {t('priority')}: {t(selectedAlert.severity.toLowerCase())}<br />
                      {t('geoTagged')}: {selectedAlert.coordinates?.[0]?.toFixed(6)}, {selectedAlert.coordinates?.[1]?.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="evidence-details">
              <div className="evidence-detail-item">
                <strong>{t('alertInformation')}</strong>
                <span>{t('type')}: {selectedAlert.type}</span>
                <span>{t('location')}: {selectedAlert.location}</span>
                <span>{t('status')}: {selectedAlert.severity}</span>
                <span>{t('area')}: {selectedAlert.area}</span>
                <span>{t('date')}: {selectedAlert.date}</span>
              </div>
              <div className="evidence-detail-item">
                <strong>{t('description')}</strong>
                <span>{selectedAlert.description}</span>
              </div>
              <div className="evidence-detail-item">
                <strong>{t('evidenceSources')}</strong>
                {selectedAlert.evidence.map((ev, idx) => (
                  <div key={idx} style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                    <span><strong>{ev.type}</strong></span>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Date: {ev.date}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>{t('geoTagged')} {ev.coordinates?.join(', ')}</span>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    downloadEvidencePackage(selectedAlert)
                    addToast(t('evidenceDownloaded'), 'success')
                    setShowEvidenceModal(false)
                    setSelectedAlert(null)
                  }}
                >
                  {t('downloadEvidencePackage')}
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    addToast(t('evidenceShared'), 'success')
                  }}
                >
                  {t('shareWithFieldTeam')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}

export default DFODashboard
