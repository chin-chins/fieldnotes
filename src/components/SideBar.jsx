import "../styles/SideBar.css"
import { useNavigate, useLocation } from "react-router-dom"

const SideBar = () =>{
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {id: 'home', label: 'home', path: '/'},
        {id: 'add', label: 'add a quest', path: '/add-quest'},
        {id: 'my-quests', label: 'my quests', path: '/my-quests'},
        {id: 'about', label: 'about', path: '/about'}
    ]

    return(
        <aside className="sidebar">
            <div className="nav-container">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="star-icon">⭐</span>
                        <span className="nav-text">{item.label}</span>
                    </button>
                ))}
            </div>
        </aside>
    )
}

export default SideBar;