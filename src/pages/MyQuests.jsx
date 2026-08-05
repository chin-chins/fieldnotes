import { useNavigate } from "react-router-dom";
import { supabase } from "../client";
import { ensureUserId } from "../utils/user";
import { useState, useEffect } from "react";
import QuestCard from '../components/QuestCard';
import '../styles/QuestCard.css'
import '../styles/MyQuests.css'

const MyQuests = () =>{
    const [myQuests, setMyQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyQuests = async () => {
        setLoading(true)
        const userId = await ensureUserId()

        const { data, error } = await supabase
            .from('quests')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching my quests:', error.message)
        } else {
            setMyQuests(data || [])
        }
        setLoading(false)
        }

        fetchMyQuests()
    }, [])

    if (loading) return <div className="page-container">Loading your quests...</div>

    return(
        <div className="my-quests-page">
            <div className="my-quests-title">
                <h1>My Quests</h1>
            </div>

            <div className="page-subtitle">
                <p className="page-subtitle">Quests you have created and posted to the community!</p>
            </div>

            {myQuests.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't posted any sidequests yet!</p>
                    <button className="create-btn" onClick={() => navigate('/add-quest')}>
                        create your first quest (o゜▽゜)o☆
                    </button>
                </div>
            ) : (
                <div className="quest-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {myQuests.map((quest) => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            actionButton={
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/quest/${quest.id}`);
                                    }}
                                    className="edit-btn"
                                >
                                    view/edit quest
                                </button>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyQuests