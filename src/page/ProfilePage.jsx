import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';
import '../styles/loader/Loader.jsx'; 
import SearchedUserProfile from '../components/search/SearchedUserProfile';

const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [originalProfile, setOriginalProfile] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('status');

    // States da Busca
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [selectedHabbyId, setSelectedHabbyId] = useState(null);
    const searchWrapperRef = useRef(null);
    
    const isOwner = currentUser?.habby_id === habby_id;

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`);
            setProfile(res.data);
            setOriginalProfile(res.data); // Guarda o estado original para o "Cancelar"
        } catch (err) {
            console.error("Erro ao buscar perfil:", err);
            setProfile(null);
            setOriginalProfile(null);
        } finally {
            setLoading(false);
        }
    }, [habby_id]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    useEffect(() => {
        if (activeTab === 'history' && habby_id && !history) { // Busca apenas se não tiver os dados
            axios.get(`${import.meta.env.VITE_API_URL}/history/${habby_id}`)
                .then(res => setHistory(res.data))
                .catch(err => console.error("Erro ao buscar histórico:", err));
        }
    }, [activeTab, habby_id, history]);

    // Lógica de busca com debounce
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const debounceTimer = setTimeout(() => {
            setIsSearchLoading(true);
            axios.get(`${import.meta.env.VITE_API_URL}/search-users?query=${searchQuery}`)
                .then(res => setSearchResults(res.data))
                .catch(() => setSearchResults([]))
                .finally(() => setIsSearchLoading(false));
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);
    
    // Fechar dropdown de busca ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handlers
    const handleResultClick = (id) => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedHabbyId(id); 
    };

    const closeSearchedProfile = () => {
        setSelectedHabbyId(null);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };
    
    const handleCancelEdit = () => {
        setProfile(originalProfile); // Restaura o perfil original
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/profile`, profile);
            setIsEditing(false);
            setOriginalProfile(profile); // Atualiza o "backup"
            alert('Perfil salvo com sucesso!');
        } catch (error) {
            alert(error.response?.data?.error || 'Falha ao salvar o perfil.');
            console.error(error);
        }
    };
    
    // Helper para renderizar campos, agora com suporte a casas decimais
    const renderField = (label, name, type = 'text', isDecimal = false) => (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                value={profile[name] || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="form-input"
                step={isDecimal ? "1" : "1"} // Permite decimais
            />
        </div>
    );
    
    if (loading) return <div className="loader">Carregando...</div>;

    return (
        <div className="profile-page-wrapper">
            {/* Seção de Busca */}
            <div className="profile-search-container">
                <h2>Buscar Outro Usuário</h2>
                <div className="search-wrapper" ref={searchWrapperRef}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por Nick ou Habby ID..."
                        className="search-input"
                        autoComplete="off"
                    />
                    {isSearchLoading && <div className="loader-small"></div>}
                    {searchResults.length > 0 && (
                        <div className="search-results-dropdown">
                            {searchResults.map(user => (
                                <div 
                                    key={user.habby_id} 
                                    className="search-result-item"
                                    onClick={() => handleResultClick(user.habby_id)}
                                >
                                    <p className="result-nick">{user.nick}</p>
                                    <p className="result-habby-id">{user.habby_id}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedHabbyId && (
                <SearchedUserProfile 
                    habbyId={selectedHabbyId} 
                    onClose={closeSearchedProfile} 
                />
            )}

            {/* Perfil Principal */}
            {!profile ? (
                <div className="profile-container error-message">Perfil não encontrado.</div>
            ) : (
                <>
                    <div className="profile-header">
                        <img src={profile.profile_pic_url || 'https://via.placeholder.com/150'} alt="Perfil" className="profile-picture" />
                        <div className="profile-titles">
                            <h1>{profile.nick || 'Nome não definido'}</h1>
                            <p>ID Habby: {profile.habby_id}</p>
                        </div>
                        {isOwner && (
                            <div className="profile-actions">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSave} className="btn btn-save">Salvar</button>
                                        <button onClick={handleCancelEdit} className="btn btn-cancel">Cancelar</button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="btn btn-edit">Editar Perfil</button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profile-tabs">
                        <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'active' : ''}>Status</button>
                        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>Histórico</button>
                    </div>

                    {activeTab === 'status' && (
                        <div className="profile-body">
                            <h3>Status do Sobrevivente</h3>
                            {/* Os campos numéricos com decimais no backend usam isDecimal=true */}
                            {renderField('ATQ Base', 'survivor_base_atk', 'number', false)}
                            {renderField('HP Base', 'survivor_base_hp', 'number', false)}
                            {renderField('Bônus ATQ', 'survivor_bonus_atk','number', true, label=" %")}
                            {renderField('Bônus HP', 'survivor_bonus_hp', 'number', true, label=" %")}
                            {renderField('ATQ Final', 'survivor_final_atk', 'number', false)}
                            {renderField('HP Final', 'survivor_final_hp', 'number', false)}
                            {renderField('Taxa Crit.', 'survivor_crit_rate', 'number', true, label=" %")}
                            {renderField('Dano Crit.', 'survivor_crit_damage', 'number', true, label=" %")}
                            {renderField('Dano de Habilidade', 'survivor_skill_damage', 'number', true, label=" %")}
                            {renderField('Boost Dano Escudo', 'survivor_shield_boost', 'number', true, label=" %")}
                            {renderField('Envenenamento', 'survivor_poison_targets', 'number', true, label=" %")}
                            {renderField('Enfraquecimento', 'survivor_weak_targets', 'number', true, label=" %")}
                            {renderField('Congelamento', 'survivor_frozen_targets', 'number', true, label=" %")}
                            {/* etc... */}
                        </div>                
                    )}
                    
                    {activeTab === 'history' && (
                        <div className="history-tab">
                            <h2>Histórico de Participação (Última Temporada)</h2>
                            {history && history.position ? (
                                <div className="history-card">
                                    <p><strong>Posição no Ranking de Acesso:</strong> {history.position}º</p>
                                    <p><strong>Pontuação (Fase de Acesso):</strong> {history.fase_acesso}</p>
                                    <p><strong>Evolução vs Temporada Anterior:</strong> {history.evolution}</p>
                                </div>
                            ) : (
                                <p>Nenhum histórico encontrado para este membro.</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;