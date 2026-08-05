import { useNavigate } from 'react-router-dom'
import '../styles/About.css'

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page page-container">
      <div className='about-header'>
        <h1>About SideQuest</h1>
      </div>
      <div className="about-subtitle">
        <p >
          SideQuest is a community platform designed to break routine and turn everyday life into an interactive adventure game!
        </p>
      </div>

      <section className="about-section">
        <h2>How It Works</h2>
        <ul style={{ lineHeight: '1.8', fontSize: '1rem' }}>
          <li><strong>Find a Quest:</strong> Browse micro-missions created by explorers near you or around the world.</li>
          <li><strong>Take Action:</strong> Complete tasks ranging from creative art prompts and fitness challenges to local spot explorations.</li>
          <li><strong>Log Your Journey:</strong> Leave reflections and tips in the journal logs on any quest details page.</li>
          <li><strong>Share the Fun:</strong> Post your own custom quests for others to attempt and give clovers 🍀 to your favorite missions!</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Community Rules</h2>
        <ul>
          <li>Keep quests safe, accessible, and positive.</li>
          <li>Respect local guidelines when exploring public or community spots.</li>
          <li>Be encouraging in the community journal comments!</li>
        </ul>
      </section>

      <div>
        <button className="submit-btn" onClick={() => navigate('/')}>
          explore quests now! 
        </button>
      </div>
    </div>
  )
}

export default About