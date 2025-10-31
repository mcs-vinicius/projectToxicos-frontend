// src/components/feed/Post.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaTrash, FaCommentDots } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Importar Link

const Post = ({ postData, currentUser, onDeletePost }) => {
    const [comments, setComments] = useState(postData.comments || []);
    const [newComment, setNewComment] = useState('');
    
    // --- FUNÇÃO formatTimeAgo ATUALIZADA ---
    // Esta função agora calcula o tempo exato como no Instagram
    const formatTimeAgo = (isoDate) => {
        const date = new Date(isoDate);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        // 1. Anos
        let interval = seconds / 31536000; // 60 * 60 * 24 * 365
        if (interval > 1) {
            return `${Math.floor(interval)}a`; // 'a' de ano
        }
        // 2. Meses
        interval = seconds / 2592000; // 60 * 60 * 24 * 30
        if (interval > 1) {
            return `${Math.floor(interval)}mês`;
        }
        // 3. Semanas
        interval = seconds / 604800; // 60 * 60 * 24 * 7
        if (interval > 1) {
            return `${Math.floor(interval)}sem`; // 'sem' de semana
        }
        // 4. Dias
        interval = seconds / 86400; // 60 * 60 * 24
        if (interval > 1) {
            return `${Math.floor(interval)}d`; // 'd' de dia
        }
        // 5. Horas
        interval = seconds / 3600; // 60 * 60
        if (interval > 1) {
            return `${Math.floor(interval)}h`; // 'h' de hora
        }
        // 6. Minutos
        interval = seconds / 60;
        if (interval > 1) {
            return `${Math.floor(interval)}m`; // 'm' de minuto
        }
        // 7. Segundos
        return `${Math.max(0, Math.floor(seconds))}s`; // 's' de segundo
    };
    // --- FIM DA FUNÇÃO ATUALIZADA ---

    // Permissão para deletar o POST (Verifica se currentUser existe)
    const canDeletePost = currentUser && (
        currentUser.role === 'admin' || 
        (currentUser.role === 'leader' && postData.author.habby_id === currentUser.habby_id)
    );

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
            setComments([...comments, response.data]);
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
            onDeletePost(postData.id);
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
                        // Permissão para deletar o comentário (Verifica se currentUser existe)
                        const canDeleteComment = currentUser && (
                            currentUser.role === 'admin' || 
                            currentUser.role === 'leader' || 
                            (comment.author.habby_id && comment.author.habby_id === currentUser.habby_id)
                        );
                        
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
                
                {/* Mostra o formulário de comentário se estiver logado, ou um link para login se não estiver */}
                {currentUser ? (
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
                ) : (
                    <p className="comment-login-prompt">
                        <Link to="/login">Faça login</Link> para deixar um comentário.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Post;