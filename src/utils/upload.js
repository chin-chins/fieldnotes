import { supabase } from '../client';

const uploadImage = async (file) => {
    if (!file) return '';
    
    const fileExt = file.name.split('.').pop();
    // create a unique file path to prevent overwriting existing files  
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
    .from('quest-images')
    .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }
    
    // get public url for uploaded image 
    const { data } = supabase.storage
    .from('quest-images')
    .getPublicUrl(filePath);

    return data.publicUrl;
}

export { uploadImage };