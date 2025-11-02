import { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import './Post.css'; 
import PostTextarea from './PostTextarea';

export default function Post({ setIsLocked, onPostSuccess, onClose, editMode = false, postToEdit = null, isLocked = false, groupId = null }) {
    const userId = localStorage.getItem('userId');
    const [postContent, setPostContent] = useState(editMode && postToEdit ? postToEdit.content : '');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingMediaUrls, setExistingMediaUrls] = useState(editMode && postToEdit ? postToEdit.mediaUrls || [] : []);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const postToMongo = async (content, mediaUrls) => {
        try {
            if (editMode) {
                // Update existing post
                const removedMediaUrls = postToEdit.mediaUrls.filter(url => !mediaUrls.includes(url));
                
                await axios.put('http://localhost:5000/api/posts/update', {
                    postId: postToEdit._id,
                    userId,
                    content,
                    mediaUrls,
                    removedMediaUrls
                });
            } else {
                // Create new post
                await axios.post('http://localhost:5000/api/posts', {
                    userId,
                    content,
                    mediaUrls: mediaUrls || [],
                    ...(groupId ? { groupId } : {}),
                });
            }
            
            setPostContent('');
            setSelectedFiles([]);
            setExistingMediaUrls([]);
            if (onPostSuccess) onPostSuccess();
            setIsLocked(false);
            setIsUploading(false);
            onClose();
        } catch (error) {
            console.error('Error posting:', error);
            alert(editMode ? 'Failed to update post. Please try again later.' : 'Failed to post. Please try again later.');
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handlePost = async () => {
        if (postContent.trim() === '') {
            alert('Post content cannot be empty');
            return;
        }
        setIsLocked(true); 
        if(selectedFiles.length > 0) setIsUploading(true);
        setUploadProgress(0);
        let fileUrls = [];
        
        try {
            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(async (file, index) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await axios.post('http://localhost:5000/api/upload', formData, {
                        headers: { 'content-type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent) => {
                            const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            const overallProgress = Math.round(((index * 100) + fileProgress) / selectedFiles.length);
                            setUploadProgress(overallProgress);
                        }
                    });
                    
                    if (response.data.success && response.data.url) {
                        return response.data.url;
                    } else {
                        throw new Error('Upload response missing URL');
                    }
                });
                
                fileUrls = await Promise.all(uploadPromises);
            }
            
            const allMediaUrls = [...existingMediaUrls, ...fileUrls];
            await postToMongo(postContent, allMediaUrls);
        } catch (error) {
            console.error('Error posting:', error);
            alert(editMode ? 'Failed to update post. Please try again later.' : 'Failed to post. Please try again later.');
        } finally {
            setUploadProgress(0);
        }
    };

    const chooseImage = () => {
        fileInputRef.current.click();
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingMedia = (index) => {
        setExistingMediaUrls(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="post-container">
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
            />
            <PostTextarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={setPostContent}
            />

            {isUploading && (
                <div style={{margin: '10px 0', color: '#2563eb'}}> 
                    <div>Uploading files... {uploadProgress}%</div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginTop: '5px'
                    }}>
                        <div style={{
                            width: `${uploadProgress}%`,
                            height: '100%',
                            backgroundColor: '#2563eb',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    {uploadProgress === 100 && <div>{editMode ? 'Updating your post..' : 'Posting your post..'} don't exit or refresh page</div>}
                </div>   
            )}

            {/* Existing Media Display (only in edit mode) */}
            {editMode && existingMediaUrls.length > 0 && (
                <div style={{
                    margin: '10px 0',
                    color: '#3289e5',
                    width: '100%',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px',
                    background: '#fafbfc',
                }}>
                    <h4>Existing Media:</h4>
                    {existingMediaUrls.map((url, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', position: 'relative', paddingRight: '28px' }}>
                            <button
                                type="button"
                                onClick={() => handleRemoveExistingMedia(idx)}
                                className='deleteBtn'
                                title="Remove existing media"
                            >
                                x
                            </button>
                            {url.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video
                                    src={url}
                                    controls
                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                                />
                            ) : (
                                <img
                                    src={url}
                                    alt="Existing media"
                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New Files Display */}
            {selectedFiles.length > 0 && (
                <div style={{
                    margin: '10px 0',
                    color: '#3289e5',
                    width: '100%',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px',
                    background: '#fafbfc',
                }}>
                    {editMode && <h4>New Files:</h4>}
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', position: 'relative', paddingRight: '28px' }}>
                            Selected: {file.name.length > 50 ? file.name.slice(0, 50) + '...' : file.name}
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className='deleteBtn'
                                title="Remove file"
                            >
                                x
                            </button>
                            <br />
                            {file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                                />
                            ) : file.type.startsWith('video/') ? (
                                <video
                                    src={URL.createObjectURL(file)}
                                    controls
                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
            
            <div>
                <button onClick={handlePost} className="postButton marginR" disabled={isLocked}>
                    {editMode ? 'Update' : 'Post'}
                </button>
                <button onClick={chooseImage} className='postButton marginR' disabled={isLocked}>
                    {editMode ? 'Add Media' : 'Choose Image'}
                </button>
                {editMode && (
                    <button onClick={onClose} className='postButton' style={{backgroundColor: '#6b7280'}} disabled={isLocked}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
