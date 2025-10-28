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
    // CORRIGIDO: Removido 'light', adicionado 'ambientLight'
    let camera, scene, renderer, clock, delta, ambientLight;
    let textGeo, textTexture, textMaterial, text;
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = [];
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
      // Mantido o tamanho reduzido
      textGeo = new THREE.PlaneGeometry(150, 150);

      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl); //
      textTexture.minFilter = THREE.LinearFilter;
      textTexture.magFilter = THREE.LinearFilter;

      // Mantido: MeshBasicMaterial
      textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        // blending: THREE.NormalBlending, // Removido (é o default)
        depthWrite: false,
        opacity: 1,
        // AJUSTADO: Adicionado alphaTest para nitidez das bordas
        alphaTest: 0.5, // <<< Adicionado
      });
      text = new THREE.Mesh(textGeo, textMaterial);
      text.position.z = 901;
      text.renderOrder = 1;
      scene.add(text);

      // --- Lighting ---
      // Luz direcional removida completamente
      ambientLight = new THREE.AmbientLight(0xCCCCCC); // Mantido um pouco mais claro
      scene.add(ambientLight);

      //--- Smoke texture setup ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png'); //
      smokeMaterial = new THREE.MeshLambertMaterial({ // Fumaça ainda usa Lambert
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
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
        particle.rotation.z = Math.random() * 360;
        particle.renderOrder = 0;
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    function animate() {
      delta = clock.getDelta();
      animationFrameId = requestAnimationFrame(animate);
      evolveSmoke();
      render();
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

    // --- Cleanup function ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
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
       // Luz direcional já removida da cena e da declaração
       // CORRIGIDO: Remover ambientLight da cena
       scene.remove(ambientLight);
       renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;