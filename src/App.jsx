import { useEffect, useRef, useState } from 'react'
import './App.css'

const pathTemplates = {
  home: {
    d: 'M165,860 C280,820 840,900 840,980',
    dots: [
      { x: 240, y: 820 },
      { x: 430, y: 730 },
      { x: 720, y: 620 }
    ]
  },
  education: {
    d: 'M840,40 L840,900',
    dots: [
      { x: 840, y: 120 },
      { x: 840, y: 340 },
      { x: 840, y: 560 }
    ]
  },
  educate2trade: {
    d: 'M840,260 L840,920',
    dots: [
      { x: 840, y: 360 },
      { x: 840, y: 520 },
      { x: 840, y: 720 }
    ]
  },
  bhf: {
    d: 'M840,220 L840,920',
    dots: [
      { x: 840, y: 320 },
      { x: 840, y: 520 },
      { x: 840, y: 720 }
    ]
  },
  aston: {
    d: 'M840,240 L840,930',
    dots: [
      { x: 840, y: 340 },
      { x: 840, y: 540 },
      { x: 840, y: 760 }
    ]
  },
  ceva: {
    d: 'M840,250 L840,930',
    dots: [
      { x: 840, y: 340 },
      { x: 840, y: 520 },
      { x: 840, y: 740 }
    ]
  }
}

function JourneyPath({ pathId, onPathRef }) {
  const data = pathTemplates[pathId]
  if (!data) return null

  return (
    <div className="scene-path-overlay" aria-hidden="true">
      <svg className="scene-path-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path
          ref={(node) => {
            if (node) {
              const svg = node.ownerSVGElement || node.closest('svg')
              onPathRef(pathId, { path: node, svg })
            }
          }}
          className="scene-path-line"
          d={data.d}
        />
        <path className="scene-path-trace" d={data.d} />
        {data.dots.map((dot, index) => (
          <circle key={index} className="scene-path-dot" cx={dot.x} cy={dot.y} r="7" />
        ))}
      </svg>
    </div>
  )
}

function App() {
  const [isWalking, setIsWalking] = useState(false)
  const [avatarLeft, setAvatarLeft] = useState(8)
  const [avatarBottom, setAvatarBottom] = useState(22)
  const [avatarDirection, setAvatarDirection] = useState(1)
  const [showAvatar, setShowAvatar] = useState(true)
  const [activeModal, setActiveModal] = useState(null)
  const [avatarMotion, setAvatarMotion] = useState({ tiltY: 0, tiltZ: 0, depth: 0, bounceAmp: 5, speedFactor: 1 })
  const [isEnteringSection, setIsEnteringSection] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const scrollTimeout = useRef(null)
  const pathRefs = useRef({})
  const registerPathRef = (pathId, entry) => {
    pathRefs.current[pathId] = entry
  }
  const lastAvatarX = useRef(8)
  const lastAvatarDirection = useRef(1)
  const lastScrollY = useRef(0)
  const rafPending = useRef(false)
  const latestScrollY = useRef(0)
  const avatarVelocity = useRef(0)
  const lastFrameTime = useRef(0)
  const lastSectionId = useRef(null)
  const sectionEnterTimeout = useRef(null)
  const reducedMotionRef = useRef(false)
  const journeyPathOrder = ['home', 'education', 'educate2trade', 'bhf', 'aston', 'ceva']
  const allSectionIds = ['home', 'education', 'educate2trade', 'bhf', 'aston', 'ceva', 'skills', 'projects', 'hobbies', 'contact']
  const sectionActivity = {
    home: 'walking',
    education: 'studying',
    educate2trade: 'working',
    bhf: 'working',
    aston: 'working',
    ceva: 'logistics',
    skills: 'coding',
    projects: 'analysing',
    hobbies: 'stunt',
    contact: 'waving'
  }
  const activityPoseImage = {
    studying: 'studying',
    working: 'working',
    logistics: 'logistics',
    coding: 'coding',
    analysing: 'analysing',
    stunt: 'stunt',
    waving: 'waving'
  }

  const detectActiveSection = (currentY) => {
    const viewportCenter = currentY + window.innerHeight / 2
    let found = allSectionIds[0]
    for (let i = 0; i < allSectionIds.length; i += 1) {
      const el = document.getElementById(allSectionIds[i])
      if (!el) continue
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      if (viewportCenter >= top && viewportCenter < bottom) {
        found = allSectionIds[i]
        break
      }
    }
    return found
  }

  const getTotalJourneyLength = () => {
    return journeyPathOrder.reduce((total, id) => {
      const path = pathRefs.current[id]?.path
      return total + (path && typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0)
    }, 0)
  }

  const getAvatarPositionOnJourney = (progress) => {
    const clamped = Math.min(1, Math.max(0, progress))
    const totalLength = getTotalJourneyLength()
    if (totalLength <= 0) return { x: 8, bottom: 22 }

    let remaining = totalLength * clamped
    for (let i = 0; i < journeyPathOrder.length; i += 1) {
      const id = journeyPathOrder[i]
      const pathEntry = pathRefs.current[id]
      const path = pathEntry?.path
      const svg = pathEntry?.svg
      const length = path && typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0
      if (!path || !svg || length <= 0) continue

      if (remaining <= length || i === journeyPathOrder.length - 1) {
        const point = path.getPointAtLength(Math.max(0, Math.min(length, remaining)))
        const svgRect = svg.getBoundingClientRect()
        const yViewport = svgRect.top + (point.y / 1000) * svgRect.height
        const x = (point.x / 1000) * 100
        const bottom = Math.max(6, Math.min(70, 100 - (yViewport / window.innerHeight) * 100))

        return {
          x,
          bottom,
          id
        }
      }
      remaining -= length
    }

    return { x: 84, bottom: 10, id: journeyPathOrder[journeyPathOrder.length - 1] }
  }

  const modalConfig = {
    education: {
      title: 'Education',
      introduction: 'Two qualifications from my academic journey.',
      items: [
        {
          title: 'MSc International Business',
          institution: 'Nottingham Trent University',
          date: '2023 – 2024',
          modulesHeading: 'MODULES',
          modules: [
            'Distinctions in International Business Environment & Strategy, International HRM, Research Methods, and Global Supply Chain.',
            'Commendation in Cross-Culture Management.'
          ],
          details: [
            'Final Consultancy Project: "Funding Strategy Development for Citizen Digital Foundation".'
          ]
        },
        {
          title: 'BSc Business Administration',
          institution: 'Amity University, India',
          details: [
            'CGPA: 8/10'
          ]
        }
      ]
    },
    educate2trade: {
      title: 'Financial Analyst Intern',
      institution: 'Educate2Trade',
      location: 'London, UK',
      date: 'Jan 2025 – June 2025',
      details: [
        'Analysed financial and trading data, enhancing reporting accuracy and decision support by 25%.',
        'Prepared and maintained management reports, improving visibility of financial performance by 20%.',
        'Ensured data integrity and timely reporting at a fast-moving fintech startup.'
      ]
    },
    bhf: {
      title: 'Volunteer Retail Assistant',
      institution: 'British Heart Foundation',
      location: 'Nottingham, UK',
      date: 'March 2025 – June 2025',
      details: [
        'Supported retail operations and stock management, improving efficiency by 25% alongside full-time commitments.'
      ]
    },
    aston: {
      title: 'Business Analyst',
      institution: 'Aston Business Intelligence',
      location: 'London, UK',
      date: 'Sept 2025 – Dec 2025',
      details: [
        'Analysed healthcare data and translated findings into recommendations for senior stakeholders.',
        'Applied process modelling and gap analysis to deliver system recommendations, achieving 30% efficiency improvement.',
        'Designed wireframes and user interface mockups, accelerating stakeholder sign-off by 30%.',
        'Produced UML use case diagrams and acceptance criteria research, reducing rework by 25%.'
      ]
    },
    ceva: {
      title: 'Administrative Assistant (Inventory & Reporting)',
      institution: 'CEVA Logistics',
      location: 'Derby, UK',
      date: 'July 2025 – Present',
      details: [
        'Maintain inventory records and conduct audits across warehouse systems, improving data accuracy by 25% and reducing discrepancies by 10%.',
        'Prepare daily/weekly operational reports, enhancing management visibility into warehouse performance by 20%.'
      ]
    }
  }

  const highlightText = (text) => {
    const highlightPattern = /(25%|20%|30%|40%|10%|Distinction|Final Consultancy Project \(Distinction\)|CGPA: 8\/10)/
    return text.split(highlightPattern).map((part, index) => (
      highlightPattern.test(part)
        ? <span key={index} className="scene-modal-highlight">{part}</span>
        : part
    ))
  }

  useEffect(() => {
    const sectionIds = ['home', 'education', 'educate2trade', 'bhf', 'aston', 'ceva']
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const settleAvatarMotion = () => {
      avatarVelocity.current = 0
      setAvatarMotion({ tiltY: 0, tiltZ: 0, depth: 0, bounceAmp: 5, speedFactor: 1 })
    }

    const updateAvatar = () => {
      rafPending.current = false
      setIsWalking(true)
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
      scrollTimeout.current = window.setTimeout(() => {
        setIsWalking(false)
        settleAvatarMotion()
      }, 120)

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section) => section !== null)

      if (!sections.length) return

      const ready = journeyPathOrder.every((id) => {
        const path = pathRefs.current[id]?.path
        return path && typeof path.getTotalLength === 'function'
      })

      if (!ready) {
        rafPending.current = true
        window.requestAnimationFrame(updateAvatar)
        return
      }

      const lastSection = sections[sections.length - 1]
      const lastBottom = lastSection.offsetTop + lastSection.offsetHeight
      const skillsSection = document.getElementById('skills')
      const skillsTop = skillsSection ? skillsSection.offsetTop : lastBottom
      const currentY = latestScrollY.current
      const journeyStart = sections[0].offsetTop
      const journeyEnd = skillsSection ? skillsTop : lastBottom
      const journeyHeight = Math.max(1, journeyEnd - journeyStart)
      const globalProgress = Math.min(1, Math.max(0, (currentY - journeyStart) / journeyHeight))
      const nextPosition = getAvatarPositionOnJourney(globalProgress, sections, currentY)
      const scrollDelta = currentY - lastScrollY.current
      const contactSection = document.getElementById('contact')
      const contactEnd = contactSection ? contactSection.offsetTop + contactSection.offsetHeight : skillsTop
      const shouldShow = currentY < contactEnd
      const deltaX = nextPosition.x - lastAvatarX.current
      let direction = lastAvatarDirection.current
      if (deltaX > 0.5) direction = 1
      else if (deltaX < -0.5) direction = -1

      const now = performance.now()
      const deltaTime = lastFrameTime.current ? Math.max(1, now - lastFrameTime.current) : 16
      lastFrameTime.current = now
      const instantVelocity = scrollDelta / deltaTime
      const smoothedVelocity = avatarVelocity.current * 0.7 + instantVelocity * 0.3
      avatarVelocity.current = smoothedVelocity

      const activeSectionId = detectActiveSection(currentY)
      if (lastSectionId.current !== null && lastSectionId.current !== activeSectionId) {
        const enteringActivity = sectionActivity[activeSectionId] || 'walking'
        setIsEnteringSection(true)
        if (sectionEnterTimeout.current) window.clearTimeout(sectionEnterTimeout.current)
        const bumpDuration = enteringActivity === 'stunt' ? 650 : enteringActivity === 'waving' ? 1600 : 320
        sectionEnterTimeout.current = window.setTimeout(() => setIsEnteringSection(false), bumpDuration)
      }
      lastSectionId.current = activeSectionId
      setActiveSection(activeSectionId)

      if (!reducedMotionRef.current) {
        const speedMagnitude = Math.min(1, Math.abs(smoothedVelocity) / 1.2)
        setAvatarMotion({
          tiltY: Math.max(-5, Math.min(5, deltaX * 1.2)),
          tiltZ: Math.max(-4, Math.min(4, smoothedVelocity * 5)),
          depth: Math.min(12, speedMagnitude * 12),
          bounceAmp: 4 + speedMagnitude * 4,
          speedFactor: 1 + speedMagnitude * 0.5
        })
      }

      setAvatarLeft(nextPosition.x)
      setAvatarBottom(nextPosition.bottom)
      setAvatarDirection(direction)
      setShowAvatar(shouldShow)
      lastAvatarX.current = nextPosition.x
      lastAvatarDirection.current = direction
      lastScrollY.current = currentY
    }

    const onScroll = () => {
      latestScrollY.current = window.scrollY
      if (!rafPending.current) {
        rafPending.current = true
        window.requestAnimationFrame(updateAvatar)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    latestScrollY.current = window.scrollY
    rafPending.current = true
    window.requestAnimationFrame(updateAvatar)

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
      if (sectionEnterTimeout.current) window.clearTimeout(sectionEnterTimeout.current)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const targets = document.querySelectorAll(
      '.scene-overlay-inner, .scene-bottom-info, .skill-card, .project-card, .hobby-card'
    )
    if (!targets.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && activeModal) {
        setActiveModal(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal])

  const closeModal = () => setActiveModal(null)

  const activity = sectionActivity[activeSection] || 'walking'
  const pose = activityPoseImage[activity] || 'default'


  const renderModalContent = () => {
    if (!activeModal) return null
    const modal = modalConfig[activeModal]
    if (!modal) return null

    return (
      <div className="scene-modal-backdrop" onClick={closeModal}>
        <div className="scene-modal" onClick={(event) => event.stopPropagation()}>
          <button className="scene-modal-close" onClick={closeModal} aria-label="Close modal">
            ×
          </button>
          <div className="scene-modal-header">
            <span className="scene-label">{modal.title}</span>
            <h2>{modal.title}</h2>
            {modal.introduction && <p>{modal.introduction}</p>}
          </div>
          <div className="scene-modal-body">
            {modal.items ? (
              modal.items.map((item) => (
                <div className="scene-modal-item" key={item.title}>
                  <h3>{item.title}</h3>
                  {item.institution && <p className="scene-modal-subtitle">{item.institution}</p>}
                  {item.location && <p className="scene-modal-location">{item.location}</p>}
                  {item.date && <p className="scene-modal-date">{item.date}</p>}
                  {item.modulesHeading && <p className="scene-modal-section-heading">{item.modulesHeading}</p>}
                {item.modules && item.modules.length > 0 && (
                  <ul className="scene-modal-module-list">
                    {item.modules.map((module, idx) => (
                      <li key={`${item.title}-module-${idx}`}>{highlightText(module)}</li>
                    ))}
                  </ul>
                )}
                {item.details && item.details.length > 0 && (
                  <ul>
                    {item.details.map((detail, idx) => (
                      <li key={`${item.title}-${idx}`}>{highlightText(detail)}</li>
                    ))}
                  </ul>
                )}
              </div>
              ))
            ) : (
              <div className="scene-modal-item">
                <h3>{modal.title}</h3>
                {modal.subtitle && <p className="scene-modal-subtitle">{modal.subtitle}</p>}
                {modal.location && <p className="scene-modal-location">{modal.location}</p>}
                {modal.date && <p className="scene-modal-date">{modal.date}</p>}
                {modal.details && (
                  <ul>
                    {modal.details.map((detail, idx) => (
                      <li key={`${modal.title}-${idx}`}>{highlightText(detail)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="portfolio">
      <div
        className={`hero-avatar${avatarDirection < 0 ? ' flipped' : ''} ${isWalking ? 'walking' : 'idle'}${isEnteringSection ? ' entering' : ''}`}
        data-activity={activity}
        data-pose={pose}
        style={{
          left: `${avatarLeft}%`,
          bottom: `${avatarBottom}vh`,
          display: showAvatar ? 'block' : 'none',
          '--avatar-tilt-y': `${avatarMotion.tiltY}deg`,
          '--avatar-tilt-z': `${avatarMotion.tiltZ}deg`,
          '--avatar-depth': `${avatarMotion.depth}px`,
          '--avatar-bounce-amp': `${avatarMotion.bounceAmp}px`,
          '--avatar-bounce-duration': `${(0.28 / avatarMotion.speedFactor).toFixed(3)}s`,
          '--avatar-bump-scale': isEnteringSection ? 1.05 : 1
        }}
        aria-hidden={!showAvatar}
      >
        <div className="avatar-figure">
          <img
            src={`${import.meta.env.BASE_URL}profile/profile-avatar.png`}
            alt=""
            className={`avatar-pose-img pose-default${activity === 'walking' && isWalking ? ' walking' : ' idle'}`}
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-studying.png`}
            alt=""
            className="avatar-pose-img pose-studying"
            loading="lazy"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-working.png`}
            alt=""
            className="avatar-pose-img pose-working"
            loading="lazy"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-logistics.png`}
            alt=""
            className="avatar-pose-img pose-logistics"
            loading="lazy"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-coding.png`}
            alt=""
            className="avatar-pose-img pose-coding"
            loading="lazy"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-project-analysis.png`}
            alt=""
            className="avatar-pose-img pose-analysing"
            loading="lazy"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-stunt.png`}
            alt=""
            className="avatar-pose-img pose-stunt"
            loading="lazy"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile/avatar-contact.png`}
            alt=""
            className="avatar-pose-img pose-waving"
            loading="lazy"
          />
        </div>
      </div>

      <section id="home" className="scene-section scene-home" aria-label="Home town scene">
        <JourneyPath pathId="home" onPathRef={registerPathRef} />
        <div className="scene-overlay">
          <div className="scene-overlay-inner">
            <span className="scene-label">HOME</span>
            <h1>WELCOME TO MY JOURNEY.</h1>
            <p className="hero-home-name">
              <span className="hero-home-name-intro">Hi, I’m </span>
              <span className="hero-home-name-full">Gaurav Solanki.</span>
            </p>
            <p className="hero-home-role">Business & Data Analyst</p>
            <p className="hero-home-description">
              I turn data into insights, business problems into solutions, and ideas into meaningful decisions.
            </p>
            <p className="hero-home-note">
              Scroll down to explore my journey through education, experience and analytical growth.
            </p>
          </div>
        </div>
      </section>

      <section id="education" className="scene-section scene-education" aria-label="Education town scene.">
        <JourneyPath pathId="education" onPathRef={registerPathRef} />
        <div className="scene-overlay scene-overlay-career">
          <div className="scene-bottom-info">
            <button type="button" className="scene-action-button" onClick={() => setActiveModal('education')}>
              Education
            </button>
          </div>
        </div>
      </section>

      <section id="educate2trade" className="scene-section scene-educate2trade" aria-label="Educate2Trade career scene.">
        <JourneyPath pathId="educate2trade" onPathRef={registerPathRef} />
        <div className="scene-overlay scene-overlay-career">
          <div className="scene-bottom-info">
            <span className="scene-label">CAREER</span>
            <h2>Financial Analyst Intern</h2>
            <p className="scene-meta">Jan 2025 – May 2025 · London, UK</p>
            <button type="button" className="scene-action-button" onClick={() => setActiveModal('educate2trade')}>
              Get More Info
            </button>
          </div>
        </div>
      </section>

      <section id="bhf" className="scene-section scene-bhf" aria-label="British Heart Foundation career scene.">
        <JourneyPath pathId="bhf" onPathRef={registerPathRef} />
        <div className="scene-overlay scene-overlay-career">
          <div className="scene-bottom-info">
            <span className="scene-label">CAREER</span>
            <h2>Retail Volunteer</h2>
            <p className="scene-meta">Mar 2025 – Jun 2025 · Nottingham, UK</p>
            <button type="button" className="scene-action-button" onClick={() => setActiveModal('bhf')}>
              Get More Info
            </button>
          </div>
        </div>
      </section>

      <section id="aston" className="scene-section scene-aston" aria-label="Aston Business Intelligence career scene.">
        <JourneyPath pathId="aston" onPathRef={registerPathRef} />
        <div className="scene-overlay scene-overlay-career">
          <div className="scene-bottom-info">
            <span className="scene-label">CAREER</span>
            <h2>Business Analyst</h2>
            <p className="scene-meta">Sep 2025 – Dec 2025 · Remote</p>
            <button type="button" className="scene-action-button" onClick={() => setActiveModal('aston')}>
              Get More Info
            </button>
          </div>
        </div>
      </section>

      <section id="ceva" className="scene-section scene-ceva" aria-label="CEVA Logistics career scene.">
        <JourneyPath pathId="ceva" onPathRef={registerPathRef} />
        <div className="scene-overlay scene-overlay-career">
          <div className="scene-bottom-info">
            <span className="scene-label">CAREER</span>
            <h2>Warehouse Admin Assistant</h2>
            <p className="scene-meta">Jul 2025 – Present · Derby, UK</p>
            <button type="button" className="scene-action-button" onClick={() => setActiveModal('ceva')}>
              Get More Info
            </button>
          </div>
        </div>
      </section>

      {renderModalContent()}

      <section id="skills" className="skills-section">

        <div className="section-heading">
          <span>MY TOOLKIT</span>
          <h2>Skills & Technologies</h2>
          <p>
            The tools and analytical skills I use to turn data into
            meaningful business decisions.
          </p>
        </div>

        <div className="skills-grid">

    <div className="skill-card">
      <span className="skill-number">01</span>
      <h3>Data & Analytics</h3>
      <div className="skill-tags">
        <span>SQL</span>
        <span>Python</span>
        <span>Power BI</span>
        <span>Excel</span>
        <span>Tableau</span>
      </div>
    </div>

    <div className="skill-card">
      <span className="skill-number">02</span>
      <h3>Business Analysis</h3>
      <div className="skill-tags">
        <span>Requirements Analysis</span>
        <span>Process Mapping</span>
        <span>Stakeholder Management</span>
        <span>Jira</span>
        <span>Confluence</span>
      </div>
    </div>

    <div className="skill-card">
      <span className="skill-number">03</span>
      <h3>Financial Analysis</h3>
      <div className="skill-tags">
        <span>Financial Markets</span>
        <span>Trend Analysis</span>
        <span>Data Interpretation</span>
        <span>Technical Analysis</span>
      </div>
    </div>

  </div>

      </section>

      <section id="projects" className="projects-section">

  <div className="section-heading">
    <span>SELECTED WORK</span>
    <h2>Projects</h2>
    <p>
      Turning raw data into clear insights, business recommendations
      and interactive dashboards.
    </p>
  </div>

  <div className="projects-grid">

    <div className="project-card">
      <div className="project-number">01</div>

      <span className="project-type">DATA ANALYTICS</span>

      <h3>E-Commerce Sales Analysis</h3>


<img
  src="/gaurav-portfolio/project/E-commerce%20Sales%20Dashboard.png"
  alt="E-Commerce Sales Analysis Power BI Dashboard"
  className="project-dashboard"
/>

<p>
  Analysed e-commerce sales data...
</p>
      <p>
        Analysed e-commerce sales data to uncover revenue trends,
        customer purchasing behaviour, product performance and
        geographic insights.
      </p>

      <div className="project-tools">
  <span>SQL</span>
  <span>PostgreSQL</span>
  <span>Power BI</span>
  <span>Data Cleaning</span>
  <span>Data Modelling</span>
  <span>DAX / KPI Creation</span>
  <span>Sales Trend Analysis</span>
  <span>Business Insights</span>
</div>

      <a
  href="https://github.com/solankigaurav976-stack/E-Commerce-Sales-Analysis"
  target="_blank"
  rel="noopener noreferrer"
  className="project-button"
>
  View Project →
</a>

</div>
<div className="project-card">
  <div className="project-number">02</div>

  <span className="project-type">CUSTOMER ANALYTICS</span>

  <h3>Customer Churn Analysis</h3>


<img
  src="/gaurav-portfolio/project/powerbi_churn_dashboard.png"
  alt="Customer Churn Analysis Power BI Dashboard"
  className="project-dashboard"
/>

<p>
  Analysed telecom customer data...
</p>

  <p>
    Analysed telecom customer data to identify churn patterns,
    high-risk customer segments and key retention drivers using
    Python, SQL and Power BI.
  </p>

  <div className="project-tools">
  <span>Python</span>
  <span>Pandas</span>
  <span>PostgreSQL</span>
  <span>Power BI</span>
  <span>EDA</span>
  <span>Customer Behaviour</span>
  <span>Data Visualisation</span>
  <span>Business Recommendations</span>
  <span>Visual Studio Code</span>
</div>

  <a
    href="https://github.com/solankigaurav976-stack/Customer-Churn-Analysis"
    target="_blank"
    rel="noopener noreferrer"
    className="project-button"
  >
    View Project →
  </a>
</div>

<div className="project-card">
  <div className="project-number">03</div>

  <span className="project-type">BUSINESS INTELLIGENCE</span>

  <h3>Supply Chain &amp; Operations Business Intelligence System</h3>


<img
  src="/gaurav-portfolio/project/supply-chain-dashboard.png"
  alt="Supply Chain & Operations Power BI Dashboard"
  className="project-dashboard"
/>

<p>
  Built an end-to-end BI solution for supply chain operations...
</p>

  <p>
    Built an end-to-end Business Intelligence solution using SQL/PostgreSQL and Power BI to analyse 2M+ stock units and £340.86M in inventory value. Identified 254 products at risk by analysing inventory levels, warehouse performance, supplier trends and reorder requirements.
  </p>

  <div className="project-tools">
  <span>SQL</span>
  <span>PostgreSQL</span>
  <span>Power BI</span>
  <span>Excel</span>
  <span>Data Modelling</span>
  <span>2M+ Stock Units</span>
  <span>£340.86M Inventory Value</span>
  <span>254 Products At Risk</span>
</div>

  <a
    href="https://github.com/solankigaurav976-stack/Supply-Chain-Operations-BI"
    target="_blank"
    rel="noopener noreferrer"
    className="project-button"
  >
    View Project →
  </a>
</div>
</div>
</section>  
    <section id="hobbies" className="hobbies-section">

  <div className="section-heading">
    <span>BEYOND THE DATA</span>
    <h2>Outside of Work</h2>
    <p>
      A few things that keep me curious, creative and constantly learning.
    </p>
  </div>

  <div className="hobbies-grid">

    <div className="hobby-card">
      <div className="hobby-icon">🍳</div>
      <h3>Cooking</h3>
      <p>
        Experimenting with new recipes and turning simple ingredients
        into something worth sharing.
      </p>
    </div>

    <div className="hobby-card">
      <div className="hobby-icon">✈️</div>
      <h3>Travelling</h3>
      <p>
        Exploring new places, cultures and experiences whenever I get
        the opportunity.
      </p>
    </div>

    <div className="hobby-card">
      <div className="hobby-icon">💪</div>
      <h3>Calisthenics</h3>
      <p>
        Building strength and discipline through bodyweight training
        and constantly working towards new skills.
      </p>
    </div>

    <div className="hobby-card">
      <div className="hobby-icon">🎬</div>
      <h3>Anime</h3>
      <p>
        Enjoying great storytelling, creative worlds and the occasional
        weekend anime marathon.
      </p>
    </div>

  </div>

</section>
<section id="contact" className="contact-section">

  <div className="contact-content">

    <span className="contact-label">LET'S CONNECT</span>

    <h2>Interested in working together?</h2>

    <p>
      I'm open to opportunities across data analytics, business analysis
      and finance where I can use data to solve problems and support
      better business decisions.
    </p>

    <div className="contact-links">

      <a
        href="mailto:gauravsolanki6590@gmail.com"
        className="contact-button"
      >
        Email Me →
      </a>

      <a
        href="https://www.linkedin.com/in/gaurav-solanki-analyst/"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-button"
      >
        LinkedIn ↗
      </a>

      <a
        href="https://github.com/solankigaurav976-stack/solankigaurav976-stack"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-button"
      >
        GitHub ↗
      </a>
<a
  href="./CV/Gaurav-Solanki-CV.pdf"
  target="_blank"
  rel="noopener noreferrer"
  className="contact-button"
>
  View CV ↗
</a>
    </div>

  </div>

</section>

   

  



    </main>
  )
}

export default App
