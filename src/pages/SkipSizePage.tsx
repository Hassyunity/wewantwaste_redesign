// SkipSizePage.tsx
import { useEffect, useState } from 'react'
import '../assets/stylesheets/skipPage.css'
import '../assets/stylesheets/progressBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMapMarkerAlt,
  faRecycle,
  faTrash,
  faShieldAlt,
  faCalendarAlt,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons'

type Skip = {
  id: number
  size: number
  price_before_vat: number
  vat: number
  image_url?: string
  hire_period?: string
}

const stepIcons = [
  <FontAwesomeIcon icon={faMapMarkerAlt} />,
  <FontAwesomeIcon icon={faRecycle} />,
  <FontAwesomeIcon icon={faTrash} />,
  <FontAwesomeIcon icon={faShieldAlt} />,
  <FontAwesomeIcon icon={faCalendarAlt} />,
  <FontAwesomeIcon icon={faCreditCard} />,
]

const steps = [
  'Postcode',
  'Waste Type',
  'Select Skip',
  'Permit Check',
  'Choose Date',
  'Payment',
]

export default function SkipSizePage() {
  const [skips, setSkips] = useState<Skip[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'allowed' | 'not-allowed'>('all')
  const [currentStepIndex] = useState(2)

  useEffect(() => {
    fetch('https://app.wewantwaste.co.uk/api/skips/by-location?postcode=NR32&area=Lowestoft')
      .then(res => res.json())
      .then(data => setSkips(data))
  }, [])

  const filteredSkips = skips.filter(skip => {
    if (filter === 'allowed') return skip.size < 10
    if (filter === 'not-allowed') return skip.size >= 10
    return true
  })

  const selectedSkip = skips.find(s => s.id === selectedId)

  return (
    <div className="skip-container">
      <nav className="progress-bar">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`progress-step ${
              index === currentStepIndex
                ? 'active'
                : index < currentStepIndex
                ? 'completed'
                : ''
            }`}
          >
            <span className="step-icon">{stepIcons[index]}</span>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </nav>

      <div className="skip-header">
        <h1>Choose Your Skip Size</h1>
        <p>Select the skip size that best suits your needs</p>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {['all', 'allowed', 'not-allowed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              style={{
                marginRight: 8,
                backgroundColor: filter === f ? '#3b82f6' : '#2a2a2e',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {{
                all: 'All',
                allowed: 'Allowed on Road',
                'not-allowed': 'Not Allowed on Road'
              }[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="skip-grid">
        {filteredSkips.map(skip => {
          const totalPrice = skip.price_before_vat + skip.vat
          const isSelected = skip.id === selectedId

          return (
            <div key={skip.id} className={`skip-card ${isSelected ? 'selected' : ''}`}>
              <div className="skip-image-container">
                <img
                  src={skip.image_url ? `/images/${skip.image_url}` : '/images/placeholder-skip.jpg'}
                  alt={`${skip.size} Yard Skip`}
                  className="skip-image"
                />
                <div className="skip-badge skip-size">{skip.size} Yards</div>
                {skip.size >= 10 && (
                  <div className="skip-badge not-allowed">⚠️ Not Allowed On The Road</div>
                )}
              </div>

              <div className="skip-details">
                <h2>{skip.size} Yard Skip</h2>
                <p className="hire-period">{skip.hire_period || '7 day hire period'}</p>
                <p className="price">£{totalPrice.toFixed(2)}</p>
                <button
                  className={`skip-select-button ${isSelected ? 'disabled' : ''}`}
                  onClick={() => setSelectedId(skip.id)}
                  disabled={isSelected}
                >
                  {isSelected ? 'Selected' : 'Select This Skip →'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedSkip && (
        <div className="skip-summary">
          <div>
            {selectedSkip.size} Yard Skip{' '}
            <span className="summary-price">
              £{(selectedSkip.price_before_vat + selectedSkip.vat).toFixed(2)}
            </span>{' '}
            <span className="summary-period">7 day hire</span>
          </div>
          <div className="summary-buttons">
            <button className="back-btn" onClick={() => setSelectedId(null)}>Back</button>
            <button className="continue-btn">Continue →</button>
          </div>
        </div>
      )}
    </div>
  )
}
