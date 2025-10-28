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
    let light, ambientLight; // <--- ambientLight declarado aqui
    let animationFrameId;

    const currentMount = mountRef.current;

    function init() {
      // --- Stats Panel --- REMOVIDO

      clock = new THREE.Clock();
      // Verifique se currentMount existe antes de acessar clientWidth/clientHeight
      if (!currentMount) return;
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      currentMount.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 10000);
      camera.position.z = 1000;
      scene.add(camera);

      //--- Geometry for the logo ---
      textGeo = new THREE.PlaneGeometry(150, 150);

      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl);

      textMaterial = new THREE.MeshLambertMaterial({
        map: textTexture,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        opacity: 1,
      });
      text = new THREE.Mesh(textGeo, textMaterial);
      text.position.z = 901;
      text.renderOrder = 1;
      scene.add(text);

      // --- Lighting ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      ambientLight = new THREE.AmbientLight(0x555555); // <--- Atribuído aqui
      scene.add(ambientLight);

      //--- Smoke texture setup ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
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
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
        particle.rotation.z = Math.random() * 360;
        particle.renderOrder = 0;
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    function animate() {
      // REMOVIDO: stats.begin()
      // Verifica se o clock foi inicializado
      if (clock) {
        delta = clock.getDelta();
        evolveSmoke();
      }
      animationFrameId = requestAnimationFrame(animate);
      render();
      // REMOVIDO: stats.end()
    }

    function evolveSmoke() {
      var sp = smokeParticles.length;
      while (sp--) {
        // Verifica se delta existe
        if (delta !== undefined) {
           smokeParticles[sp].rotation.z += (delta * 0.2);
        }
      }
    }

    function render() {
      // Verifica se renderer e scene existem
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

    function onWindowResize() {
      if (currentMount && camera && renderer) {
         camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    }

    // Apenas inicialize e comece a animação se o mountRef estiver disponível
    if (currentMount) {
        init();
        window.addEventListener('resize', onWindowResize, false);
        animate();
    }


    // Função de Limpeza Reforçada
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);

      // Dispose de geometrias, materiais e texturas
      if (textGeo) textGeo.dispose();
      if (textMaterial) {
        if (textMaterial.map) textMaterial.map.dispose();
        textMaterial.dispose();
      }
      if (smokeGeo) smokeGeo.dispose();
      if (smokeMaterial) {
        if (smokeMaterial.map) smokeMaterial.map.dispose();
        smokeMaterial.dispose();
      }
      if (smokeTexture) smokeTexture.dispose();

      // Remove objetos da cena
      if (scene) {
        if (text) scene.remove(text);
        if (light) scene.remove(light);
        if (ambientLight) scene.remove(ambientLight); // <--- Agora acessível
        smokeParticles.forEach(p => scene.remove(p));
      }
      smokeParticles = []; // Limpa o array

       // Remove o renderer do DOM se ele existir e ainda estiver montado
       if (renderer && renderer.domElement && currentMount && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      // Dispose do renderer
      if (renderer) renderer.dispose();

      // Limpa as referências principais para ajudar o GC (Garbage Collector)
      camera = undefined;
      scene = undefined;
      renderer = undefined;
      clock = undefined;
      light = undefined;
      ambientLight = undefined; // Limpa referência
      text = undefined;
      textGeo = undefined;
      textMaterial = undefined;
      textTexture = undefined;
      smokeGeo = undefined;
      smokeMaterial = undefined;
      smokeTexture = undefined;
    };
  }, []); // Dependência vazia ainda é correta aqui

  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;