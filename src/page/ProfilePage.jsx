// src/page/ProfilePage.jsx
// --- ARQUIVO ATUALIZADO ---

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';

// --- ÍCONES ---
import nucleoRelicIcon from '../assets/icons/nucleo-relic.png';
import chipRessoIcon from '../assets/icons/chip-resso.png';
import nucleoDespertarIcon from '../assets/icons/nucleo-despertar.png';
import nucleoXenoIcon from '../assets/icons/nucleo-xeno.png';


// --- Funções de Tier (copiadas) ---
const getTierImageUrl = (emblem) => {
  const validEmblem = String(emblem || '1');
  try {
    return new URL(`../assets/tier/${validEmblem}.png`, import.meta.url).href;
  } catch (error) {
    console.error(`Erro ao criar URL para emblema: ${validEmblem}`, error);
    return new URL(`../assets/tier/1.png`, import.meta.url).href;
  }
};
const getTier = (fase) => {
    if (fase >= 0 && fase <= 500) return { name: "Coimbra", emblem: "1" };
    if (fase >= 501 && fase <= 530) return { name: "Petista", emblem: "2" };
    if (fase >= 531 && fase <= 550) return { name: "Descartavel", emblem: "3" };
    if (fase >= 551 && fase <= 575) return { name: "Deprimente", emblem: "4" };
    if (fase >= 576 && fase <= 599) return { name: "Vascaino", emblem: "5" };
    if (fase >= 600 && fase <= 625) return { name: "Inutil", emblem: "6" };
    if (fase >= 626 && fase <= 650) return { name: "Fraco", emblem: "7" };
    if (fase >= 651 && fase <= 670) return { name: "Meia Boca", emblem: "8" };
    if (fase >= 671 && fase <= 699) return { name: "Razoavel", emblem: "9" };
    if (fase >= 700 && fase <= 750) return { name: "Bom", emblem: "10" };
    if (fase >= 751 && fase <= 800) return { name: "Elite", emblem: "11" };
    if (fase >= 801 && fase <= 899) return { name: "Burguês Safado", emblem: "12" };
    if (fase >= 900 && fase <= 999) return { name: "Aristocrata", emblem: "13" };
    if (fase >= 1000 && fase <= 1500) return { name: "Nobreza", emblem: "14" };
    if (fase > 1500) return { name: "Baleia", emblem: "15" };
    return { name: "Coimbra", emblem: "1" };
};
// --- Fim das funções de Tier ---


const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isHonorMember, setIsHonorMember] = useState(false);
    
    // --- MODIFICAÇÃO (Unificado state de histórico) ---
    const [fullHistory, setFullHistory] = useState([]);
    // O state 'history' foi removido
    // --- FIM DA MODIFICAÇÃO ---

    const fetchProfileData = useCallback(async () => {
        if (!habby_id) return;
        setLoading(true);
        try {
            // --- MODIFICAÇÃO (Removida chamada /history) ---
            const [profileRes, honorRes, fullHistoryRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/full-history/${habby_id}`) // Rota única
            ]);
            // --- FIM DA MODIFICAÇÃO ---
            
            setProfile(profileRes.data);
            setFormData(profileRes.data);
            setIsHonorMember(honorRes.data.is_honor_member);
            
            // --- MODIFICAÇÃO (Setar novo state) ---
            setFullHistory(fullHistoryRes.data);
            // --- FIM DA MODIFICAÇÃO ---

        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
        } finally {
            setLoading(false);
        }
    }, [habby_id]); 
    
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]); 

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setIsEditing(false);
        setFormData(profile);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSave = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/profile`, formData);
            setProfile(formData);
            setIsEditing(false);
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            alert(`Erro ao salvar: ${error.response?.data?.error || 'Tente novamente.'}`);
        }
    };

    const formatStat = (value) => parseInt(value, 10) || 0;
    const formatPercent = (value) => `${parseInt(value, 10) || 0}%`;

    if (loading) {
        return <div className="profile-container"><p>Carregando perfil...</p></div>;
    }

    if (!profile) {
        return <div className="profile-container"><p>Perfil não encontrado.</p></div>;
    }

    const containerClassName = `profile-container ${isHonorMember ? 'gloria-profile' : ''}`;
    
    // --- MODIFICAÇÃO (Derivado do fullHistory) ---
    // Pega o item mais recente do histórico (ou null)
    const latestHistory = fullHistory.length > 0 ? fullHistory[0] : null;
    const currentTier = latestHistory && latestHistory.fase_acesso != null ? getTier(latestHistory.fase_acesso) : null;
    // --- FIM DA MODIFICAÇÃO ---

    const renderField = (label, name, formatter = formatStat, type = 'number') => (
        <li>
            {label}:
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />
            ) : (
                <span>{formatter(profile[name])}</span>
            )}
        </li>
    );

    const renderInventoryItem = (label, name, iconSrc) => (
        <div className="inventory-item" title={label}>
            <img src={iconSrc} alt={label} className="inventory-icon" />
            {isEditing ? (
                <input
                    type="number"
                    name={name}
                    value={formData[name] || 0}
                    onChange={handleChange}
                    className="inventory-input"
                />
            ) : (
                <p>{formatStat(profile[name])}</p> 
            )}
        </div>
    );
    
    const renderEvolutionText = (evolution) => {
        if (evolution === '-') {
            return <p className="neutral">{evolution}</p>;
        }
        const isNumeric = typeof evolution === "number";
        if (isNumeric && evolution > 0) {
            return <p className="positive">▲ +{evolution}</p>;
        }
        if (isNumeric && evolution < 0) {
            return <p className="negative">▼ {evolution}</p>;
        }
        return <p className="neutral">–</p>; // Para evolução 0 ou n/a
    };


    return (
        <div className={containerClassName}>
            <div className="profile-main-info">
                <div className="profile-pic-wrapper">
                    <img src={isEditing ? formData.profile_pic_url : profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                name="nick"
                                className="nick-edit-input"
                                value={formData.nick || ''}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="profile_pic_url"
                                className="pic-url-edit-input"
                                value={formData.profile_pic_url || ''}
                                onChange={handleChange}
                                placeholder="URL da nova imagem de perfil"
                            />
                        </>
                    ) : (
                        <h1>{profile.nick || 'Nome não definido'}</h1>
                    )}
                    <p>Habby ID: {profile.habby_id}</p>
                </div>
                
                <div className="profile-details">
                    {currentTier && (
                        <div className="profile-tier-container">
                            <img src={getTierImageUrl(currentTier.emblem)} alt={currentTier.name} className="tier-emblem-profile" />
                            <div className="tier-details">
                                <h4>Tier Atual</h4>
                                <p>{currentTier.name}</p>
                            </div>
                        </div>
                    )}

                    {/* --- MODIFICAÇÃO (Usa 'latestHistory') --- */}
                    {latestHistory && latestHistory.position != null ? (
                        <div className="profile-history">
                            <div className="history-item">
                                <h4>Última Posição</h4>
                                <p>{latestHistory.position}º</p>
                            </div>
                            <div className="history-item">
                                <h4>Última Fase</h4>
                                <p>{latestHistory.fase_acesso}</p>
                            </div>
                            <div className="history-item">
                                <h4>Evolução</h4>
                                {renderEvolutionText(latestHistory.evolution)}
                            </div>
                        </div>
                    ) : (
                        <div className="profile-history-empty">
                            <p>Sem dados de histórico de ranking para exibir.</p>
                        </div>
                    )}
                    {/* --- FIM DA MODIFICAÇÃO --- */}

                    {/* --- MODIFICAÇÃO (Título "Núcleos" movido para dentro) --- */}
                    <div className="profile-inventory-container">
                        <h3 className="section-title-group-internal">Núcleos</h3>
                        {renderInventoryItem("Núcleo de Relíquia", "relic_core", nucleoRelicIcon)}
                        {renderInventoryItem("Chip de Ressonância", "resonance_chip", chipRessoIcon)}
                        {renderInventoryItem("Núcleo de Despertar", "survivor_awakening_core", nucleoDespertarIcon)}
                        {renderInventoryItem("Núcleo de Bichinho Xeno", "xeno_pet_core", nucleoXenoIcon)}
                    </div>
                    {/* --- FIM DA MODIFICAÇÃO --- */}
                </div>
            </div>

            {/* --- MODIFICAÇÃO (Adicionado Título "Stats") --- */}
            <h3 className="section-title-header">Stats do Sobrevivente</h3>

            <div className="main-stats">
                 <div className="stat-item">ATK: 
                    {isEditing ? (
                        <input
                            type="number"
                            name="atk"
                            value={formData.atk || ''}
                            onChange={handleChange}
                            className="stat-input" 
                        />
                    ) : (
                        <span>{formatStat(profile.atk)}</span>
                    )}
                </div>
                <div className="stat-item">HP: 
                    {isEditing ? (
                        <input
                            type="number"
                            name="hp"
                            value={formData.hp || ''}
                            onChange={handleChange}
                            className="stat-input"
                        />
                    ) : (
                        <span>{formatStat(profile.hp)}</span>
                    )}
                </div>
            </div>

            {/* --- FIM DA MODIFICAÇÃO --- */}
            <div className="stats-section">
                <div className="stats-group">
                    <h3>Atributos do Sobrevivente</h3>
                    <ul>
                        {renderField("ATK Base", "survivor_base_atk")}
                        {renderField("HP Base", "survivor_base_hp")}
                        {renderField("Bônus ATK", "survivor_bonus_atk", formatPercent)}
                        {renderField("Bônus HP", "survivor_bonus_hp", formatPercent)}
                        {renderField("ATK Final", "survivor_final_atk")}
                        {renderField("HP Final", "survivor_final_hp")}
                    </ul>
                </div>
                <div className="stats-group">
                    <h3>Bônus de Dano (Sobrevivente)</h3>
                     <ul>
                        {renderField("Taxa Crítica", "survivor_crit_rate", formatPercent)}
                        {renderField("Dano Crítico", "survivor_crit_damage", formatPercent)}
                        {renderField("Dano de Habilidade", "survivor_skill_damage", formatPercent)}
                        {renderField("Dano de Escudo", "survivor_shield_boost", formatPercent)}
                    </ul>
                </div>
                 <div className="stats-group">
                    <h3>Bônus Especiais (Sobrevivente)</h3>
                     <ul>
                        {renderField("Alvos Envenenados", "survivor_poison_targets", formatPercent)}
                        {renderField("Alvos Enfraquecidos", "survivor_weak_targets", formatPercent)}
                        {renderField("Alvos Congelados", "survivor_frozen_targets", formatPercent)}
                        {renderField("Alvos Dilacerados", "survivor_torn_targets", formatPercent)}
                    </ul>
                </div>
            </div>
            
            {/* --- MODIFICAÇÃO (Usa fullHistory para corrigir bug) --- */}
            <div className="lme-history-section">
                <h3 className="section-title-header">Histórico LME</h3>
                <div className="lme-history-grid">
                    {fullHistory.length > 0 ? (
                        fullHistory.slice(0, 3).map((item, index) => (
                            <div className="lme-history-card" key={index}>
                                <div className="lme-history-header">
                                    {item.season_info_str}
                                </div>
                                <div className="lme-history-body">
                                    <div className="history-item">
                                        <h4>Posição</h4>
                                        <p>{item.position ? `${item.position}º` : 'N/A'}</p>
                                    </div>
                                    <div className="history-item">
                                        <h4>Fase</h4>
                                        <p>{item.fase_acesso}</p>
                                    </div>
                                    <div className="history-item">
                                        <h4>Evolução</h4>
                                        {renderEvolutionText(item.evolution)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="lme-history-empty">Sem histórico de temporadas anteriores para exibir.</p>
                    )}
                </div>
            </div>
            {/* --- FIM DA MODIFICAÇÃO --- */}

            {currentUser && currentUser.habby_id === habby_id && (
                <div className="profile-edit-cta">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
                            <button onClick={handleSave} className="btn-save">Salvar</button>
                        </>
                    ) : (
                        <button onClick={handleEdit}>Editar Perfil</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;