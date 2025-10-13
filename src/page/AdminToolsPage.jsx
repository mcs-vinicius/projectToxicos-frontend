import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackupRestore from '../components/admin/BackupRestore'; // Mantenha este import se você usa o componente

// --- ESTILOS ---
// Você pode manter estes estilos ou usar os seus próprios de um arquivo .css
const adminContainerStyle = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '2rem auto',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
};

const emergencyBoxStyle = {
    border: '2px solid #e74c3c',
    padding: '1.5rem',
    marginTop: '2rem',
    borderRadius: '8px',
    backgroundColor: '#343a40'
};

const buttonStyleBase = {
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
    marginTop: '10px'
};

// --- COMPONENTE ---

const AdminToolsPage = () => {
    const navigate = useNavigate();

    // Função genérica para chamar a API, evitando repetição de código
    const callResetApi = async (endpoint, confirmationMessage) => {
        const isConfirmed = window.confirm(confirmationMessage);

        if (isConfirmed) {
            try {
                // Pega a URL do backend do ambiente ou usa um valor padrão
                const backendUrl = import.meta.env.VITE_API_URL;
                if (!backendUrl) {
                    alert("Erro: A URL da API não está configurada. Verifique o arquivo .env do frontend.");
                    return;
                }
                
                const response = await axios.post(`${backendUrl}${endpoint}`, {}, {
                    withCredentials: true,
                });

                alert(response.data.message || 'Operação concluída com sucesso!');
            } catch (error) {
                console.error(`Erro ao chamar ${endpoint}:`, error);
                const errorMessage = error.response?.data?.error || 'Ocorreu um erro desconhecido.';
                alert(`Falha na operação: ${errorMessage}`);
            }
        }
    };

    // Função para corrigir a sequência da tabela 'participants' (Ranking)
    const handleResetSequence = () => {
        const message = "ATENÇÃO: Esta ação corrigirá o contador de IDs da tabela do RANKING. Use apenas se estiver enfrentando o erro de 'chave duplicada' ao criar temporadas. Deseja continuar?";
        callResetApi('/admin/reset-participant-sequence', message);
    };

    // Função para corrigir a sequência da tabela 'honor_participants' (Honra)
    const handleResetHonorSequence = () => {
        const message = "ATENÇÃO: Esta ação corrigirá o contador de IDs da tabela de HONRA. Use apenas se estiver enfrentando o erro de 'chave duplicada' ao gerenciar a lista de Honra. Deseja continuar?";
        callResetApi('/admin/reset-honor-participant-sequence', message);
    };

    return (
        <div style={adminContainerStyle}>
            <h1>Painel de Administração</h1>
            <p>Ferramentas disponíveis para gerenciamento do sistema.</p>
            
            {/* Componente de Backup e Restauração */}
            <BackupRestore />
            
            <hr style={{ margin: '2rem 0', borderColor: '#444' }} />

            {/* Seção de Ferramentas de Emergência */}
            <div style={emergencyBoxStyle}>
                <h2>Ferramentas de Emergência</h2>
                <p>
                    Use estes botões para resolver erros de "chave duplicada" (pkey) que ocorrem após uma restauração de backup. Cada botão corrige uma tabela específica.
                </p>
                
                {/* Botão para corrigir a tabela do Ranking */}
                <button 
                    onClick={handleResetSequence} 
                    style={{ ...buttonStyleBase, backgroundColor: '#e67e22' }}
                >
                    Corrigir IDs do Ranking
                </button>

                {/* Botão para corrigir a tabela de Honra */}
                <button 
                    onClick={handleResetHonorSequence} 
                    style={{ ...buttonStyleBase, backgroundColor: '#9b59b6' }}
                >
                    Corrigir IDs da Honra
                </button>
            </div>
            
            <button 
                onClick={() => navigate('/manage-users')} 
                style={{ ...buttonStyleBase, backgroundColor: '#3498db', marginTop: '20px' }}
            >
                Gerenciar Usuários
            </button>
        </div>
    );
};

export default AdminToolsPage;
