// src/components/feed/Post.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaTrash, FaCommentDots } from 'react-icons/fa';

const Post = ({ postData, currentUser, onDeletePost }) => {
    const [comments, setComments] = useState(postData.comments || []);
    const [newComment, setNewComment] = useState('');
    
    // Formata a data (ex: "há 5 minutos", "ontem às 10:30")
    const formatTimeAgo = (isoDate) => {
        const date = new Date(isoDate);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}a`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}m`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} min`;
        return `${Math.floor(seconds)}s`;
    };

    // Permissão para deletar o POST (Admin ou o próprio autor, se for líder)
    const canDeletePost = currentUser.role === 'admin' || 
                         (currentUser.role === 'leader' && postData.author.habby_id === currentUser.habby_id);

    // Lidar com a submissão de um novo comentário
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/posts/${postData.id}/comment`,
                { text: newComment },
                { withCredentials: true }
            );
            setComments([...comments, response.data]); // Adiciona o novo comentário à lista
            setNewComment('');
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
            alert("Não foi possível adicionar o comentário.");
        }
    };

    // Lidar com a exclusão de um comentário
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Tem certeza que deseja excluir este comentário?")) return;
        
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
                { withCredentials: true }
            );
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Erro ao excluir comentário:", error);
            alert("Não foi possível excluir o comentário.");
        }
    };

    // Lidar com a exclusão do POST
    const handleDeletePost = async () => {
        if (!window.confirm("Tem certeza que deseja excluir esta publicação?")) return;
        
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/posts/${postData.id}`,
                { withCredentials: true }
            );
            onDeletePost(postData.id); // Informa o pai (FeedPage) que o post foi deletado
        } catch (error) {
            console.error("Erro ao excluir post:", error);
            alert("Não foi possível excluir a publicação.");
        }
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img 
                    src={postData.author.profile_pic_url} 
                    alt={postData.author.nick} 
                    className="post-author-pic" 
                />
                <div className="post-author-info">
                    <span className="post-author-nick">{postData.author.nick}</span>
                    <span className="post-timestamp">{formatTimeAgo(postData.created_at)}</span>
                </div>
                {canDeletePost && (
                    <button className="post-delete-btn" title="Excluir Publicação" onClick={handleDeletePost}>
                        <FaTrash />
                    </button>
                )}
            </div>

            <img src={postData.image_url} alt="Publicação" className="post-image" />

            {postData.caption && (
                <p className="post-caption">
                    <strong>{postData.author.nick}</strong>
                    {postData.caption}
                </p>
            )}

            <div className="post-comments-section">
                <div className="comments-list">
                    {comments.map(comment => {
                        // Permissão para deletar o comentário
                        const canDeleteComment = currentUser.role === 'admin' || 
                                                 currentUser.role === 'leader' || 
                                                 comment.author.habby_id === currentUser.habby_id;
                        
                        return (
                            <div className="comment" key={comment.id}>
                                <strong className="comment-author">{comment.author.nick}</strong>
                                <span className="comment-text">{comment.text}</span>
                                
                                {canDeleteComment && (
                                    <button className="comment-delete-btn" title="Excluir Comentário" onClick={() => handleDeleteComment(comment.id)}>
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <input
                        type="text"
                        className="comment-input"
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="btn-comment" title="Comentar">
                        <FaCommentDots />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Post;