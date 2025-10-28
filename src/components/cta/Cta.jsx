import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// REMOVED: import Stats from 'stats.js';
import './Cta.css'; // Import CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Import the logo

const Cta = () => {
  const mountRef = useRef(null); // Ref for the container div

  useEffect(() => {
    // --- Three.js Variables ---
    // Declare variables needed in cleanup here, initialize to null
    let camera, scene, renderer, clock, delta;
    let logoPlaneGeo = null, logoTexture = null, logoMaterial = null, logoMesh = null; // Variables for the logo
    let smokeTexture = null, smokeMaterial = null, smokeGeo = null, smokeParticles = []; // Variables for smoke
    let directionalLight = null, ambientLight = null; // Lights
    let animationFrameId;

    const currentMount = mountRef.current; // Store the current ref

    // --- Initialization Function ---
    function init() {
      // --- Clock ---
      clock = new THREE.Clock();

      // --- Renderer ---
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentMount.appendChild(renderer.domElement);

      // --- Scene ---
      scene = new THREE.Scene();

      // --- Camera ---
      camera = new THREE.PerspectiveCamera(
        75,
        currentMount.clientWidth / currentMount.clientHeight,
        1,
        10000
      );
      camera.position.z = 600;
      scene.add(camera);

      // --- Logo ---
      const textureLoader = new THREE.TextureLoader();
      logoTexture = textureLoader.load(logoTextureUrl);
      logoPlaneGeo = new THREE.PlaneGeometry(300, 300); // Assign to outer scope var

      logoMaterial = new THREE.MeshLambertMaterial({ // Assign to outer scope var
        map: logoTexture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true,
      });

      logoMesh = new THREE.Mesh(logoPlaneGeo, logoMaterial); // Assign to outer scope var
      logoMesh.position.z = 100;
      scene.add(logoMesh);

      // --- Lighting ---
      directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Assign to outer scope var
      directionalLight.position.set(-1, 0.5, 1);
      scene.add(directionalLight);
      ambientLight = new THREE.AmbientLight(0x666666); // Assign to outer scope var
      scene.add(ambientLight);

      // --- Smoke ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png'); // Assign to outer scope var
      smokeMaterial = new THREE.MeshLambertMaterial({ // Assign to outer scope var
        color: 0x39FF14,
        map: smokeTexture,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300); // Assign to outer scope var
      smokeParticles = []; // Reset array

      for (let p = 0; p < 120; p++) {
        const particleMat = smokeMaterial.clone(); // Use the material defined above
        const particle = new THREE.Mesh(smokeGeo, particleMat); // Use the geometry defined above
        particle.position.set(
            (Math.random() - 0.5) * 800,
            (Math.random() - 0.5) * 600,
            (Math.random() - 0.9) * 400
        );
        particle.rotation.z = Math.random() * Math.PI * 2;
        particle.material.opacity = Math.random() * 0.3 + 0.2;
        scene.add(particle);
        smokeParticles.push(particle); // Add to outer scope array
      }
    }

    // --- Animation Loop ---
    function animate() {
      delta = clock.getDelta();
      animationFrameId = requestAnimationFrame(animate);
      evolveSmoke();
      render();
    }

    // --- Update Smoke ---
    function evolveSmoke() {
      smokeParticles.forEach(particle => {
        particle.rotation.z += (delta * 0.15);
      });
    }

    // --- Render Scene ---
    function render() {
      renderer.render(scene, camera);
    }

    // --- Handle Window Resize ---
    function onWindowResize() {
      if (currentMount) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    }

    // --- Run Initialization and Start Animation ---
    init();
    window.addEventListener('resize', onWindowResize, false);
    animate();

    // --- Cleanup on Unmount ---
    return () => {
      console.log("Cleaning up Three.js scene..."); // Add log for debugging
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);

      // Remove canvas from DOM
      if (renderer && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects safely
      smokeParticles.forEach(p => {
        try {
          if (p.geometry) p.geometry.dispose();
          if (p.material) {
            if (p.material.map) p.material.map.dispose();
            p.material.dispose();
          }
          if (scene) scene.remove(p); // Check if scene exists
        } catch (e) { console.error("Error disposing particle:", e); }
      });
      smokeParticles = []; // Clear array

      try {
        if (logoPlaneGeo) logoPlaneGeo.dispose();
        if (logoMaterial) {
          if (logoMaterial.map) logoMaterial.map.dispose();
          logoMaterial.dispose();
        }
        if (smokeTexture) smokeTexture.dispose(); // Dispose smoke texture too
        if (scene && logoMesh) scene.remove(logoMesh); // Check if scene/mesh exist
        if (scene && directionalLight) scene.remove(directionalLight);
        if (scene && ambientLight) scene.remove(ambientLight);
      } catch (e) { console.error("Error disposing core objects:", e); }


      // Clean scene children thoroughly
      try {
        if (scene) {
          while(scene.children.length > 0){
              scene.remove(scene.children[0]);
          }
        }
      } catch (e) { console.error("Error clearing scene children:", e); }

      try {
        if (renderer) renderer.dispose();
      } catch (e) { console.error("Error disposing renderer:", e); }

      console.log("Three.js cleanup finished.");
    };
  }, []); // Empty array ensures this runs only once

  // The div where the Three.js canvas will be mounted
  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;