import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// Stats.js não é mais necessário
import './Cta.css'; // Mantenha a importação do CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Importa a imagem do logo

const Cta = () => {
  const mountRef = useRef(null); // Ref para o container do canvas

  useEffect(() => {
    // --- Variáveis do Three.js ---
    let camera, scene, renderer, clock, delta;
    let textGeo, textTexture, textMaterial, textMesh; // Renomeado 'text' para 'textMesh' para clareza
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = [];
    let directionalLight, ambientLight; // Renomeado 'light' para 'directionalLight'
    let animationFrameId;

    const currentMount = mountRef.current; // Guarda a referência atual do container

    // --- Função de Inicialização ---
    function init() {
      // --- Clock ---
      clock = new THREE.Clock();

      // --- Renderer ---
      // Cria o renderer com fundo transparente (alpha: true) e antialiasing
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      // Define o tamanho inicial baseado no container
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      // Adiciona o canvas ao container no DOM
      currentMount.appendChild(renderer.domElement);

      // --- Scene ---
      scene = new THREE.Scene();

      // --- Camera ---
      camera = new THREE.PerspectiveCamera(
        75, // Campo de visão
        currentMount.clientWidth / currentMount.clientHeight, // Aspect ratio
        1, // Near clipping plane
        10000 // Far clipping plane
      );
      camera.position.z = 800; // Posição da câmera um pouco mais afastada para ver a cena
      scene.add(camera);

      // --- Logo Plane ---
      textGeo = new THREE.PlaneGeometry(350, 350); // Tamanho do plano do logo

      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl); // Carrega a textura do logo

      textMaterial = new THREE.MeshLambertMaterial({
        map: textTexture, // Aplica a textura
        transparent: true, // Habilita transparência
        blending: THREE.NormalBlending, // Modo de mistura normal para logos com alpha
        depthWrite: false, // Importante para renderizar corretamente com outras transparências
        depthTest: true, // Garante que o Z-buffer seja considerado
        side: THREE.DoubleSide // Garante que seja visível de ambos os lados (opcional)
      });

      textMesh = new THREE.Mesh(textGeo, textMaterial);
      textMesh.position.z = 150; // Posiciona o logo mais perto da câmera (à frente da fumaça)
      scene.add(textMesh);

      // --- Lighting ---
      // Luz direcional para dar sombras/destaques
      directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(-1, 0.5, 1); // Posição da luz
      scene.add(directionalLight);
      // Luz ambiente para iluminar a cena de forma geral
      ambientLight = new THREE.AmbientLight(0x666666); // Cor cinza claro
      scene.add(ambientLight);

      // --- Smoke ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png'); // Textura da fumaça
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Cor verde tóxico
        map: smokeTexture,
        transparent: true,
        opacity: 0.5, // Opacidade da fumaça (ajuste conforme necessário)
        blending: THREE.AdditiveBlending, // Modo de mistura aditivo para efeito de brilho/sobreposição
        depthWrite: false, // Importante para partículas transparentes não sobrescreverem o Z-buffer incorretamente
        side: THREE.DoubleSide // Visível de ambos os lados
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300); // Tamanho das partículas de fumaça
      smokeParticles = []; // Array para guardar as partículas

      // Cria e posiciona as partículas de fumaça
      for (let p = 0; p < 150; p++) {
        const particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        particle.position.set(
          Math.random() * 600 - 300, // Posição X aleatória
          Math.random() * 600 - 300, // Posição Y aleatória
          Math.random() * 400 - 300  // Posição Z aleatória (atrás do logo)
        );
        particle.rotation.z = Math.random() * Math.PI * 2; // Rotação Z aleatória
        scene.add(particle); // Adiciona à cena
        smokeParticles.push(particle); // Adiciona ao array
      }
    }

    // --- Função de Animação (Loop) ---
    function animate() {
      delta = clock.getDelta(); // Tempo desde o último frame
      animationFrameId = requestAnimationFrame(animate); // Chama a si mesma no próximo frame
      evolveSmoke(); // Atualiza a rotação da fumaça
      render(); // Renderiza a cena
    }

    // --- Função para Evoluir a Fumaça ---
    function evolveSmoke() {
      let sp = smokeParticles.length;
      while (sp--) {
        // Rotaciona cada partícula lentamente
        smokeParticles[sp].rotation.z += (delta * 0.15);
      }
    }

    // --- Função de Renderização ---
    function render() {
      // Renderiza a cena a partir da perspectiva da câmera
      renderer.render(scene, camera);
    }

    // --- Função para Redimensionar ---
    function onWindowResize() {
      if (currentMount) { // Verifica se o container ainda existe
        // Atualiza o aspect ratio da câmera
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        // Atualiza o tamanho do renderer
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    }

    // --- Inicialização e Event Listener ---
    init(); // Chama a função de inicialização
    window.addEventListener('resize', onWindowResize, false); // Adiciona listener para redimensionamento

    // --- Inicia a Animação ---
    animate();

    // --- Função de Limpeza (executada quando o componente desmonta) ---
    return () => {
      cancelAnimationFrame(animationFrameId); // Para o loop de animação
      window.removeEventListener('resize', onWindowResize); // Remove o listener

      // Remove o canvas do DOM se ele ainda existir
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      // Libera recursos do Three.js para evitar vazamentos de memória
      smokeParticles.forEach(p => {
        if (p.geometry) p.geometry.dispose();
        if (p.material) {
          if (p.material.map) p.material.map.dispose();
          p.material.dispose();
        }
        scene.remove(p);
      });
      if (textGeo) textGeo.dispose();
      if (textMaterial) {
        if (textMaterial.map) textMaterial.map.dispose();
        textMaterial.dispose();
      }
      if (smokeTexture) smokeTexture.dispose();
      scene.remove(textMesh);
      scene.remove(directionalLight);
      scene.remove(ambientLight);

      // Limpa a cena e o renderer
      while(scene.children.length > 0){
          scene.remove(scene.children[0]);
      }
      if (renderer) renderer.dispose();
    };
  }, []); // Array vazio garante que o useEffect rode apenas na montagem/desmontagem

  // Retorna o div que servirá como container para o canvas Three.js
  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;