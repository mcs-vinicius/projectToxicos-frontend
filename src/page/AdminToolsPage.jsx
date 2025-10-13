// Em: src/page/AdminToolsPage.jsx

import React from 'react';
import axios from 'axios';
import BackupRestore from '../components/admin/BackupRestore'; // Supondo que você tenha este componente
import { useNavigate } from 'react-router-dom';

// Estilos básicos para o container
const adminContainerStyle = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '2rem auto',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    color: 'white',
};

const AdminToolsPage = () => {
    const navigate = useNavigate();

    // Função que chama a rota de correção no backend
    const handleResetSequence = async () => {
        const isConfirmed = window.confirm(
            "ATENÇÃO: Esta ação corrigirá o contador de IDs da tabela 'participants' no banco de dados. Use apenas se estiver enfrentando o erro de 'chave duplicada' ao criar temporadas. Deseja continuar?"
        );

        if (isConfirmed) {
            try {
                // Certifique-se que a URL da sua API está correta
                const backendUrl = import.meta.env.VITE_API_URL || 'https://seu-backend-url.onrender.com';
                
                // Faz a chamada POST para a rota, enviando as credenciais (cookies de sessão)
                const response = await axios.post(`${backendUrl}/admin/reset-participant-sequence`, {}, {
                    withCredentials: true,
                });

                alert(response.data.message || 'Sequência de IDs corrigida com sucesso!');
            } catch (error) {
                console.error('Erro ao resetar a sequência:', error);
                const errorMessage = error.response?.data?.error || 'Ocorreu um erro desconhecido.';
                alert(`Falha ao resetar a sequência: ${errorMessage}`);
            }
        }
    };

    return (
        <div style={adminContainerStyle}>
            <h1>Painel de Administração</h1>
            <p>Ferramentas disponíveis para gerenciamento do sistema.</p>
            
            {/* Componente de Backup/Restore que você já deve ter */}
            <BackupRestore />
            
            <hr style={{ margin: '2rem 0' }} />

            {/* Seção de Ferramentas de Emergência */}
            <div style={{ border: '2px solid #e74c3c', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#343a40' }}>
                <h2>Ferramentas de Emergência</h2>
                <p>
                    Use o botão abaixo para resolver o erro de "chave duplicada" (participants_pkey) que ocorre ao tentar criar uma nova temporada após uma restauração ou importação de dados.
                </p>
                <button 
                    onClick={handleResetSequence} 
                    style={{ 
                        backgroundColor: '#e67e22', 
                        color: 'white', 
                        padding: '10px 20px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Corrigir Contador de ID dos Participantes
                </button>
            </div>
            
            <button onClick={() => navigate('/manage-users')} style={{marginTop: '20px'}}>
                Gerenciar Usuários
            </button>
        </div>
    );
};

export default AdminToolsPage;
