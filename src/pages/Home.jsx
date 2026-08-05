import { useState, useEffect, use } from "react"
import { supabase } from "../client"
import QuestCard from "../components/QuestCard"

const Home = () =>{
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // fetch posts from supabase
    const fetchQuests = async () => {
        setLoading(true);
        let query = supabase.from('quests').select('*');

        if (sortBy === 'newest'){
            query = query.order('created_at', {ascending: false});
        }
        else if (sortBy === 'clovers') {
            query = query.order('clovers', {ascending: false});
        }

        const {data, error} = await query;
        if (error) {
            console.error('Error fetching quests:', error);
        }
        else {
            setQuests(data || []);
        }

        setLoading(false);
    }   

    // trigger fetch on initial render/when sort order changes 
    useEffect(() => {
        fetchQuests()
    }, [sortBy]);
    
    // upvote/clover handling 
    const handleUpvote = async (QuestGrid, currentClovers) => {
        setQuests((prevQuests) =>
            prevQuests.map((q) =>
            q.id === questId ? {...q, clovers: currentClovers + 1} : q)
        );
    
        const { error } = await supabase
            .from('quests')
            .update({clovers: currentClovers + 1})
            .eq('id', questId);

        if (error) {
            console.error('Error updating clovers:', error);
            fetchQuests() // re-fetch on error to restore number 
        }
    }

    // quest filters (location/title)
    const filteredQuests = quests.filter((q) =>
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.location_tag?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return(
    <div className="home-page">
        <div className="header-tape-banner">
            <h1>fieldnotes !!</h1>
        </div>

        {/* search bar & sort selection */}
        <div className="feed-controls">
            <input
                type="text"
                placeholder="search for quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />

            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
            >
                <option value="newest">Sort by: Newest</option>
                <option value="clovers">Sort by: Most Clovers 🍀</option>

            </select>
        </div>

        {/* grid display */}
        {loading ? (
            <p className="loading-text">Loading active quests...</p>
        ) : filteredQuests.length === 0 ? (
            <p className="empty-feed-text">No quests found! Try clearing search or add a new quest.</p>
        ) : (
            <div className="quest-grid">
            {filteredQuests.map((quest) => (
                <QuestCard 
                key={quest.id} 
                quest={quest} 
                onUpvote={handleUpvote} 
                />
            ))}
            </div>
        )}
        
    </div>
    )
}

export default Home