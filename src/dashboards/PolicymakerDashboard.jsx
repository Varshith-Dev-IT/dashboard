import React, { useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../utils/translations'
import './Dashboard.css'

const PolicymakerDashboard = () => {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)
  
  // Trend data over years
  const trendData = [
    { year: '2020', forest: 9200, encroachment: 1800 },
    { year: '2021', forest: 8900, encroachment: 2200 },
    { year: '2022', forest: 8600, encroachment: 2600 },
    { year: '2023', forest: 8300, encroachment: 3000 },
    { year: '2024', forest: 8000, encroachment: 3200 },
  ]

  // Regional comparison
  const regionalData = [
    { region: 'North', forest: 8500, encroachment: 1200, alerts: 45 },
    { region: 'South', forest: 7800, encroachment: 1800, alerts: 62 },
    { region: 'East', forest: 9200, encroachment: 900, alerts: 38 },
    { region: 'West', forest: 7500, encroachment: 2100, alerts: 75 },
    { region: 'Central', forest: 8800, encroachment: 1500, alerts: 52 },
  ]

  // Encroachment by type (policy impact)
  const encroachmentByType = [
    { type: 'Agriculture', area: 2050, policyImpact: 'Medium', trend: '+12%' },
    { type: 'Construction', area: 540, policyImpact: 'High', trend: '+8%' },
    { type: 'Logging', area: 730, policyImpact: 'Low', trend: '-5%' },
    { type: 'Mining', area: 300, policyImpact: 'Critical', trend: '+15%' },
  ]

  // Policy metrics
  const policyMetrics = [
    { metric: 'Protected Area Coverage', value: '68%', trend: '+3%', status: 'Positive' },
    { metric: 'Alert Response Time', value: '2.4 days', trend: '-0.5 days', status: 'Positive' },
    { metric: 'Verification Rate', value: '78%', trend: '+5%', status: 'Positive' },
    { metric: 'Recovery Rate', value: '45%', trend: '+8%', status: 'Positive' },
  ]

  // Monthly alerts
  const monthlyAlerts = [
    { month: 'Jan', alerts: 42, resolved: 35 },
    { month: 'Feb', alerts: 48, resolved: 38 },
    { month: 'Mar', alerts: 52, resolved: 42 },
    { month: 'Apr', alerts: 45, resolved: 38 },
    { month: 'May', alerts: 58, resolved: 48 },
    { month: 'Jun', alerts: 62, resolved: 52 },
  ]

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#5C6BC0']

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('policymakerTitle')}</h1>
        <p>{t('policymakerSubtitle')}</p>
      </div>

      {/* Executive KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card executive">
          <div className="kpi-icon" style={{ background: '#10B981' }}>🌲</div>
          <div className="kpi-content">
            <h3>5,786 ha</h3>
            <p>{t('totalForestCoverage')}</p>
            <span className="kpi-trend negative">-2.5% vs last year</span>
          </div>
        </div>
        <div className="kpi-card executive">
          <div className="kpi-icon" style={{ background: '#EF4444' }}>⚠️</div>
          <div className="kpi-content">
            <h3>3,200 ha</h3>
            <p>{t('totalEncroachmentLabel')}</p>
            <span className="kpi-trend negative">-1.2% vs last year</span>
          </div>
        </div>
        <div className="kpi-card executive">
          <div className="kpi-icon" style={{ background: '#3B82F6' }}>📊</div>
          <div className="kpi-content">
            <h3>272</h3>
            <p>{t('totalAlerts')}</p>
            <span className="kpi-trend neutral">+12 from last year</span>
          </div>
        </div>
        <div className="kpi-card executive">
          <div className="kpi-icon" style={{ background: '#8B5CF6' }}>✅</div>
          <div className="kpi-content">
            <h3>84%</h3>
            <p>{t('resolutionRate')}</p>
            <span className="kpi-trend positive">+6% vs last year</span>
          </div>
        </div>
      </div>

      {/* Policy Impact Metrics */}
      <div className="policy-metrics-grid">
        <h2 className="section-title">{t('policyImpactMetrics')}</h2>
        {policyMetrics.map((metric, idx) => (
          <div key={idx} className="policy-metric-card">
            <h4>{metric.metric}</h4>
            <div className="metric-value-row">
              <span className="metric-value">{metric.value}</span>
              <span className={`metric-trend ${metric.status.toLowerCase()}`}>
                {metric.trend}
              </span>
            </div>
            <div className="metric-bar">
              <div 
                className={`metric-bar-fill ${metric.status.toLowerCase()}`}
                style={{ width: metric.value.replace(/[^0-9]/g, '') + '%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Analysis */}
      <div className="charts-row">
        <div className="chart-card large">
          <h3>{t('yearTrends')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="forest" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="encroachment" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Comparison & Monthly Trends */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>{t('regionalComparison')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="forest" fill="#10B981" name="Forest Area (ha)" />
              <Bar dataKey="encroachment" fill="#EF4444" name="Encroachment (ha)" />
              <Bar dataKey="alerts" fill="#F59E0B" name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('monthlyAlertTrends')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyAlerts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={3} name="Alerts Detected" />
              <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Encroachment Analysis */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>{t('encroachmentDistribution')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={encroachmentByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="area"
              >
                {encroachmentByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="table-card">
          <h3>{t('policyImpactAssessment')}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Area (ha)</th>
                <th>Policy Impact</th>
                <th>Trend</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {encroachmentByType.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.area.toLocaleString()} ha</td>
                  <td>
                    <span className={`impact-badge ${item.policyImpact.toLowerCase()}`}>
                      {item.policyImpact}
                    </span>
                  </td>
                  <td>
                    <span className={item.trend.startsWith('+') ? 'trend-up' : 'trend-down'}>
                      {item.trend}
                    </span>
                  </td>
                  <td>
                    {item.policyImpact === 'Critical' && 'Immediate intervention required'}
                    {item.policyImpact === 'High' && 'Strengthen monitoring & penalties'}
                    {item.policyImpact === 'Medium' && 'Continue current policies'}
                    {item.policyImpact === 'Low' && 'Maintain vigilance'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="insights-card">
        <h3>{t('keyInsights')}</h3>
        <div className="insights-grid">
          <div className="insight-item positive">
            <h4>{t('positiveTrends')}</h4>
            <ul>
              <li>Logging activities decreased by 5% due to enhanced monitoring</li>
              <li>Alert response time improved by 0.5 days</li>
              <li>Verification rate increased to 78%</li>
              <li>Forest recovery initiatives show 45% success rate</li>
            </ul>
          </div>
          <div className="insight-item warning">
            <h4>{t('areasOfConcern')}</h4>
            <ul>
              <li>Mining encroachment increased by 15% - requires urgent policy review</li>
              <li>Agricultural expansion continues to rise (12% increase)</li>
              <li>Western region shows highest alert density</li>
              <li>Construction activities need stricter regulation</li>
            </ul>
          </div>
          <div className="insight-item action">
            <h4>{t('recommendedActions')}</h4>
            <ul>
              <li>Implement stricter penalties for mining violations</li>
              <li>Expand agricultural buffer zone policies</li>
              <li>Deploy additional monitoring resources in Western region</li>
              <li>Establish faster response protocols for critical alerts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Outcomes Section */}
      {/* <div className="outcomes-section">
        <h2 className="section-title">System Outcomes & Impact Assessment</h2>
        <div className="outcomes-grid">
          <div className="outcome-card">
            <div className="outcome-icon">🤖</div>
            <h3>Automated AI-Based Monitoring</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">System Reliability</span>
                <span className="metric-value">98.5%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Detection Accuracy</span>
                <span className="metric-value">94.2%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Coverage Area</span>
                <span className="metric-value">8,000 ha</span>
              </div>
            </div>
            <p className="outcome-description">Automated and reliable AI-based encroachment monitoring system for forest lands using Sentinel satellite imagery</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">⚡</div>
            <h3>Faster Detection</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Detection Time</span>
                <span className="metric-value">2.4 days</span>
                <span className="metric-trend positive">↓ 65% faster</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Manual Effort Reduction</span>
                <span className="metric-value">72%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Early Warning Rate</span>
                <span className="metric-value">84%</span>
              </div>
            </div>
            <p className="outcome-description">Faster detection and reduced manual effort enables proactive intervention before large-scale damage</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">📍</div>
            <h3>Evidence-Based Enforcement</h3>
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
                <span className="metric-label">Evidence Acceptance</span>
                <span className="metric-value">92%</span>
              </div>
            </div>
            <p className="outcome-description">Geo-tagged, evidence-backed insights with defensible digital records for legal and administrative action</p>
          </div>

          <div className="outcome-card">
            <div className="outcome-icon">🤝</div>
            <h3>Inter-Agency Coordination</h3>
            <div className="outcome-metrics">
              <div className="metric-item">
                <span className="metric-label">Agencies Integrated</span>
                <span className="metric-value">3</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Shared Alerts</span>
                <span className="metric-value">89%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Joint Actions</span>
                <span className="metric-value">42</span>
              </div>
            </div>
            <p className="outcome-description">Improved coordination between Forest, Revenue, and Law Enforcement agencies through unified platform</p>
          </div>
        </div>
      </div> */}

      {/* Expected Impact Section */}
      <div className="impact-section">
        <h2 className="section-title">Expected Impact Analysis</h2>
        <div className="impact-grid">
          <div className="impact-card field-staff">
            <h3>🌲 Forest Field Staff Impact</h3>
            <div className="impact-metrics-grid">
              <div className="impact-metric">
                <div className="impact-value">72%</div>
                <div className="impact-label">Reduced Manual Monitoring</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">65%</div>
                <div className="impact-label">Risk Reduction</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">15 hrs</div>
                <div className="impact-label">Time Saved Per Week</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">85%</div>
                <div className="impact-label">Targeted Patrols</div>
              </div>
            </div>
            <ul className="impact-list">
              <li>Reduced manual monitoring efforts through AI automation</li>
              <li>Safer, targeted patrols with pre-mission intelligence</li>
              <li>100% geo-tagged evidence for field verification</li>
              <li>Real-time alerts with priority classification</li>
            </ul>
          </div>

          <div className="impact-card system-impact">
            <h3>⚙️ System Impact</h3>
            <div className="impact-metrics-grid">
              <div className="impact-metric">
                <div className="impact-value">92%</div>
                <div className="impact-label">Evidence Acceptance Rate</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">89%</div>
                <div className="impact-label">Inter-Agency Sharing</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">156</div>
                <div className="impact-label">Legal Cases Supported</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">45%</div>
                <div className="impact-label">Faster Resolution</div>
              </div>
            </div>
            <ul className="impact-list">
              <li>Strengthened evidence-based enforcement with digital records</li>
              <li>Improved inter-agency coordination (Forest, Revenue, Law Enforcement)</li>
              <li>Defensible digital records for legal proceedings</li>
              <li>100% geo-tagged visual evidence with satellite imagery</li>
            </ul>
          </div>

          <div className="impact-card environmental">
            <h3>🌱 Environmental Impact</h3>
            <div className="impact-metrics-grid">
              <div className="impact-metric">
                <div className="impact-value">38%</div>
                <div className="impact-label">Degradation Reduction</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">65%</div>
                <div className="impact-label">Faster Detection</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">45%</div>
                <div className="impact-label">Recovery Rate</div>
              </div>
              <div className="impact-metric">
                <div className="impact-value">84%</div>
                <div className="impact-label">Prevention Rate</div>
              </div>
            </div>
            <ul className="impact-list">
              <li>Enhanced protection of forest ecosystems through early detection</li>
              <li>Reduced encroachment-related degradation (38% reduction)</li>
              <li>Faster detection prevents large-scale environmental damage</li>
              <li>45% forest recovery rate from detected encroachments</li>
              <li>84% resolution rate before significant ecosystem impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PolicymakerDashboard
