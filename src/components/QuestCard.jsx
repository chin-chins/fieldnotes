import { useNavigate } from "react-router-dom"
import "../styles/QuestCard.css"
import earthPic from '../assets/earth_nature_futaba.png'

const QuestCard = ({quest, onUpvote = null, actionButton = null}) =>{
    const navigate = useNavigate();

    const handleCloverClick = (e) =>{
        e.stopPropagation(); // prevents page from navigating to detail view when clover is clicked 
        if (onUpvote) {
            onUpvote(quest.id, quest.clovers || 0);
        }
    }

    return(
        <div 
            className="quest-card" 
            onClick={() => navigate(`/quest/${quest.id}`)}
        >

            <div className="card-img">
                <img
                    src={quest.image_url?.trim() ? quest.image_url : earthPic}
                    alt={quest.title}
                    onError={(event) => {
                        event.currentTarget.src = earthPic;
                    }}
                />
            </div>

            <div className="card-content">
                <h3 className="quest-title">{quest.title}</h3>

                <div className="card-details">
                    <p className="detail-line">📍 {quest.location_tag || 'Worldwide'}</p>
                    <p className="detail-line">⏳ {quest.time_to_complete || 'Anytime'}</p>
                    <p></p>
                </div>

                {actionButton || (onUpvote && (
                    <button className="clover-button" onClick={handleCloverClick}>
                        <span className="clover-icon">🍀</span>
                        <span className="clover-count">{quest.clovers || 0}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default QuestCard