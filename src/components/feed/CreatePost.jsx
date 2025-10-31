// src/components/feed/CreatePost.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';

const CreatePost = ({ onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) {
            setError('A URL da imagem é obrigatória.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/posts`,
                { image_url: imageUrl, caption },
                { withCredentials: true }
            );
            
            onPostCreated(response.data); // Passa o novo post para o componente pai
            
            // Limpa o formulário
            setCaption('');
            setImageUrl('');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao criar a publicação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-post-container">
            <h2>Nova Publicação</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="create-post-form">
                <input
                    type="text"
                    placeholder="URL da Imagem (obrigatório)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isSubmitting}
                />
                <textarea
                    placeholder="Escreva uma legenda..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={isSubmitting}
                />
                <button type="submit" className="btn-post" disabled={isSubmitting}>
                    <FaPaperPlane /> {isSubmitting ? 'Publicando...' : 'Publicar'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;