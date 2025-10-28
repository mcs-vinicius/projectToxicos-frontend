import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// Stats.js is removed
import './Cta.css'; // Import CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Import the logo

const Cta = () => {
  const mountRef = useRef(null); // Ref for the container div

  useEffect(() => {
    // --- Three.js Variables ---
    let camera, scene, renderer, clock, delta;
    let logoPlaneGeo, logoTexture, logoMaterial, logoMesh; // Variables for the logo
    let smokeTexture, smokeMaterial, smokeGeo, smokeParticles = []; // Variables for smoke
    let directionalLight, ambientLight; // Lights
    let animationFrameId; // To control the animation loop

    const currentMount = mountRef.current; // Store the current ref

    // --- Initialization Function ---
    function init() {
      // --- Clock ---
      clock = new THREE.Clock();

      // --- Renderer ---
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Transparent background, smoother edges
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight); // Set size based on container
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Adjust for high-DPI screens
      currentMount.appendChild(renderer.domElement); // Add canvas to the DOM

      // --- Scene ---
      scene = new THREE.Scene();

      // --- Camera ---
      camera = new THREE.PerspectiveCamera(
        75, // Field of View
        currentMount.clientWidth / currentMount.clientHeight, // Aspect Ratio
        1, // Near plane
        10000 // Far plane
      );
      camera.position.z = 600; // Position the camera
      scene.add(camera);

      // --- Logo ---
      const textureLoader = new THREE.TextureLoader();
      logoTexture = textureLoader.load(logoTextureUrl); // Load the logo image
      logoPlaneGeo = new THREE.PlaneGeometry(300, 300); // Geometry for the logo plane

      logoMaterial = new THREE.MeshLambertMaterial({ // Use Lambert material for lighting interaction
        map: logoTexture,
        transparent: true, // Enable transparency
        alphaTest: 0.1, // Discard nearly transparent pixels (adjust if needed)
        side: THREE.DoubleSide, // Render both sides
        depthWrite: false, // Helps with transparency layering
        depthTest: true, // Respect depth order
      });

      logoMesh = new THREE.Mesh(logoPlaneGeo, logoMaterial);
      logoMesh.position.z = 100; // <<< POSITION LOGO IN FRONT (smaller z is closer)
      scene.add(logoMesh);

      // --- Lighting ---
      directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Brighter directional light
      directionalLight.position.set(-1, 0.8, 1);
      scene.add(directionalLight);
      ambientLight = new THREE.AmbientLight(0x777777); // Slightly brighter ambient light
      scene.add(ambientLight);

      // --- Smoke ---
      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14, // Toxic Green
        map: smokeTexture,
        transparent: true,
        opacity: 0.45, // Slightly adjusted opacity
        blending: THREE.AdditiveBlending, // Good for glowing effects
        depthWrite: false, // Crucial for multiple transparent layers
        side: THREE.DoubleSide,
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300); // Size of smoke particles
      smokeParticles = [];

      for (let p = 0; p < 120; p++) { // Slightly fewer particles
        const particle = new THREE.Mesh(smokeGeo, smokeMaterial.clone()); // Clone material for potential individual tweaks
        particle.position.set(
          (Math.random() - 0.5) * 800, // Spread particles wider (X)
          (Math.random() - 0.5) * 600, // Spread particles wider (Y)
          (Math.random() - 0.8) * 400   // <<< POSITION SMOKE BEHIND logo (larger negative z is further away)
        );
        particle.rotation.z = Math.random() * Math.PI * 2;
        particle.material.opacity = Math.random() * 0.3 + 0.2; // Randomize opacity slightly
        scene.add(particle);
        smokeParticles.push(particle);
      }
    }

    // --- Animation Loop ---
    function animate() {
      delta = clock.getDelta(); // Time difference
      animationFrameId = requestAnimationFrame(animate); // Schedule next frame
      evolveSmoke(); // Update smoke animation
      render(); // Render the scene
    }

    // --- Update Smoke ---
    function evolveSmoke() {
      smokeParticles.forEach(particle => {
        particle.rotation.z += delta * 0.1; // Slower rotation
        // Optional: Add slight movement
        // particle.position.y += delta * 5;
        // if (particle.position.y > 300) particle.position.y = -300;
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);

      // Remove canvas from DOM
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
      if (logoPlaneGeo) logoPlaneGeo.dispose();
      if (logoMaterial) {
        if (logoMaterial.map) logoMaterial.map.dispose();
        logoMaterial.dispose();
      }
      if (smokeTexture) smokeTexture.dispose();
      scene.remove(logoMesh);
      scene.remove(directionalLight);
      scene.remove(ambientLight);

      // Force scene cleanup if necessary
      while(scene.children.length > 0){
          scene.remove(scene.children[0]);
      }
      if (renderer) renderer.dispose();

      console.log("Three.js scene cleaned up"); // For debugging cleanup
    };
  }, []); // Empty array ensures this runs only once

  // The div where the Three.js canvas will be mounted
  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;