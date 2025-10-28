import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// import Stats from 'stats.js'; // REMOVIDO: Importação do stats.js
import './Cta.css'; // Import the updated CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Import the logo

const Cta = () => {
  const mountRef = useRef(null);
  // const statsRef = useRef(null); // REMOVIDO: Ref para stats

  useEffect(() => {
    // --- Basic setup ---
    // REMOVIDO: Variável stats
    let camera, scene, renderer, geometry, material, mesh, clock, delta;
    let textGeo, textTexture, textMaterial, text;
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = [];
    let light;
    // let cubeSineDriver = 0; // Removido pois o cubo foi removido
    let animationFrameId;

    const currentMount = mountRef.current; // Capture mountRef.current

    function init() {
      // --- Stats Panel --- REMOVIDO

      //--- Set new clock ---
      clock = new THREE.Clock();

      //--- Setup render and set scene size ---
      renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      currentMount.appendChild(renderer.domElement);

      //--- Set up scene ---
      scene = new THREE.Scene();

      //--- Set up camera ---
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 10000);
      camera.position.z = 1000;
      scene.add(camera);

      //--- Set up geometry (removed the spinning cube) ---

      //--- Set up geometry for the logo ---
      textGeo = new THREE.PlaneGeometry(300, 300); // Tamanho da logo mantido

      // --- Load logo texture ---
      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl); // Use imported logo URL

      textMaterial = new THREE.MeshLambertMaterial({
        opacity: 1,
        map: textTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      text = new THREE.Mesh(textGeo, textMaterial);
      // AJUSTADO: Posição Z ligeiramente à frente do limite original da fumaça (900)
      text.position.z = 901;
      scene.add(text);

      // --- Lighting ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0x555555);
      scene.add(ambientLight);


      //--- Pull in the smoke texture and set it up ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Toxic Green Color
        map: smokeTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false // Mantido como false para o efeito de fumaça
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300);
      smokeParticles = [];

      //--- Set particle texture ---
      for (let p = 0; p < 150; p++) {
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        // REVERTIDO: Posição Z original da fumaça
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
        particle.rotation.z = Math.random() * 360;

        //--- Add particles to the scene ---
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
      // Lógica de rotação do cubo removida
      renderer.render(scene, camera);
    }

    function onWindowResize() {
      if (currentMount) {
         camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    }

    // --- Initialize and add resize listener ---
    init();
    window.addEventListener('resize', onWindowResize, false);

    // --- Start animation ---
    animate();

    // --- Cleanup function ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      // REMOVIDO: Limpeza do statsRef
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      // Limpeza dos objetos Three.js
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