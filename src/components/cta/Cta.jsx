import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// import Stats from 'stats.js'; // REMOVIDO: Não importamos mais Stats
import './Cta.css';
import logoTextureUrl from "../../assets/logo/logoFE.png";

const Cta = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let camera, scene, renderer, clock, delta;
    let textGeo, textTexture, textMaterial, text;
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = [];
    let light, ambientLight; // Declare ambientLight here
    let animationFrameId;

    const currentMount = mountRef.current;

    function init() {
      // --- REMOVIDO: Stats Panel ---
      // stats = new Stats();
      // stats.setMode(0);
      // stats.domElement.style.position = 'absolute';
      // stats.domElement.style.left = '0px';
      // stats.domElement.style.top = '0px';
      // if (currentMount) {
      //   currentMount.appendChild(stats.domElement);
      //   statsRef.current = stats.domElement;
      // }

      clock = new THREE.Clock();

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // antialias for smoother edges
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      currentMount.appendChild(renderer.domElement);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 10000);
      camera.position.z = 1000;
      scene.add(camera);

      //--- Set up geometry for the logo ---
      textGeo = new THREE.PlaneGeometry(300, 300);

      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl);

      textMaterial = new THREE.MeshLambertMaterial({
        map: textTexture,
        transparent: true,
        blending: THREE.NormalBlending, // NormalBlending is usually better for logos with transparency
        depthWrite: false, // Prevents Z-fighting issues with transparency
        depthTest: true, // Ensures proper depth sorting against other objects
      });
      text = new THREE.Mesh(textGeo, textMaterial);
      text.position.z = 150; // Ajustado para ficar mais à frente que a fumaça. (Antes estava 800)
      scene.add(text);

      // --- Lighting ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      ambientLight = new THREE.AmbientLight(0x555555);
      scene.add(ambientLight);

      //--- Smoke setup ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Toxic Green Color
        map: smokeTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false, // Still good for smoke to prevent Z-fighting between particles
        side: THREE.DoubleSide // Ensures smoke is visible from both sides
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300);
      smokeParticles = [];

      for (let p = 0; p < 150; p++) {
        const particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        // Ajuste o range Z para que algumas partículas fiquem mais para trás e outras mais para frente,
        // mas todas atrás do logo (que está em z=150).
        particle.position.set(
          Math.random() * 500 - 250,
          Math.random() * 500 - 250,
          Math.random() * 500 - 350 // Z-range from -350 to 150 (max)
        );
        particle.rotation.z = Math.random() * 360;
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    function animate() {
      // --- REMOVIDO: stats.begin() e stats.end() ---
      delta = clock.getDelta();
      animationFrameId = requestAnimationFrame(animate);
      evolveSmoke();
      render();
    }

    function evolveSmoke() {
      let sp = smokeParticles.length;
      while (sp--) {
        smokeParticles[sp].rotation.z += (delta * 0.2);
        // Opcional: fazer a fumaça "subir" ou "se mover" para dar mais dinamismo
        // smokeParticles[sp].position.y += delta * 10;
        // if (smokeParticles[sp].position.y > 250) { // Reset position if too high
        //   smokeParticles[sp].position.y = -250;
        // }
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

      // --- REMOVIDO: statsRef.current cleanup ---

      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      // Dispose Three.js objects
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