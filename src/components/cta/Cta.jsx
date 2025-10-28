import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// import Stats from 'stats.js'; // REMOVIDO
import './Cta.css';
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Importado

const Cta = () => {
  const mountRef = useRef(null);
  // const statsRef = useRef(null); // REMOVIDO

  useEffect(() => {
    // --- Basic setup ---
    // REMOVIDO: Variável stats
    let camera, scene, renderer, clock, delta;
    let textGeo, textTexture, textMaterial, text;
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = [];
    let light;
    let animationFrameId;

    const currentMount = mountRef.current;

    function init() {
      // --- Stats Panel --- REMOVIDO

      clock = new THREE.Clock();
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      currentMount.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 10000);
      camera.position.z = 1000;
      scene.add(camera);

      //--- Geometry for the logo ---
      // AJUSTADO: Tamanho da logo reduzido AINDA MAIS
      textGeo = new THREE.PlaneGeometry(150, 150); // <<< Reduzido de 200x200 para 150x150

      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl); //

      textMaterial = new THREE.MeshLambertMaterial({
        map: textTexture,
        transparent: true,
        // Mantido: Blending normal para não misturar com a fumaça
        blending: THREE.NormalBlending,
        depthWrite: false, // Mantido
        opacity: 1, // Garantir opacidade total
      });
      text = new THREE.Mesh(textGeo, textMaterial);
      text.position.z = 901; // Mantém ligeiramente à frente da fumaça
      // Mantido: Definir renderOrder para garantir que renderize por último
      text.renderOrder = 1;
      scene.add(text);

      // --- Lighting ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0x555555);
      scene.add(ambientLight);

      //--- Smoke texture setup ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png'); //
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Toxic Green Color
        map: smokeTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300);
      smokeParticles = [];

      for (let p = 0; p < 150; p++) {
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        // Posição Z original da fumaça mantida
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
        particle.rotation.z = Math.random() * 360;
        // RenderOrder padrão (0) para a fumaça
        particle.renderOrder = 0;
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    function animate() {
      // REMOVIDO: stats.begin()
      delta = clock.getDelta();
      animationFrameId = requestAnimationFrame(animate);
      evolveSmoke();
      render();
      // REMOVIDO: stats.end()
    }

    function evolveSmoke() {
      var sp = smokeParticles.length;
      while (sp--) {
        smokeParticles[sp].rotation.z += (delta * 0.2);
      }
    }

    function render() {
      renderer.render(scene, camera);
    }

    function onWindowResize() {
      if (currentMount) {
         camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    }

    init();
    window.addEventListener('resize', onWindowResize, false);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      // REMOVIDO: Limpeza do statsRef
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
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
       scene.remove(text);
       scene.remove(light);
       scene.remove(ambientLight);
       renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;