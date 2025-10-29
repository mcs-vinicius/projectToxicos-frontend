import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './Cta.css'; // Mantenha a importação do CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Mantenha a importação para o <img>

const Cta = () => {
  const mountRef = useRef(null); // Ref para o div onde o canvas será montado

  useEffect(() => {
    // --- Variáveis ---
    let camera, scene, renderer, clock, delta;
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = []; // Apenas fumaça
    let light, ambientLight; // Luzes
    let animationFrameId;

    const currentMount = mountRef.current;
    let width = currentMount?.clientWidth || 0;
    let height = currentMount?.clientHeight || 0;

    function init() {
      clock = new THREE.Clock();
      if (!currentMount || width === 0 || height === 0) return;

      // --- Renderer ---
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      currentMount.appendChild(renderer.domElement);

      // --- Cena e Câmera (Apenas para fumaça) ---
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 1, 2000);
      camera.position.z = 1000;

      // --- Iluminação ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      ambientLight = new THREE.AmbientLight(0xaaaaaa);
      scene.add(ambientLight);

      const textureLoader = new THREE.TextureLoader();

      // --- Configuração da FUMAÇA ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14,
        map: smokeTexture,
        transparent: true,
        opacity: 0.4, // Ajuste a opacidade como desejar
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300);
      smokeParticles = [];

      for (let p = 0; p < 150; p++) {
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        particle.position.set(
          Math.random() * 500 - 250,
          Math.random() * 500 - 250,
          Math.random() * 800 - 100
        );
        particle.rotation.z = Math.random() * 360;
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    // --- Funções animate, evolveSmoke, render, onWindowResize (sem alterações) ---
    function animate() {
      if (clock) {
        delta = clock.getDelta();
        evolveSmoke();
      }
      animationFrameId = requestAnimationFrame(animate);
      render();
    }

    function evolveSmoke() {
      smokeParticles.forEach(particle => {
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
        style={{ // Estilos inline para simplicidade, podem ir para Cta.css
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '60%', // Ajuste o tamanho conforme necessário
          maxHeight: '60%',// Ajuste o tamanho conforme necessário
          width: 'auto',   // Mantém proporção
          height: 'auto',  // Mantém proporção
          zIndex: 10,      // Garante que fique na frente do canvas (zIndex: 1)
          pointerEvents: 'none', // Não interfere com cliques/eventos no canvas
          // Garante a nitidez:
          opacity: 1,
          filter: 'none',
          imageRendering: 'pixelated', // Opcional: Para pixel art ou logos que não devem ser suavizados
          WebkitFontSmoothing: 'antialiased', // Opcional: Melhora a renderização de texto (se houver no logo)
          MozOsxFontSmoothing: 'grayscale' // Opcional: Melhora a renderização de texto (se houver no logo)
        }}
      />
    </div>
  );
};

export default Cta;