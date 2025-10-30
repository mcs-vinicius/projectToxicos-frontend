import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';

// --- ASSUMINDO QUE VOCÊ ADICIONARÁ OS ÍCONES NESTA PASTA ---
// (Você precisa adicionar essas imagens no projeto)
import nucleoRelicIcon from '../assets/icons/nucleo-relic.png';
import chipRessoIcon from '../assets/icons/chip-resso.png';
import nucleoDespertarIcon from '../assets/icons/nucleo-despertar.png';
import nucleoXenoIcon from '../assets/icons/nucleo-xeno.png';


// --- Funções copiadas de ResultsPage.jsx para exibir o Tier ---

// Helper para construir o URL da imagem dinamicamente
const getTierImageUrl = (emblem) => {
  const validEmblem = String(emblem || '1');
  try {
    // Caminho relativo ajustado para /page/
    return new URL(`../assets/tier/${validEmblem}.png`, import.meta.url).href;
  } catch (error) {
    console.error(`Erro ao criar URL para emblema: ${validEmblem}`, error);
    return new URL(`../assets/tier/1.png`, import.meta.url).href;
  }
};

// Função para obter o Tier com base na fase
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
    return { name: "Coimbra", emblem: "1" }; // Padrão
};

// --- Fim das funções de Tier ---


const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isHonorMember, setIsHonorMember] = useState(false);
    const [history, setHistory] = useState(null);

    // --- CORRIGIDO COM useCallback ---
    const fetchProfileData = useCallback(async () => {
        if (!habby_id) return;
        setLoading(true);
        try {
            const [profileRes, honorRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/history/${habby_id}`)
            ]);
            
            setProfile(profileRes.data);
            setFormData(profileRes.data);
            setIsHonorMember(honorRes.data.is_honor_member);
            setHistory(historyRes.data);

        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
        } finally {
            setLoading(false);
        }
    }, [habby_id]); // <-- Dependência do useCallback
    
    // --- CORRIGIDO COM useCallback ---
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]); // <-- Dependência do useEffect

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
    
    // Calcula o Tier atual
    const currentTier = history && history.fase_acesso != null ? getTier(history.fase_acesso) : null;

    // Helper para campos de lista (li)
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

    // Helper para os novos campos de inventário (com ícones)
    // *** REMOVIDA A CLASSE "history-item" ***
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
                // *** MODIFICADO para <p> para consistência ***
                <p>{formatStat(profile[name])}</p> 
            )}
        </div>
    );


    return (
        <div className={containerClassName}>
            <div className="profile-main-info">
                <div className="profile-pic-wrapper">
                    <img src={isEditing ? formData.profile_pic_url : profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                </div>
                <div className="profile-details">
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
                        <>
                            <h1>{profile.nick || 'Nome não definido'}</h1>
                        </>
                    )}
                    <p>Habby ID: {profile.habby_id}</p>
                    
                    {/* --- CORREÇÃO APLICADA AQUI --- */}
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
                    {/* --- FIM DA CORREÇÃO --- */}
                    
                    {/* --- SEÇÃO DO TIER (MOVIDA PARA DIV PRÓPRIA) --- */}
                    {currentTier && (
                        <div className="profile-tier-container">
                            <img src={getTierImageUrl(currentTier.emblem)} alt={currentTier.name} className="tier-emblem-profile" />
                            <div className="tier-details">
                                <h4>Tier Atual</h4>
                                <p>{currentTier.name}</p>
                            </div>
                        </div>
                    )}

                    {/* --- HISTÓRICO (Mantido) --- */}
                    {history && history.position != null ? (
                        <div className="profile-history">
                            <div className="history-item">
                                <h4>Última Posição</h4>
                                <p>{history.position}º</p>
                            </div>
                            <div className="history-item">
                                <h4>Última Fase</h4>
                                <p>{history.fase_acesso}</p>
                            </div>
                            <div className="history-item">
                                <h4>Evolução</h4>
                                <p className={history.evolution > 0 ? 'positive' : history.evolution < 0 ? 'negative' : ''}>
                                    {history.evolution > 0 ? `+${history.evolution}` : (history.evolution === 0 ? '–' : history.evolution)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-history-empty">
                            <p>Sem dados de histórico de ranking para exibir.</p>
                        </div>
                    )}

                    {/* --- NOVO GRUPO DE INVENTÁRIO (MOVIDO PARA DIV PRÓPRIA) --- */}
                    <div className="profile-inventory-container">
                        {renderInventoryItem("Núcleo de Relíquia", "relic_core", nucleoRelicIcon)}
                        {renderInventoryItem("Chip de Ressonância", "resonance_chip", chipRessoIcon)}
                        {renderInventoryItem("Núcleo de Despertar", "survivor_awakening_core", nucleoDespertarIcon)}
                        {renderInventoryItem("Núcleo de Bichinho Xeno", "xeno_pet_core", nucleoXenoIcon)}
                    </div>

                </div>
            </div>

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
                        {/* --- MOVIDO E RENOMEADO --- */}
                        {renderField("Dano de Escudo", "survivor_shield_boost", formatPercent)}
                    </ul>
                </div>
                 <div className="stats-group">
                    <h3>Bônus Especiais (Sobrevivente)</h3>
                     <ul>
                        {/* --- REMOVIDO: Reforço de Escudo --- */}
                        {renderField("Alvos Envenenados", "survivor_poison_targets", formatPercent)}
                        {renderField("Alvos Enfraquecidos", "survivor_weak_targets", formatPercent)}
                        {renderField("Alvos Congelados", "survivor_frozen_targets", formatPercent)}
                        {/* --- ADICIONADO --- */}
                        {renderField("Alvos Dilacerados", "survivor_torn_targets", formatPercent)}
                    </ul>
                </div>
            </div>
            
            {/* --- BLOCO DE INVENTÁRIO ORIGINAL REMOVIDO DESTA POSIÇÃO --- */}


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