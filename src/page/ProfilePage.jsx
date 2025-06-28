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
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

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
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`, { withCredentials: true } );
            setProfile(res.data);
            setOriginalProfile(res.data);
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
        if (activeTab === 'history' && habby_id) {
            setIsHistoryLoading(true);
            axios.get(`${import.meta.env.VITE_API_URL}/history/${habby_id}`)
                .then(res => {
                    console.log("Dados do histórico recebidos:", res.data);
                    setHistory(res.data);
                })
                .catch(err => {
                    console.error("Erro ao buscar histórico:", err);
                    setHistory(null);
                })
                .finally(() => {
                    setIsHistoryLoading(false);
                });
        }
    }, [activeTab, habby_id]);

    // Lógica de busca com debounce
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const debounceTimer = setTimeout(() => {
            setIsSearchLoading(true);
            axios.get(`${import.meta.env.VITE_API_URL}/search-users?query=${searchQuery}` )
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
        setProfile(originalProfile);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/profile`, profile,{ withCredentials: true } );
            setIsEditing(false);
            setOriginalProfile(profile);
            alert('Perfil salvo com sucesso!');
        } catch (error) {
            alert(error.response?.data?.error || 'Falha ao salvar o perfil.');
            console.error(error);
        }
    };
    
    // Helper para renderizar campos, com distinção entre texto, número e porcentagens
    const renderField = (label, name, type = 'number', isPercentage = false) => {
        const rawValue = profile[name];

        const getIntValue = (value) => {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : Math.round(parsed);
        };

        if (isEditing) {
            return (
                <div className="form-group">
                    <label>{label}</label>
                    <input
                        type={type}
                        name={name}
                        value={type === 'text' ? (rawValue || '') : (rawValue != null ? getIntValue(rawValue) : '')}
                        onChange={handleInputChange}
                        className="form-input"
                        step={type === 'number' ? "1" : undefined}
                    />
                </div>
            );
        } else {
            let displayValue;
            if (
