// src/components/admin/HabbyManagement.jsx
import React, { useState, useEffect, useCallback } from 'react'; // --- MODIFICAÇÃO: Importar useCallback ---
import axios from 'axios';
import { FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';

// Reutiliza o hook de mensagens da UserManagementPage (opcional, mas limpo)
const useMessages = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const showError = (msg) => {
        setError(msg);
        setTimeout(() => setError(''), 4000);
    };
    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };
    return { error, success, showError, showSuccess };
};

const HabbyManagement = () => {
    const [habbys, setHabbys] = useState([]);
    const [newHabbyId, setNewHabbyId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { error, success, showError, showSuccess } = useMessages();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- MODIFICAÇÃO: Envolver a função em useCallback ---
    const fetchHabbys = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/pre-approved-habbys`, { withCredentials: true });
            setHabbys(response.data);
        } catch (err) {
            showError('Falha ao carregar IDs liberados.');
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, showError]); // Adicionar dependências do useCallback

    useEffect(() => {
        fetchHabbys();
    }, [fetchHabbys]); // --- MODIFICAÇÃO: Adicionar fetchHabbys à lista de dependências ---

    const handleAddHabby = async (e) => {
        e.preventDefault();
        if (!newHabbyId.trim()) {
            showError('O Habby ID não pode estar vazio.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_URL}/pre-approved-habbys`,
                { habby_id: newHabbyId.trim() },
                { withCredentials: true }
            );
            setHabbys([...habbys, response.data.habby]);
            setNewHabbyId('');
            showSuccess(response.data.message);
        } catch (err) {
            showError(err.response?.data?.error || 'Erro ao adicionar ID.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteHabby = async (id) => {
        if (!window.confirm("Tem certeza que deseja remover esta liberação? O ID não poderá ser usado para cadastro.")) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/pre-approved-habbys/${id}`, { withCredentials: true });
            setHabbys(habbys.filter(h => h.id !== id));
            showSuccess('Liberação removida com sucesso.');
        } catch (err) {
            showError(err.response?.data?.error || 'Erro ao remover ID.');
        }
    };

    return (
        <div className="habby-management-wrapper">
            <h2>Liberar Habby ID para Cadastro</h2>
            <p>IDs adicionados aqui poderão ser usados por novos usuários para se registrarem no site. O ID é consumido após o uso.</p>
            
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleAddHabby} className="habby-add-form">
                <input
                    type="text"
                    value={newHabbyId}
                    onChange={(e) => setNewHabbyId(e.target.value)}
                    placeholder="Digite o Habby ID"
                    className="habby-input"
                    disabled={isSubmitting}
                />
                <button type="submit" className="habby-button-add" disabled={isSubmitting}>
                    {isSubmitting ? <FaSpinner className="spin" /> : <FaPlus />}
                    Liberar ID
                </button>
            </form>

            <h3>IDs Liberados Atualmente</h3>
            {isLoading ? (
                <p>Carregando IDs...</p>
            ) : (
                <div className="habby-list-container">
                    {habbys.length === 0 ? (
                        <p>Nenhum Habby ID liberado no momento.</p>
                    ) : (
                        <ul className="habby-list">
                            {habbys.map(habby => (
                                <li key={habby.id}>
                                    <span>{habby.habby_id}</span>
                                    <button
                                        onClick={() => handleDeleteHabby(habby.id)}
                                        className="habby-button-delete"
                                        title="Remover liberação"
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default HabbyManagement;