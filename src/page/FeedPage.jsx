// src/page/FeedPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from '../components/feed/CreatePost';
import Post from '../components/feed/Post';
import '../styles/FeedPage.css'; // Importa o CSS

const FeedPage = ({ currentUser }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const canCreatePost = currentUser.role === 'admin' || currentUser.role === 'leader';

    // Busca inicial dos posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/posts`,
                    { withCredentials: true }
                );
                setPosts(response.data);
            } catch (err) {
                setError('Não foi possível carregar as publicações.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Adiciona um novo post no topo da lista (chamado pelo CreatePost)
    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    // Remove um post da lista (chamado pelo Post)
    const handlePostDeleted = (deletedPostId) => {
        setPosts(posts.filter(p => p.id !== deletedPostId));
    };

    if (loading) {
        return <div className="feed-container"><p>Carregando publicações...</p></div>;
    }

    if (error) {
        return <div className="feed-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="feed-container">
            {/* 1. Formulário de Criação (só para admin/leader) */}
            {canCreatePost && (
                <CreatePost onPostCreated={handlePostCreated} />
            )}

            {/* 2. Lista de Posts */}
            <div className="feed-post-list">
                {posts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#aaa' }}>
                        Nenhuma publicação ainda. Seja o primeiro!
                    </p>
                ) : (
                    posts.map(post => (
                        <Post 
                            key={post.id} 
                            postData={post} 
                            currentUser={currentUser}
                            onDeletePost={handlePostDeleted} // Passa a função de deletar
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedPage;