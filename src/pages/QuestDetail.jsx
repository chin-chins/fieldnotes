import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { ensureUserId } from '../utils/user';
import { uploadImage } from '../utils/upload';
import defaultQuestImage from '../assets/earth_nature_futaba.png';
import "../styles/QuestDetail.css"

const QuestDetail = () =>{
    const { id } = useParams();
    const navigate = useNavigate();

    // for quests 
    const [quest, setQuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setIsEditing] = useState(false);
    const CATEGORY_OPTIONS = ['creative', 'fitness', 'exploration', 'social', 'mindfulness', 'food', 'educational'];

    // for comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // for auth 
    // track the current user ID so we can compare it to the quest or comment author
    const [currentUserID, setCurrentUserID] = useState(null);
    // quest is "owned" by the current user when the author_id matches user ID
    const isAuthor = quest && currentUserID && quest.author_id === currentUserID;

    // for images 
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // edit form state 
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        category: '',
        location_tag: '',
        time_to_complete: '',
        image_url: ''
    });

    // get quest details 
    const fetchQuestDetail = async () => {
        setLoading(true);
        const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single();

        if (error) {
            console.error('Error fetching quest:', error);
        } else {
            const categoriesValue = data.categories || data.category || '';
            setQuest(data);
            setEditFormData({
                title: data.title || '',
                description: data.description || '',
                category: categoriesValue,
                location_tag: data.location_tag || 'Worldwide',
                time_to_complete: data.time_to_complete || '',
                image_url: data.image_url || ''
            });
        }
        setLoading(false);
    }

    // get comment details
    const fetchComments = async () => {
        setLoadingComments(true);
        const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('quest_id', id)
        .order('created_at', {ascending: false}); // newest comments first 

        if (error) {
            console.error('Error fetching comments:', error.message);
        } else {
            setComments(data || []);
        };

        setLoadingComments(false);
    }

    // resolve active user once when the page loads so later ownership checks use a stable ID
    useEffect(() => {
        ensureUserId().then(setCurrentUserID);
    }, []);

    // reload quest/comments whenever the route's quest ID changes
    useEffect(() => {
        fetchQuestDetail();
        fetchComments();
    }, [id]);

    // new comment handler 
    const handleNewComment = async (event) => {
        event.preventDefault();
        if(!newComment.trim()) return;

        // make sure we have real user ID before saving the comment to supabase
        const userId = await ensureUserId();
        const { data, error } = await supabase
        .from('comments')
        .insert([{
            quest_id: id, 
            content: newComment,
            author_id: userId
        }])
        .select();

        if (error) {
            console.error('Error adding comment:', error.message);
            alert('Failed to post comment.');
        } else {
            setComments((prev) => [data[0], ...prev]); // add new comment immediately
            setNewComment('') // clear input
        }
    }

    // deletion 
    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this quest?");
        if (!confirmDelete) return;

        const userId = await ensureUserId();
        const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', id)
        .eq('author_id', userId); // double security check 

        if (error) {
            console.error('Error deleting quest:', error.message);
            alert('Failed to delete quest.');
        } else {
            alert('Quest deleted successfully!');
            navigate('/'); // redirect home 
        }
    }

    // comment deletion 
    const handleCommentDelete = async (commentID, commentAuthorID) => {
        // only allow the comment author to delete their own post
        if (!currentUserID || commentAuthorID !== currentUserID) {
            alert( "only the orginal posters can delete this!");
            return;
        }

        const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentID)

        if (error) {
            console.error('Error deleting comment:', error.message)
        } else {
            setComments((prev) => prev.filter((c) => c.id !== commentID))
        }
    }

    // edit form input 
    const handleEditChange = (event) => {
        const { name, value } = event.target
        setEditFormData((prev) => ({
        ...prev,
        [name]: value
        }))
    }

    // editing
    const handleEdit = async (event) => {
        event.preventDefault();
        setUploading(true);

        try {
            let newImageURL = editFormData.image_url;

            if (selectedFile) {
                newImageURL = await uploadImage(selectedFile);
            }

            const userId = await ensureUserId();
            const normalizedCategories = editFormData.category
                .split(',')
                .map((category) => category.trim().toLowerCase())
                .filter(Boolean)
                .join(', ');

            const { data, error } = await supabase
            .from('quests')
            .update({
                title: editFormData.title,
                description: editFormData.description,
                categories: normalizedCategories,
                location_tag: editFormData.location_tag,
                time_to_complete: editFormData.time_to_complete,
                image_url: newImageURL
            })
            .eq('id', id)
            .eq('author_id', userId) // double security check 
            .select();
        
        
            if (error) {
                console.error('Error updating quest:', error.message);
                alert('Failed to update quest.');
            } else {
                setQuest({
                    ...data[0],
                    categories: normalizedCategories,
                    category: normalizedCategories,
                });
                setIsEditing(false);
                setSelectedFile(null); // clear selected file
            }
        }
        catch (error) {
            console.error('Error uploading image during edit:', err);
            alert('Failed to upload new image.');
        }
        finally {
            setUploading(false);
        }  
    }

    // category editing
    const handleCategoryToggle = (categoryName) => {
        const normalizedCategoryName = categoryName.toLowerCase();

        setEditFormData((prev) => {
            const currentCategories = prev.category
                ? prev.category.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean)
                : [];

            const updatedCategories = currentCategories.includes(normalizedCategoryName)
                ? currentCategories.filter((c) => c !== normalizedCategoryName)
                : [...currentCategories, normalizedCategoryName];

            return {
                ...prev,
                category: updatedCategories.join(', '),
            };
        });
    };

    // upvoting
    const handleUpvote = async () => {
        const newCloverCount = (quest.clovers || 0) + 1;

        setQuest((prev) => ({...prev, clovers: newCloverCount}));

        const { error } = await supabase
        .from('quests')
        .update({ clovers: newCloverCount })
        .eq('id', id);

        if (error) {
            console.error('Error updating clovers:', error.message);
            // revert local state if database update failed
            setQuest((prev) => ({ ...prev, clovers: (quest.clovers || 0) }));
        }
    }

    if (loading) return <div className="detail-loading">Loading quest...</div>
    if (!quest) return <div className="detail-loading">Quest not found!</div>

    return(
       <div className="quest-detail-page">
        <div className='detail-layout'>
        <div className='detail-panel quest-content'>
            {/* conditional rendering for editing mode */}
            {editing ? (
                <form onSubmit={handleEdit} className="edit-form">
                        <h2>Edit Quest Details</h2>

                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditChange}
                            className="form-input"
                            required
                        />
                        <br/>

                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            className="form-input"
                            rows={4}
                            required
                        />
                        <br/>

                        <label className="form-label">Categories (Select all that apply)</label>
                        <div className="checkbox-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                            {CATEGORY_OPTIONS.map((cat) => {
                                const selectedCategories = editFormData.category
                                    ? editFormData.category.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean)
                                    : [];
                                const isChecked = selectedCategories.includes(cat.toLowerCase());

                                return (
                                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                                    <input
                                    type="checkbox"
                                    name="category"
                                    value={cat}
                                    checked={isChecked}
                                    onChange={() => handleCategoryToggle(cat)}
                                    />
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </label>
                                );
                            })}
                            </div>
                        <br/>

                        <label className="form-label">Location Tag</label>
                        <input
                            type="text"
                            name="location_tag"
                            value={editFormData.location_tag}
                            onChange={handleEditChange}
                            className="form-input"
                        />
                        <br/>

                        <label className="form-label">Time to Complete</label>
                        <input
                            type="text"
                            name="time_to_complete"
                            value={editFormData.time_to_complete}
                            onChange={handleEditChange}
                            className="form-input"
                        />
                        <br/>

                        {editFormData.image_url && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p className="form-label">Current Image:</p>
                                <img 
                                    src={editFormData.image_url} 
                                    alt="Current quest preview" 
                                    style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px' }} 
                                />
                            </div>
                        )}

                        {/* file upload from device */}
                        <label className="form-label">Upload New Image from Device</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="submit-btn" disabled={uploading}>
                                {uploading ? 'saving image & quest...' : 'save'}</button>
                            <button type="button" className='cancel-btn' onClick={() => setIsEditing(false)}>cancel</button>
                        </div>
                    </form>
            ) : (
                <>
                    <div className="quest-image">
                        <img 
                            src={quest.image_url || defaultQuestImage} 
                            alt={quest.title} 
                        />
                    </div>

                    <h1 className='quest-title'>{quest.title}</h1>

                    <div className="quest-tags">
                        <span className="badge">🏷️ {quest.categories || 'Uncategorized'}</span>
                        <span className="badge">📍 {quest.location_tag || 'Worldwide'}</span>
                        <span className="badge">⏳ {quest.time_to_complete}</span>
                        <span className="badge">🍀 {quest.clovers || 0} Clovers</span>
                    </div>
                    
                    <p className="quest-description">{quest.description}</p>

                    <button type="button" onClick={handleUpvote} className='clover-btn'> 
                        give this quest a Clover! 🍀 
                    </button>

                    {isAuthor && !editing ? (
                        <div className="author-actions">
                            <button onClick={() => setIsEditing(true)}>edit quest</button>
                            <button onClick={handleDelete}>delete quest</button>
                        </div>
                    ): <></>}
                </>
            )}  
        </div>

        <div className='detail-panel notes-panel'>
            <h2 className='right-side-title'>quester notes</h2>

            <div className='notes-paper-card'>
                <h3 className='comments-section-title'>leave a note!</h3>
            
                <form onSubmit={handleNewComment} className="comment-form">
                    <input
                        type="text"
                        placeholder="write a reflection or tip for this quest..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="form-input"
                    />
                    <button type="submit" className="submit-btn">post note ➔</button>
                </form>
            
                {loadingComments ? (
                <p>loading journal logs...</p>
                ) : comments.length === 0 ? (
                <p className="no-comments">no notes yet. be the first to complete this quest!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="note-card">
                            <div className='note-header'>
                                <strong>
                                    {comment.author_id === currentUserID
                                    ? 'you!'
                                    : `explorer (${comment.author_id?.slice(-4) || 'anon'})`}
                                </strong>
                                {comment.author_id === currentUserID && (
                                    <button 
                                        type="button"
                                        onClick={() => handleCommentDelete(comment.id, comment.author_id)}
                                        className='delete-note-btn'
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <p className='note-body'>{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

        </div>  
        </div>
    </div>
    )
}

export default QuestDetail