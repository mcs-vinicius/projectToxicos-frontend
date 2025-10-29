import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './Cta.css';
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Mantém a importação para o <img>

const Cta = () => {
  const mountRef = useRef(null); // Ref para o div onde o canvas será montado

  useEffect(() => {
    // --- Variáveis (restauradas para o original) ---
    let camera, scene, renderer, clock, delta;
    // REMOVIDO: textGeo, textTexture, textMaterial, text; // Logo não é mais 3D
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = []; // Fumaça
    let light, ambientLight; // Luzes
    let animationFrameId;

    const currentMount = mountRef.current;
    let width = currentMount?.clientWidth || 0;
    let height = currentMount?.clientHeight || 0;

    function init() {
      clock = new THREE.Clock();
      if (!currentMount || width === 0 || height === 0) return;

      // --- Renderer ---
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Fundo transparente e suavização
      renderer.setSize(width, height);
      // renderer.sortObjects = true; // Não é mais estritamente necessário
      currentMount.appendChild(renderer.domElement);

      // --- Cena e Câmera (original) ---
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000); // Far plane original
      camera.position.z = 1000;
      scene.add(camera); // Adiciona a câmera à cena (como no original)

      // --- Iluminação (original) ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      ambientLight = new THREE.AmbientLight(0x555555); // Luz ambiente original
      scene.add(ambientLight);

      const textureLoader = new THREE.TextureLoader();

      // --- Configuração da FUMAÇA (ORIGINAL RESTAURADA) ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Cor verde tóxico
        map: smokeTexture,
        transparent: true,
        opacity: 0.6, // << OPACIDADE ORIGINAL
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300); // << TAMANHO ORIGINAL
      smokeParticles = [];

      // Loop para criar partículas de fumaça (ORIGINAL RESTAURADO)
      for (let p = 0; p < 150; p++) { // << NÚMERO ORIGINAL
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        particle.position.set(
          Math.random() * 500 - 250, // << POSIÇÃO ORIGINAL X/Y
          Math.random() * 500 - 250, // << POSIÇÃO ORIGINAL X/Y
          Math.random() * 1000 - 100 // << POSIÇÃO ORIGINAL Z
        );
        particle.rotation.z = Math.random() * 360;
        // particle.renderOrder = 0; // Não é mais necessário controlar
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    // --- Funções animate, evolveSmoke, render, onWindowResize (sem alterações da versão anterior) ---
    function animate() {
      if (clock) {
        delta = clock.getDelta();
        evolveSmoke();
      }
      animationFrameId = requestAnimationFrame(animate);
      render();
    }

    function evolveSmoke() {
      smokeParticles.forEach(particle => { // Usando forEach é um pouco mais moderno
        if (delta !== undefined) {
           particle.rotation.z += (delta * 0.2);
        }
      });
    }

    function render() {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

    function onWindowResize() {
        width = currentMount?.clientWidth || 0;
        height = currentMount?.clientHeight || 0;
        if (currentMount && camera && renderer) {
           camera.aspect = width / height;
           camera.updateProjectionMatrix();
           renderer.setSize(width, height);
        }
      }

    // --- Inicialização e Limpeza ---
    if (currentMount) {
        init();
        window.addEventListener('resize', onWindowResize, false);
        animate();
    }

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onWindowResize);

        // Dispose apenas da fumaça
        if (smokeGeo) smokeGeo.dispose();
        if (smokeMaterial) {
            if (smokeMaterial.map) smokeMaterial.map.dispose();
            smokeMaterial.dispose();
        }
        if (smokeTexture) smokeTexture.dispose();

        if (scene) {
          if (light) scene.remove(light);
          if (ambientLight) scene.remove(ambientLight);
          smokeParticles.forEach(p => scene.remove(p));
        }
        smokeParticles = [];

        if (renderer && renderer.domElement && currentMount && currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();

        camera = undefined; scene = undefined; renderer = undefined; clock = undefined;
        light = undefined; ambientLight = undefined;
        smokeGeo = undefined; smokeMaterial = undefined; smokeTexture = undefined;
      };
  }, []);

  // Retorna o container principal que terá o canvas e a imagem sobreposta
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }}>
      {/* Div onde o canvas da fumaça será montado */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
      {/* Imagem do logo posicionada sobre o div do canvas */}
      <img
        src={logoTextureUrl}
        alt="Tóxicos Logo"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '60%', // Ajuste o tamanho conforme necessário
          maxHeight: '60%',// Ajuste o tamanho conforme necessário
          width: 'auto',   // Mantém proporção
          height: 'auto',  // Mantém proporção
          zIndex: 10,      // Garante que fique na frente do canvas (zIndex: 1)
          pointerEvents: 'none',
          opacity: 1,
          filter: 'none',
          imageRendering: 'pixelated', // Opcional
          WebkitFontSmoothing: 'antialiased', // Opcional
          MozOsxFontSmoothing: 'grayscale' // Opcional
        }}
      />
    </div>
  );
};

export default Cta;