import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js'; // Make sure stats.js is installed
import './Cta.css'; // Import the updated CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Import the logo

const Cta = () => {
  const mountRef = useRef(null);
  const statsRef = useRef(null); // Ref for stats panel

  useEffect(() => {
    // --- Basic setup ---
    let camera, scene, renderer, geometry, material, mesh, clock, stats, delta;
    let textGeo, textTexture, textMaterial, text;
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = [];
    let light;
    let cubeSineDriver = 0;
    let animationFrameId;

    const currentMount = mountRef.current; // Capture mountRef.current

    function init() {
      // --- Stats Panel ---
      stats = new Stats();
      stats.setMode(0); // 0: fps, 1: ms
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      // Append stats to the specific mount point, not document.body
      if (currentMount) {
        currentMount.appendChild(stats.domElement);
        statsRef.current = stats.domElement; // Store ref for cleanup
      }


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
      // geometry = new THREE.BoxGeometry(200, 200, 200);
      // material = new THREE.MeshLambertMaterial({ color: 0xaa444, wireframe: false });
      // mesh = new THREE.Mesh(geometry, material);
      // cubeSineDriver = 0;

      //--- Set up geometry for the logo ---
      textGeo = new THREE.PlaneGeometry(300, 300); // Adjust size as needed

      // --- Load logo texture ---
      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl); // Use imported logo URL

      textMaterial = new THREE.MeshLambertMaterial({
        // color: 0x00ffff, // Color tint (optional)
        opacity: 1,
        map: textTexture,
        transparent: true,
        blending: THREE.AdditiveBlending, // Or THREE.NormalBlending
        depthWrite: false // Often needed for transparency layering
      });
      text = new THREE.Mesh(textGeo, textMaterial);
      text.position.z = 800; // Position in front of smoke
      scene.add(text);

      // --- Lighting ---
      light = new THREE.DirectionalLight(0xffffff, 0.7);
      light.position.set(-1, 0, 1);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0x555555); // So smoke isn't black
      scene.add(ambientLight);


      //--- Pull in the smoke texture and set it up ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Toxic Green Color
        map: smokeTexture,
        transparent: true,
        opacity: 0.6, // Adjust opacity as needed
        blending: THREE.AdditiveBlending, // Experiment with blending modes
        depthWrite: false // Important for transparency
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300);
      smokeParticles = [];

      //--- Set particle texture ---
      for (let p = 0; p < 150; p++) { // Use 'let' instead of implicit global
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
        particle.rotation.z = Math.random() * 360;

        //--- Add particles to the scene ---
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    function animate() {
      if (stats) stats.begin(); // Check if stats exists
      delta = clock.getDelta();
      animationFrameId = requestAnimationFrame(animate);
      evolveSmoke();
      render();
      if (stats) stats.end(); // Check if stats exists
    }

    function evolveSmoke() {
      var sp = smokeParticles.length;
      while (sp--) {
        smokeParticles[sp].rotation.z += (delta * 0.2);
      }
    }

    function render() {
      // mesh.rotation.x += 0.005; // Cube rotation removed
      // mesh.rotation.y += 0.01;
      // cubeSineDriver += .01;
      // mesh.position.z = 100 + (Math.sin(cubeSineDriver) * 500);

      renderer.render(scene, camera);
    }

    function onWindowResize() {
      if (currentMount) { // Check if mount point exists
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
      if (statsRef.current && currentMount.contains(statsRef.current)) {
          currentMount.removeChild(statsRef.current); // Remove stats panel
      }
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement); // Remove canvas
      }
      // Optional: Dispose Three.js objects if necessary for memory management
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
  }, []); // Empty dependency array ensures this runs only once on mount

  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />; // Container for Three.js
};

export default Cta;