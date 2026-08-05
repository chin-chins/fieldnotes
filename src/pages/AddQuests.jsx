import { useState } from 'react'
import { supabase } from '../client'
import { ensureUserId } from '../utils/user'
import { useNavigate } from 'react-router-dom'
import { uploadImage } from '../utils/upload'

const AddQuests = () =>{
    const navigate = useNavigate();
    const CATEGORY_OPTIONS = ['creative', 'fitness', 'exploration', 'social', 'mindfulness', 'food', 'educational'];

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [quest, setQuest] = useState({
        title: '',
        description: '',
        categories: [],
        is_local: true,
        location: 'Worldwide',
        time_to_complete: '',
        clovers: 0,
        image_url: ''
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
    
        setQuest((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCategoryChange = (event) => {
        const { value, checked } = event.target;

        setQuest((prev) => {
            // convert string into array 
            const currentCategories = Array.isArray(prev.categories) ? prev.categories : [];

            if (checked) {
                // add category only once so array stays stable
                const nextCategories = currentCategories.includes(value)
                    ? currentCategories
                    : [...currentCategories, value];

                return { ...prev, categories: nextCategories };
            }

            // remove the category when the box is unchecked
            return {
                ...prev,
                categories: currentCategories.filter((cat) => cat !== value),
            };
        });
    };

     const handleSubmit = async (event) => {
        event.preventDefault();
        setUploading(true);

        try {
            let imageUrl = '';

            if(selectedFile) {
                imageUrl = await uploadImage(selectedFile);
            }

            const currentUserID = await ensureUserId();

            console.log("Submitting Quest...", quest);

            const {data, error} = await supabase
            .from('quests')
            .insert([{
                title: quest.title,
                description: quest.description,
                categories: quest.categories.join(', '),
                is_local: quest.is_local,
                location_tag: quest.location_tag,
                time_to_complete: quest.time_to_complete ? `${quest.time_to_complete} hrs` : 'Flexible',
                clovers: quest.clovers,
                image_url: imageUrl,
                author_id: currentUserID
            }])
            .select();
    
            console.log("Quest Data Ready to Send:", quest);
            if (error) {
                console.error("Supabase Error:", error.message);
            } else {
                console.log("Success! Data inserted:", data);
                navigate("/"); // navigate back to home page 
            }
        }
        catch (error) {
            console.error("Error creating quest");
            alert("Failed to upload image or create quest.");
        }
        finally {
            setUploading(false);
        }
    }

    return(
         <div className='create-quest'>
            <h1 className='create-header'>add a quest !!</h1>  
            
            <form className="create-form" onSubmit={handleSubmit}>

                <div className="form-badge">
                    <label className="form-label">Quest Title</label>
                    <input 
                        type="text" 
                        name="title"
                        className="form-input" 
                        onChange={handleChange}
                        placeholder="e.g. Find a bench with a pretty view"
                        required
                    />
                </div>

                <div className="form-badge">
                    <label className="form-label">Description</label>
                    <input 
                        type="text" 
                        name="description"
                        className="form-input" 
                        onChange={handleChange}
                        placeholder='What is this quest about? How should/can it be done?'
                    />
                </div>

                 <div className="form-badge">
                    <label className="form-label">Specific Location? (Dropdown)</label>
                    <select 
                        name="is_local" 
                        value={quest.is_local} 
                        onChange={(e) => setQuest(prev => ({ ...prev, is_local: e.target.value === 'true' }))}
                        className="form-input"
                    >
                        <option value="false">No - Global Quest (Worldwide)</option>
                        <option value="true">Yes - Local / Spot Quest</option>
                    </select>
                </div>
                
                {/* users can specify quest locations */}
                {quest.is_local && (
                    <div className="form-badge">
                        <label className="form-label">Location Tag</label>
                        <input 
                        type="text" 
                        name="location_tag"
                        value={quest.location_tag}
                        className="form-input" 
                        onChange={handleChange}
                        placeholder="e.g. Local Park, Quiet Coffee Shop"
                        />
                    </div>
                )}

                <div className="form-badge">
                    <label className="form-label">Categories (Select all that apply)</label>
                    <div className="checkbox-group">
                        {CATEGORY_OPTIONS.map((category) => (
                            <label key={category} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="category"
                                    value={category}
                                    checked={quest.categories.includes(category)}
                                    onChange={handleCategoryChange}
                                />{' '}
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-badge">
                    <label className="form-label">Time To Complete (Hrs)</label>
                    <input 
                        type="number" 
                        name="time_to_complete"
                        className="form-input" 
                        onChange={handleChange}
                    />
                </div>

                <div className='form-badge'>
                    <label className="form-label" htmlFor="image_url">Add Image/Quest Cover from Device</label><br />
                    <input 
                        className="form-input" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <br/>
                </div>
                
                <div className='form-actions'>
                    <button className='submit-btn' type="submit" disabled={uploading}>
                        {uploading ? "Uploading and saving..." : "Save Quest"}</button>
                </div>
            </form>
        </div>
    )
}

export default AddQuests