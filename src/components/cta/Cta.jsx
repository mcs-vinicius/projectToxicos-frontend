import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// REMOVED: import Stats from 'stats.js';
import './Cta.css'; // Import CSS
import logoTextureUrl from "../../assets/logo/logoFE.png"; // Import the logo

const Cta = () => {
  const mountRef = useRef(null); // Ref for the container div

  useEffect(() => {
    // --- Three.js Variables ---
    // Declare variables needed in cleanup/scope here
    let camera, scene, renderer, clock, delta;
    // CORRECTED: Declared logoMaterial and logoMesh here
    let textGeo = null, textTexture = null, logoMaterial = null, logoMesh = null;
    let smokeTexture = null, smokeMaterial = null, smokeGeo = null, smokeParticles = [];
    let ambientLight = null;
    let directionalLight = null;
    let animationFrameId;

    const currentMount = mountRef.current;

    function init() {
      clock = new THREE.Clock();
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentMount.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 10000);
      camera.position.z = 600;
      scene.add(camera);

      const textureLoader = new THREE.TextureLoader();
      textTexture = textureLoader.load(logoTextureUrl);
      textGeo = new THREE.PlaneGeometry(300, 300);

      // Assign to outer scope logoMaterial
      logoMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        depthWrite: false,
        opacity: 1,
        side: THREE.DoubleSide,
        alphaTest: 0.1
      });
      // Assign to outer scope logoMesh
      logoMesh = new THREE.Mesh(textGeo, logoMaterial);
      logoMesh.position.z = 150;
      logoMesh.renderOrder = 1;
      scene.add(logoMesh);

      directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(-1, 0.5, 1);
      scene.add(directionalLight);
      ambientLight = new THREE.AmbientLight(0x666666);
      scene.add(ambientLight);

      smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
      smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x39FF14,
        map: smokeTexture,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      smokeGeo = new THREE.PlaneGeometry(400, 400);
      smokeParticles = [];

      const smokeAvgZ = -150;
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const height = 2 * Math.tan(vFOV / 2) * Math.abs(smokeAvgZ - camera.position.z);
      const width = height * camera.aspect;

      for (let p = 0; p < 100; p++) {
        const particleMat = smokeMaterial.clone();
        const particle = new THREE.Mesh(smokeGeo, particleMat);
        particle.position.set(
          (Math.random() - 0.5) * (width * 1.3),
          (Math.random() - 0.5) * (height * 1.3),
          (Math.random() - 1) * 500
        );
        particle.rotation.z = Math.random() * Math.PI * 2;
        particle.material.opacity = Math.random() * 0.2 + 0.25;
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
      smokeParticles.forEach(particle => {
        particle.rotation.z += (delta * 0.1);
      });
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

      if (renderer && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      smokeParticles.forEach(p => {
        try {
          p.geometry?.dispose();
          p.material?.map?.dispose();
          p.material?.dispose();
          scene?.remove(p);
        } catch (e) { console.error("Error disposing particle:", e); }
      });
      smokeParticles = [];

      try {
        textGeo?.dispose();
        // CORRECTED: Use logoMaterial and logoMesh from outer scope
        logoMaterial?.map?.dispose();
        logoMaterial?.dispose();
        smokeGeo?.dispose();
        smokeMaterial?.map?.dispose();
        smokeMaterial?.dispose();
        smokeTexture?.dispose();
        // CORRECTED: Use logoMesh from outer scope
        scene?.remove(logoMesh);
        scene?.remove(directionalLight);
        scene?.remove(ambientLight);
      } catch (e) { console.error("Error disposing core objects:", e); }

      try {
        if (scene) {
          while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
          }
        }
      } catch (e) { console.error("Error clearing scene children:", e); }

      try {
        renderer?.dispose();
      } catch (e) { console.error("Error disposing renderer:", e); }
    };
  }, []); // Empty dependency array

  return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;