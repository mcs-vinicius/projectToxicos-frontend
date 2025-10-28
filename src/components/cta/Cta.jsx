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
    // REMOVED 'light' from this list, ADDED 'ambientLight'
    let camera, scene, renderer, clock, delta;
    let logoPlaneGeo = null, logoTexture = null, logoMaterial = null, logoMesh = null;
    let smokeTexture = null, smokeMaterial = null, smokeGeo = null, smokeParticles = [];
    let directionalLight = null, ambientLight = null; // ambientLight declared here
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
      logoMesh.position.z = 150;
      scene.add(logoMesh);

      // --- Lighting ---
      directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Assign to outer scope var
      directionalLight.position.set(-1, 0.5, 1);
      scene.add(directionalLight);
      ambientLight = new THREE.AmbientLight(0x666666); // Assign to outer scope var
      scene.add(ambientLight); // Make sure ambientLight is added

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
      smokeGeo = new THREE.PlaneGeometry(400, 400); // Assign to outer scope var, particles larger
      smokeParticles = []; // Reset array

       // Calculate visible width/height at smoke's average depth for better distribution
       const smokeAvgZ = -150; // Average depth where smoke will be
       const vFOV = THREE.MathUtils.degToRad(camera.fov); // Vertical FOV in radians
       const height = 2 * Math.tan(vFOV / 2) * Math.abs(smokeAvgZ - camera.position.z);
       const width = height * camera.aspect;


      for (let p = 0; p < 100; p++) { // Fewer particles
        const particleMat = smokeMaterial.clone();
        const particle = new THREE.Mesh(smokeGeo, particleMat);
        particle.position.set(
            (Math.random() - 0.5) * (width * 1.2), // Spread slightly wider than visible
            (Math.random() - 0.5) * (height * 1.2), // Spread slightly taller than visible
            (Math.random() - 1) * 500              // Position behind the logo
        );
        particle.rotation.z = Math.random() * Math.PI * 2;
        particle.material.opacity = Math.random() * 0.2 + 0.2;
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
      console.log("Cleaning up Three.js scene...");
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);

      if (renderer && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects safely
      smokeParticles.forEach(p => {
        try {
          p.geometry?.dispose(); // Optional chaining
          p.material?.map?.dispose();
          p.material?.dispose();
          scene?.remove(p);
        } catch (e) { console.error("Error disposing particle:", e); }
      });
      smokeParticles = [];

      try {
        logoPlaneGeo?.dispose();
        logoMaterial?.map?.dispose();
        logoMaterial?.dispose();
        smokeGeo?.dispose();
        smokeMaterial?.map?.dispose();
        smokeMaterial?.dispose(); // Dispose the original smoke material
        smokeTexture?.dispose();
        scene?.remove(logoMesh);
        scene?.remove(directionalLight);
        scene?.remove(ambientLight); // Ensure ambientLight is removed
      } catch (e) { console.error("Error disposing core objects:", e); }

      try {
        if (scene) {
          while(scene.children.length > 0){
              scene.remove(scene.children[0]);
          }
        }
      } catch (e) { console.error("Error clearing scene children:", e); }

      try {
        renderer?.dispose();
      } catch (e) { console.error("Error disposing renderer:", e); }

      console.log("Three.js cleanup finished.");
    };
  }, []); // Empty array ensures this runs only once

  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;