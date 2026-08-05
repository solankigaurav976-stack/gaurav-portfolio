import { useEffect, useState } from 'react'
import './App.css'

function App() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isWalking, setIsWalking] = useState(false)

useEffect(() => {
  let walkTimer
  const handleScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.min(window.scrollY / (window.innerHeight * 1.2), 1)
    setScrollProgress(progress)
    setIsWalking(true)
    clearTimeout(walkTimer)
    walkTimer = setTimeout(() => setIsWalking(false), 140)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  return () => {
    window.removeEventListener('scroll', handleScroll)
    clearTimeout(walkTimer)
  }
}, [])

  return (
    <main className="portfolio">

      <section id="home" className="town-scroll-scene">
        <div className="town-sticky">
          <div className="town-background" aria-hidden="true" />
          <div className="town-shade" aria-hidden="true" />

          <nav className="town-nav">
            <div className="town-brand">
              <strong>Gaurav Solanki</strong>
              <span>Data Analyst · Business Analyst · Financial Analyst</span>
            </div>
            <div className="town-progress">
              <span className="active">01 HOME</span>
              <span>02 EDUCATION</span>
              <span>03 CAREER</span>
              <span>04 SKILLS</span>
              <span>05 PROJECTS</span>
              <span>06 CONTACT</span>
            </div>
          </nav>

          <aside className="town-about">
            <span>ABOUT ME</span>
            <h1>Welcome to my journey.</h1>
            <p>
              I turn data, business problems and ideas into meaningful insights
              and better decisions. Scroll to travel with me from home to my
              academic and professional journey.
            </p>
            <div className="town-actions">
              <button onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore My Story →
              </button>
              <a href="/CV/Gaurav-Solanki-CV.pdf" target="_blank" rel="noreferrer">View CV</a>
            </div>
          </aside>

          <div
            className={`town-avatar ${isWalking ? 'is-walking' : ''}`}
            style={{ '--walk': Math.min(scrollProgress * 3.2, 1) }}
          >
            <img src="/profile/profile-avatar-transparent.png" alt="Animated portfolio character" />
          </div>

          <div className="town-scroll-hint">
            <span>SCROLL TO WALK</span>
            <div className="town-scroll-track"><i style={{ width: `${Math.min(scrollProgress * 320, 100)}%` }} /></div>
          </div>
        </div>
      </section>

      <section id="journey" className="journey-section">
  <div className="journey-heading">
    <span>MY JOURNEY</span>
    <h2>The Road So Far</h2>
    <p>
      Building experience across business, finance and data — one step at a time.
    </p>
  </div>

  <div className="timeline">
    <div className="timeline-card">
  <span className="year">Sep 2020 — June 2023</span>
  <h3>BBA Human Resource Management</h3>
  <h4>Amity University</h4>
  <p>
    Built a strong foundation in business and human resource management,
    with experience in management, organisational behaviour and
    business decision-making.
  </p>
</div>
    <div className="timeline-card">
      <span className="year">Sep 2023 — Sep 2024</span>
      <h3>MSc International Business</h3>
      <h4>Nottingham Trent University</h4>
      <p>
        Developed my understanding of international business, strategy,
        research and data-driven decision making.
      </p>
    </div>

    <div className="timeline-card">
      <span className="year">Jan 2025 — May 2025</span>
      <h3>Financial Analyst Intern</h3>
      <h4>Educate2Trade</h4>
      <p>
        Analysed financial markets, interpreted data and developed
        analytical approaches to support trading decisions.
      </p>
    </div>
    <div className="timeline-card">
  <span className="year">Mar 2025 – Jun 2025</span>
  <h3>Retail Volunteer</h3>
  <h4>British Heart Foundation</h4>
  <p>
    Supported customers, organised stock and assisted with day-to-day
    retail operations while developing communication and teamwork skills.
  </p>
</div>

    <div className="timeline-card">
      <span className="year">Sep 2025 — Dec 2025</span>
      <h3>Business Analyst</h3>
      <h4>Aston Business Intelligence</h4>
      <p>
        Analysed business data, identified improvement opportunities
        and presented actionable recommendations to stakeholders.
      </p>
    </div>
    <div className="timeline-card">
  <span className="year">Jul 2025 – Present</span>
  <h3>Warehouse Admin Assistant</h3>
  <h4>CEVA Logistics</h4>
  <p>
    Support warehouse administration and operational processes, maintaining
    accurate information and helping coordinate efficient day-to-day operations.
  </p>
</div>

  </div>
</section>
      
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

</section><section id="projects" className="projects-section">

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
  src="/project/E-commerce%20Sales%20Dashboard.png"
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
  src="/project/powerbi_churn_dashboard.png"
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
  href="/CV/Gaurav-Solanki-CV.pdf"
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
