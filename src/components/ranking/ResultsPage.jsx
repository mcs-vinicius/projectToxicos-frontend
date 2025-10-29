import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/ResultsPage.css";
import { FaTrash } from "react-icons/fa"; // Importando o ícone

// Helper para construir o URL da imagem dinamicamente, compatível com o Vite
const getTierImageUrl = (emblem) => {
  // Garante que emblem seja uma string válida para URL
  const validEmblem = String(emblem || '1'); // Usa '1' como fallback
  try {
    return new URL(`../../assets/tier/${validEmblem}.png`, import.meta.url).href;
  } catch (error) {
    console.error(`Erro ao criar URL para emblema: ${validEmblem}`, error);
    // Retorna um fallback ou imagem de erro se necessário
    return new URL(`../../assets/tier/1.png`, import.meta.url).href;
  }
};

const ResultsPage = ({ currentUser }) => {
  const [seasons, setSeasons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // Adicionado estado de loading

  async function fetchSeasons() {
    setLoading(true); // Inicia o loading
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/seasons`
      );
      const data = response.data;
      // Ordena as temporadas pela data de início (ou ID, se preferir)
      const sortedData = data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      setSeasons(sortedData);

      if (sortedData.length > 0) {
        // Define a página atual como a última temporada
        setCurrentPage(sortedData.length);
      }
    } catch (error) {
      console.error("Erro ao buscar temporadas:", error);
    } finally {
        setLoading(false); // Finaliza o loading
    }
  }

  useEffect(() => {
    fetchSeasons();
  }, []);

  // Lógica para deletar a temporada
  const handleDeleteSeason = async (seasonId) => {
    // A confirmação agora usa o número correto da temporada
    if (
      window.confirm(
        `Tem certeza que deseja excluir a Temporada ${currentPage}? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/seasons/${seasonId}`
        );
        alert("Temporada excluída com sucesso!");
        // Re-busca os dados para atualizar a lista
        fetchSeasons();
      } catch (error) {
        console.error("Erro ao excluir temporada:", error);
        alert(
          error.response?.data?.error || "Não foi possível excluir a temporada."
        );
      }
    }
  };

  const totalPages = seasons.length;
  // Acessa a temporada correta com base no currentPage (ajustado para índice 0)
  const season = seasons[currentPage - 1];

  // Função getRankingData permanece a mesma
  const getRankingData = (participants) => {
    const sortedByFase = [...participants].sort((a, b) => b.fase - a.fase);
    const top30Fase = sortedByFase.slice(0, 30);
    const remainingFase = sortedByFase.slice(30);
    const sumFase = top30Fase.reduce((acc, p) => acc + p.fase, 0);

    const sortedByTotal = [...participants]
      .map((p) => ({ ...p, total: p.r1 + p.r2 + p.r3 }))
      .sort((a, b) => b.total - a.total);
    const top30Total = sortedByTotal.slice(0, 30);
    const remainingTotal = sortedByTotal.slice(30);
    const sumTotal = top30Total.reduce((acc, p) => acc + p.total, 0);

    return {
      top30Fase,
      remainingFase,
      sumFase,
      top30Total,
      remainingTotal,
      sumTotal,
    };
  };

  // Calcula os dados de ranking apenas se a temporada existir
  const rankingData = season ? getRankingData(season.participants) : null;

  // Função calculateEvolution permanece a mesma
  const calculateEvolution = (participantName, currentSeasonIndex) => {
    if (currentSeasonIndex < 0 || seasons.length <= 1) { // Checa se índice é válido
        return "-";
    }

    const currentSeason = seasons[currentSeasonIndex];
    // Garante que a temporada anterior exista
    const previousSeason = currentSeasonIndex > 0 ? seasons[currentSeasonIndex - 1] : null;

    if (!currentSeason || !previousSeason) return "-";

    const currentParticipant = currentSeason.participants.find(
      (p) => p.name === participantName
    );
    const previousParticipant = previousSeason.participants.find(
      (p) => p.name === participantName
    );

    if (currentParticipant && previousParticipant) {
      const evolution = currentParticipant.fase - previousParticipant.fase;
      return evolution; // Retorna o número diretamente
    }
    return "-"; // Retorna "-" se não encontrar em ambas as temporadas
  };


  const formatDateBR = (dateString) => {
    if (!dateString) return "Data não definida";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC", // Importante para evitar problemas de fuso horário
    };
    try {
        const date = new Date(dateString);
        // Adiciona um dia para corrigir potencial problema de fuso no backend/DB
        // date.setUTCDate(date.getUTCDate() + 1);
        return date.toLocaleDateString("pt-BR", options);
    } catch (e) {
        console.error("Erro ao formatar data:", dateString, e);
        return "Data inválida";
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
    if (fase > 1500) return { name: "Baleia", emblem: "15" }; // Corrigido para > 1500
    return { name: "Coimbra", emblem: "1" }; // Retorna Coimbra como padrão
  };

   const renderEvolution = (participantName, currentSeasonIndex) => { // Pass index
    const evolution = calculateEvolution(participantName, currentSeasonIndex); // Use index
    const isNumeric = typeof evolution === "number";
    let evolutionClass = "evolution-neutral";
    if (isNumeric) {
      if (evolution > 0) evolutionClass = "evolution-positive";
      if (evolution < 0) evolutionClass = "evolution-negative";
    }
    // Mostra '–' para evolução zero
    const evolutionText = isNumeric && evolution > 0 ? `+${evolution}` : (isNumeric && evolution === 0 ? '–' : evolution);

    // Retorna o TD completo com data-label
    return <td data-label="Evolução" className={evolutionClass}>{evolutionText}</td>;
  };


  // Verifica o estado de loading antes de tentar renderizar
  if (loading) {
      return <div className="container"><p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--glow-green)' }}>Carregando dados das temporadas...</p></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Expedição Lunar</h1>
      {/* Verifica se existe season E rankingData antes de renderizar */}
      {season && rankingData ? (
        <>
          <div className="season-info-container">
             <div className="season-info">
              {/* Usa currentPage para mostrar o número correto da temporada */}
              Temporada {currentPage} - {formatDateBR(season.start_date)} até{" "}
              {formatDateBR(season.end_date)}
            </div>
            {currentUser?.role === "admin" && (
              <button
                className="btn-delete-season"
                onClick={() => handleDeleteSeason(season.id)}
                title="Excluir esta Temporada"
              >
                <FaTrash /> Excluir Temporada
              </button>
            )}
          </div>

          <div className="tables-container">
            {/* Tabela Rank de Acesso */}
            <div className="table-wrapper">
              <div className="table-title">Rank de Acesso</div>
              <table>
                <thead>
                  <tr>
                    {/* Adicionado data-label aos TH */}
                    <th data-label="Posição">Posição</th>
                    <th data-label="Nome">Nome</th>
                    <th data-label="Tier">Tier</th>
                    <th data-label="Fase de Acesso">Fase</th>
                    <th data-label="Evolução">Evolução</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Combina top 30 e restante para mapear uma vez */}
                  {[...rankingData.top30Fase, ...rankingData.remainingFase].map((p, i) => {
                    const tier = getTier(p.fase);
                    const isInactive = i >= 30; // Verifica se é inativo
                    return (
                      <tr key={p.id || `fase-${i}`} className={isInactive ? 'inactive-participant' : ''}>
                        {/* Adicionado data-label aos TD */}
                        <td data-label="Posição">{i + 1}º</td>
                        <td data-label="Nome">{p.name}</td>
                        <td data-label="Tier" className="emblem-cell-jsx"> {/* Classe diferente */}
                          <img
                            src={getTierImageUrl(tier.emblem)}
                            alt={tier.name}
                            className="tier-emblem"
                          />
                          <span>{tier.name}</span>
                        </td>
                        <td data-label="Fase">{p.fase}</td>
                        {/* Passa o índice atual da temporada (currentPage - 1) */}
                        {renderEvolution(p.name, currentPage - 1)}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="lvAA">
                    {/* Ajustado colspan */}
                    <td className="lvtt" colSpan="4">
                      Total (Top 30)
                    </td>
                    <td className="lvtt" colSpan="1">
                      <span className="txtcenter">
                        {rankingData.sumFase.toLocaleString("pt-BR")}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Tabela Expedição Lunar */}
            <div className="table-wrapper">
              <div className="table-title">Expedição Lunar</div>
              <table>
                <thead>
                  <tr>
                    {/* Adicionado data-label aos TH */}
                    <th data-label="Posição">Posição</th>
                    <th data-label="Nome">Nome</th>
                    <th data-label="1ª Rodada">1ª Rodada</th>
                    <th data-label="2ª Rodada">2ª Rodada</th>
                    <th data-label="3ª Rodada">3ª Rodada</th>
                    <th data-label="Total">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rankingData.top30Total, ...rankingData.remainingTotal].map((p, i) => {
                     const isInactive = i >= 30;
                     return (
                      <tr key={p.id || `total-${i}`} className={isInactive ? 'inactive-participant' : ''}>
                        {/* Adicionado data-label aos TD */}
                        <td data-label="Posição">{i + 1}º</td>
                        <td data-label="Nome">{p.name}</td>
                        <td data-label="1ª Rodada">{p.r1}</td>
                        <td data-label="2ª Rodada">{p.r2}</td>
                        <td data-label="3ª Rodada">{p.r3}</td>
                        <td data-label="Total">{p.total}</td>
                      </tr>
                     );
                  })}
                </tbody>
                 <tfoot>
                  <tr className="lvAA">
                    {/* Ajustado colspan */}
                    <td className="lvtt" colSpan="5">
                      Total (Top 30)
                    </td>
                    <td className="lvtt" colSpan="1">
                      {rankingData.sumTotal.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1} // Corrigido para <= 1
            >
              &lt; Anterior
            </button>
            <span style={{ alignSelf: 'center', color: 'var(--glow-green)' }}>
                Pág {currentPage} de {totalPages}
            </span> {/* Indicador de página */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages} // Corrigido para >= totalPages
            >
              Próximo &gt;
            </button>
          </div>
        </>
      ) : (
        // Mensagem se não houver temporadas ou dados
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#ffc107' }}>
            Nenhuma temporada encontrada ou dados inválidos. Verifique o console ou adicione uma temporada.
        </p>
      )}
    </div>
  );
};

export default ResultsPage;