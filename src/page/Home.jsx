import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomePage.css'; // Certifique-se que este CSS está atualizado conforme a resposta anterior
import Cta from '../components/cta/Cta';

const Home = ({ userRole }) => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [podiumSeasonDates, setPodiumSeasonDates] = useState({ start: '', end: '' });

  const [homeContent, setHomeContent] = useState({
    leader: '',
    focus: '',
    league: '',
    requirements: [],
    content_section: ''
  });
  const [honorInfo, setHonorInfo] = useState({ members: [], period: '' });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [seasonsRes, contentRes, honorRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/seasons`),
        axios.get(`${import.meta.env.VITE_API_URL}/home-content`),
        axios.get(`${import.meta.env.VITE_API_URL}/latest-honor-members`)
      ]);

      if (seasonsRes.data && seasonsRes.data.length > 0) {
        const latestSeason = seasonsRes.data[seasonsRes.data.length - 1];
        // Ordena por 'fase' descendente e pega os top 3
        const sortedParticipants = [...latestSeason.participants].sort((a, b) => b.fase - a.fase);
        setTopPlayers(sortedParticipants.slice(0, 3));
        setMemberCount(latestSeason.participants.length);

        setPodiumSeasonDates({
          start: formatDate(latestSeason.start_date),
          end: formatDate(latestSeason.end_date)
        });
      }

      setHomeContent(contentRes.data);
      setHonorInfo(honorRes.data);

    } catch (error) {
      console.error("Erro ao buscar dados para a Home:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleInputChange = (e) => setHomeContent(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleRequirementChange = (index, value) => {
    const newRequirements = [...homeContent.requirements];
    newRequirements[index] = value;
    setHomeContent(p => ({ ...p, requirements: newRequirements }));
  };
  const handleSaveChanges = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/home-content`, homeContent);
      alert("Conteúdo salvo com sucesso!");
      setIsEditing(false);
    } catch (error) {
      alert("Falha ao salvar o conteúdo.");
    }
  };

  return (
    <>
      <Cta/>
      <div className="home-container">

        {userRole === 'admin' && (
          <div className="admin-controls">
            {isEditing ? (
              <>
                <button onClick={handleSaveChanges} className="btn-save">Salvar</button>
                <button onClick={() => { setIsEditing(false); fetchHomeData(); }} className="btn-cancel">Cancelar</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-edit-mode">Editar Página</button>
            )}
          </div>
        )}

        <div className="section home-header">
            <h1>Tóxicøs</h1>
            <div className="header-content-wrapper">
                <div className="header-column">
                    <h3>Informações do Clã</h3>
                    {isEditing ? (
                        <div className="edit-fields">
                            <input type="text" name="leader" value={homeContent.leader} onChange={handleInputChange} placeholder="Líder" />
                            <input type="text" name="focus" value={homeContent.focus} onChange={handleInputChange} placeholder="Foco" />
                            <input type="text" name="league" value={homeContent.league} onChange={handleInputChange} placeholder="Liga" />
                        </div>
                    ) : (
                        <ul className="info-list">
                            <li>Líder: {homeContent.leader}</li>
                            <li>Membros: {memberCount} / 40</li>
                            <li>Foco: {homeContent.focus}</li>
                            <li>Liga Atual: {homeContent.league}</li>
                        </ul>
                    )}
                </div>
                <div className="header-column">
                    <h3>Requisitos de Alistamento</h3>
                    {isEditing ? (
                        <div className="edit-fields">
                            {homeContent.requirements.map((req, index) => (
                                <input key={index} type="text" value={req} onChange={(e) => handleRequirementChange(index, e.target.value)} />
                            ))}
                            {/* Adicionar mais campos se necessário */}
                        </div>
                    ) : (
                        <ul className="requirements-list">
                            {homeContent.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>

        {/* --- SEÇÃO DO PÓDIO ATUALIZADA --- */}
        <div className="section">
          <h2 className="section-title">Pódio da Temporada</h2>
          {loading ? (
             <p style={{textAlign: 'center'}}>Carregando pódio...</p>
          ) : topPlayers.length > 0 ? (
            <>
              {/* Definições SVG colocadas uma vez fora do loop */}
              <svg className="svg-container" width="0" height="0" style={{ position: 'absolute', zIndex: -1 }}>
  <defs>
    <filter id="turbulent-displace" colorInterpolationFilters="sRGB" x="-50%" y="-50%" width="200%" height="200%"> {/* Aumentei a área do filtro */}
      <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise1" seed="1" /> {/* Octaves reduzidas para suavizar */}
      <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
        {/* Animação Y contínua para cima e para baixo */}
        <animate attributeName="dy" values="0; 15; -15; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
      </feOffset>

      <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise2" seed="2" /> {/* Octaves reduzidas */}
      <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
        {/* Animação X contínua para esquerda e direita */}
        <animate attributeName="dx" values="0; -15; 15; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
      </feOffset>

      {/* Combina os ruídos deslocados */}
      <feBlend in="offsetNoise1" in2="offsetNoise2" mode="color-dodge" result="combinedNoise" />

      {/* Aplica o deslocamento à borda */}
      <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="25" xChannelSelector="R" yChannelSelector="B" /> {/* Escala ligeiramente reduzida */}
    </filter>
  </defs>
</svg>

              <div className="podium-container">
                {topPlayers.map((player, index) => {
                  const rank = index + 1;
                  return (
                    <div key={player.habby_id || index} className={`podium-wrapper rank-${rank}`}>
                       {/* main-container pode ser opcional dependendo do seu layout geral */}
                       {/* <main className="main-container"> */}
                         <div className="card-container">
                           <div className="inner-container">
                             <div className="border-outer">
                               <div className="main-card">
                                 {/* O conteúdo agora está no content-container abaixo */}
                               </div>
                             </div>
                             <div className="glow-layer-1"></div>
                             <div className="glow-layer-2"></div>
                           </div>
                           <div className="overlay-1"></div>
                           <div className="overlay-2"></div>
                           <div className="background-glow"></div>

                           {/* Conteúdo Centralizado */}
                           <div className="content-container">
                              <div className="podium-rank">{rank}º</div>
                              <div className="podium-name">{player.name}</div>
                              <div className="podium-score">Fase: {player.fase}</div>
                           </div>
                         </div>
                       {/* </main> */}
                     </div>
                  );
                })}
              </div>
              <p className="season-period">
                Temporada de {podiumSeasonDates.start} até {podiumSeasonDates.end}
              </p>
            </>
          ) : (
            <p style={{textAlign: 'center'}}>O pódio da temporada ainda não foi definido.</p>
          )}
        </div>
        {/* --- FIM DA SEÇÃO DO PÓDIO --- */}


        <div className="section honor-section">
            <h2 className="section-title">Membros de Honra</h2>
            {loading ? (
                <p style={{textAlign: 'center'}}>Buscando membros de honra...</p>
            ) : honorInfo.members && honorInfo.members.length > 0 ? (
                <>
                <div className="honor-members-grid">
                    {honorInfo.members.map(member => (
                    <div key={member.habby_id} className="honor-member-card gloria-profile">
                        <div className="profile-pic-wrapper">
                        <img src={member.profile_pic_url} alt={member.name} className="profile-pic" />
                        </div>
                        <p className="honor-member-name">{member.name}</p>
                    </div>
                    ))}
                </div>
                <p className="honor-period">{honorInfo.period}</p>
                </>
            ) : (
                <p style={{textAlign: 'center'}}>Os membros de honra da temporada atual ainda não foram definidos.</p>
            )}
        </div>

        <div className="section">
          <h2 className="section-title">Conteúdo</h2>
          {isEditing ? (
            <textarea name="content_section" value={homeContent.content_section} onChange={handleInputChange} className="edit-textarea"></textarea>
          ) : (
            <p style={{textAlign: 'center', lineHeight: '1.6'}}>{homeContent.content_section}</p>
          )}
        </div>

        <footer className="footer">
          <p>© 2025 Tóxicøs. Todos os direitos reservados. </p>
          <p>Desenvolvido por: <a href="https://mcs-vinicius.github.io/portifolio/">IzanagI</a></p>
        </footer>
      </div>
    </>
  );
};

export default Home;