import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// A dependência 'stats.js' foi removida.
import './Cta.css';
import logoTextureUrl from "../../assets/logo/logoFE.png";

const Cta = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // --- Declaração de Variáveis ---
        // Declaradas aqui para estarem acessíveis em todo o useEffect, incluindo a função de limpeza.
        let camera, scene, renderer, clock;
        let smokeParticles = [];
        let animationFrameId;
        let logoMesh, directionalLight, ambientLight;
        let smokeGeo, smokeMaterial, smokeTexture, logoPlaneGeo, logoMaterial, logoTexture;

        const currentMount = mountRef.current;

        // --- Função de Inicialização da Cena ---
        function init() {
            clock = new THREE.Clock();

            // --- Renderer (quem desenha a cena) ---
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            currentMount.appendChild(renderer.domElement);

            // --- Cena ---
            scene = new THREE.Scene();

            // --- Câmera ---
            camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 10000);
            camera.position.z = 600; // Posição da câmera
            scene.add(camera);

            const textureLoader = new THREE.TextureLoader();

            // --- Logo ---
            logoTexture = textureLoader.load(logoTextureUrl);
            logoPlaneGeo = new THREE.PlaneGeometry(300, 300);
            logoMaterial = new THREE.MeshLambertMaterial({
                map: logoTexture,
                transparent: true,
                alphaTest: 0.1,
                depthWrite: false,
                depthTest: true,
            });
            logoMesh = new THREE.Mesh(logoPlaneGeo, logoMaterial);
            logoMesh.position.z = 150; // Z-INDEX: Posição mais próxima da câmera
            scene.add(logoMesh);

            // --- Luzes ---
            directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(-1, 0.5, 1);
            scene.add(directionalLight);
            ambientLight = new THREE.AmbientLight(0x777777);
            scene.add(ambientLight);

            // --- Fumaça ---
            smokeTexture = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
            smokeMaterial = new THREE.MeshLambertMaterial({
                color: 0x39FF14, // Verde Tóxico
                map: smokeTexture,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            smokeGeo = new THREE.PlaneGeometry(400, 400); // Partículas maiores

            // Calcula a largura visível da cena para espalhar a fumaça
            const visibleHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * 2;
            const visibleWidth = visibleHeight * camera.aspect;

            for (let i = 0; i < 100; i++) {
                const particle = new THREE.Mesh(smokeGeo, smokeMaterial.clone());
                particle.position.set(
                    (Math.random() - 0.5) * (visibleWidth * 1.5), // Espalha em 150% da largura visível
                    (Math.random() - 0.5) * 800, // Espalha na altura
                    (Math.random() - 1) * 500     // Z-INDEX: Garante que fique atrás do logo
                );
                particle.rotation.z = Math.random() * Math.PI * 2;
                particle.material.opacity = Math.random() * 0.2 + 0.2; // Opacidade aleatória
                scene.add(particle);
                smokeParticles.push(particle);
            }
        }

        // --- Loop de Animação ---
        function animate() {
            const delta = clock.getDelta();
            animationFrameId = requestAnimationFrame(animate);

            // Animação da fumaça
            smokeParticles.forEach(particle => {
                particle.rotation.z += delta * 0.1;
            });

            renderer.render(scene, camera);
        }

        // --- Redimensionamento da Janela ---
        function onWindowResize() {
            if (currentMount) {
                const width = currentMount.clientWidth;
                const height = currentMount.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        }

        // --- Inicia tudo ---
        init();
        window.addEventListener('resize', onWindowResize, false);
        animate();

        // --- Função de Limpeza (executa quando o componente é desmontado) ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onWindowResize);

            if (renderer && renderer.domElement && currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }

            // Libera a memória dos objetos Three.js
            smokeParticles.forEach(p => {
                p.geometry?.dispose();
                p.material?.map?.dispose();
                p.material?.dispose();
                scene?.remove(p);
            });
            logoPlaneGeo?.dispose();
            logoMaterial?.map?.dispose();
            logoMaterial?.dispose();
            smokeGeo?.dispose();
            smokeMaterial?.map?.dispose();
            smokeMaterial?.dispose();
            scene?.remove(logoMesh, directionalLight, ambientLight);

            renderer?.dispose();
        };
    }, []); // Array vazio garante que o useEffect rode apenas uma vez.

    // O div que serve de container para a animação
    return <div ref={mountRef} style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }} />;
};

export default Cta;