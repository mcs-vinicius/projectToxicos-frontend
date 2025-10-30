import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../styles/SearchedUserProfile.css';

// --- ADICIONE OS IMPORTS DOS ÍCONES ---
import nucleoRelicIcon from '../../assets/icons/nucleo-relic.png';
import chipRessoIcon from '../../assets/icons/chip-resso.png';
import nucleoDespertarIcon from '../../assets/icons/nucleo-despertar.png';
import nucleoXenoIcon from '../../assets/icons/nucleo-xeno.png';

// --- Funções copiadas de ResultsPage.jsx para exibir o Tier ---

// Helper para construir o URL da imagem dinamicamente
const getTierImageUrl = (emblem) => {
  const validEmblem = String(emblem || '1');
  try {
    // Caminho relativo ajustado para /components/search/
    return new URL(`../../assets/tier/${validEmblem}.png`, import.meta.url).href;
  } catch (error) {
    console.error(`Erro ao criar URL para emblema: ${validEmblem}`, error);
    return new URL(`../../assets/tier/1.png`, import.meta.url).href;
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


const SearchedUserProfile = ({ habbyId, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHonorMember, setIsHonorMember] = useState(false);
    const [history, setHistory] = useState(null);

    // --- CORRIGIDO COM useCallback ---
    const fetchProfileData = useCallback(async () => {
        if (!habbyId) return;
        setLoading(true);
        try {
            // Busca todos os dados em paralelo, incluindo o histórico
            const [profileRes, honorRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/profile/${habbyId}`),
                axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habbyId}`),
                axios.get(`${import.meta.env.VITE_API_URL}/history/${habbyId}`)
            ]);
            
            setProfile(profileRes.data);
            setIsHonorMember(honorRes.data.is_honor_member);
            setHistory(historyRes.data); // Salva os dados do histórico

        } catch (error) {
            console.error("Erro ao buscar perfil pesquisado:", error);
        } finally {
            setLoading(false);
        }
    }, [habbyId]); // <-- Dependência do useCallback

    // --- CORRIGIDO COM useCallback ---
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]); // <-- Dependência do useEffect

    const formatStat = (value) => parseInt(value, 10) || 0;
    const formatPercent = (value) => `${parseInt(value, 10) || 0}%`;

    const modalClassName = `searched-user-profile-modal ${isHonorMember ? 'gloria-profile' : ''}`;

    // Calcula o Tier atual
    const currentTier = history && history.fase_acesso != null ? getTier(history.fase_acesso) : null;

    // Helper (view only)
    const renderField = (label, name, formatter = formatStat) => (
        <li>
            {label}:
            <span>{formatter(profile[name])}</span>
        </li>
    );

    // Helper de inventário (view only)
    const renderInventoryItem = (label, name, iconSrc) => (
        <div className="inventory-item" title={label}>
            <img src={iconSrc} alt={label} className="inventory-icon" />
            <p>{formatStat(profile[name])}</p>
        </div>
    );


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={modalClassName} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                {loading ? (
                    <p>Carregando perfil...</p>
                ) : profile ? (
                    <div className="modal-scroll-content">
                        <div className="profile-main-info">
                            <div className="profile-pic-wrapper">
                                <img src={profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                                <h1>{profile.nick || 'N/A'}</h1>
                                <p>Habby ID: {profile.habby_id}</p>
                                <div className="main-stats">
                                    <div className="stat-item">ATK: <span>{formatStat(profile.atk)}</span></div>
                                    <div className="stat-item">HP: <span>{formatStat(profile.hp)}</span></div>
                                </div>
                            </div>
                            <div className="profile-details">
                                
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
                                
                                {/* SEÇÃO DE HISTÓRICO ADICIONADA AO MODAL */}
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
                                        <p>Sem dados de histórico de ranking.</p>
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

                        {/* O restante dos atributos continua aqui */}
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
                        </div>
                        
                        <div className="stats-section">
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
                    </div>
                ) : (
                    <p>Não foi possível carregar o perfil.</p>
                )}
            </div>
        </div>
    );
};

export default SearchedUserProfile;