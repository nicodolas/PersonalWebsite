"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface Node {
    id: string;
    description?: string;
    description_vi?: string;
    group: string;
    stars?: number;
    forks?: number;
    size: number;
    tech: string[];
    githubUrl?: string;
}

interface Planet3DConfig extends Node {
    orbitRadius: number;
    orbitSpeed: number;
    orbitPhase: number;
    inclination: number;
    tiltAxis: number;
    color: THREE.Color;
    glowColor: THREE.Color;
}

interface GalaxySceneProps {
    nodes: Node[];
    links: { source: string; target: string }[];
    onSelectNode: (node: Node | null) => void;
    selectedId: string | null;
    onToggleOrbit?: (isOrbiting: boolean) => void;
}

function getGroupColor(group: string): THREE.Color {
    const g = group.toLowerCase();
    if (g.includes("react") || g.includes("next") || g.includes("frontend"))
        return new THREE.Color(0x00ccff);
    if (g.includes("node") || g.includes("express") || g.includes("backend"))
        return new THREE.Color(0xff5555);
    if (g.includes("n8n") || g.includes("docker") || g.includes("automation"))
        return new THREE.Color(0xbd93f9);
    return new THREE.Color(0x00ff66);
}

function buildPlanets(nodes: Node[]): Planet3DConfig[] {
    const sorted = [...nodes].sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        return b.size - a.size;
    });
    return sorted.map((node, i) => {
        const band = i % 3;
        const orbitRadius = 2.5 + band * 1.8 + (i % 5) * 0.35;
        const orbitPhase = i * 2.399;
        const orbitSpeed = (0.18 + (2 - band) * 0.1 + (i % 4) * 0.04) * (i % 2 === 0 ? 1 : -1);
        const inclination = (0.15 + band * 0.2 + (i % 3) * 0.1) * (i % 2 === 0 ? 1 : -1);
        const tiltAxis = i * 1.1;
        const color = getGroupColor(node.group);
        const glowColor = color.clone().multiplyScalar(1.4);
        return { ...node, orbitRadius, orbitSpeed, orbitPhase, inclination, tiltAxis, color, glowColor };
    });
}

export default function GalaxyScene({
    nodes,
    links,
    onSelectNode,
    selectedId,
    onToggleOrbit,
}: GalaxySceneProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const frameRef = useRef<number>(0);
    const planetsRef = useRef<Planet3DConfig[]>([]);
    const planetMeshesRef = useRef<THREE.Mesh[]>([]);
    const anglesRef = useRef<number[]>([]);
    const isOrbitingRef = useRef(true);
    const mouseRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const prevMouseRef = useRef({ x: 0, y: 0 });
    const cameraAngleRef = useRef({ theta: 0.35, phi: 1.1, radius: 11 });
    const labelCanvasesRef = useRef<THREE.Sprite[]>([]);
    const lineMeshesRef = useRef<THREE.Line[]>([]);
    const selectedIdRef = useRef<string | null>(null);

    // Keep selectedId in ref for animation loop access
    useEffect(() => {
        selectedIdRef.current = selectedId;
        // Scale up selected planet to highlight it (BasicMaterial has no emissiveIntensity)
        planetMeshesRef.current.forEach((mesh, i) => {
            const planet = planetsRef.current[i];
            if (!planet || !mesh) return;
            if (planet.id === selectedId) {
                mesh.scale.setScalar(1.35);
            } else {
                mesh.scale.setScalar(1.0);
            }
        });
    }, [selectedId]);

    // Listen for orbit toggle from parent button and keyboard Space
    useEffect(() => {
        const handleToggle = () => {
            isOrbitingRef.current = !isOrbitingRef.current;
            onToggleOrbit?.(isOrbitingRef.current);
        };
        const handleKey = (e: KeyboardEvent) => { if (e.code === "Space") handleToggle(); };
        window.addEventListener("galaxy:toggleOrbit" as keyof WindowEventMap, handleToggle);
        window.addEventListener("keydown", handleKey);
        return () => {
            window.removeEventListener("galaxy:toggleOrbit" as keyof WindowEventMap, handleToggle);
            window.removeEventListener("keydown", handleKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const makeLabelSprite = useCallback((text: string, color: string): THREE.Sprite => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, 256, 64);
        ctx.font = "bold 22px monospace";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 128, 32);
        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.6, 0.4, 1);
        return sprite;
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;

        // --- Scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x03050a);
        // No fog — fog desaturates distant planets, killing color vibrancy
        sceneRef.current = scene;

        // --- Camera ---
        const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
        cameraRef.current = camera;

        const updateCamera = () => {
            const { theta, phi, radius } = cameraAngleRef.current;
            camera.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            camera.lookAt(0, 0, 0);
        };
        updateCamera();

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = false;
        // Neutral tone mapping — colors render exactly as specified, no darkening
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // --- Star field ---
        const starCount = 2500;
        const starGeom = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 30 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.cos(phi);
            starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
            // Slight color variation: blue-white, warm white, cool cyan
            const t = Math.random();
            if (t < 0.12) { starColors[i * 3] = 0.4; starColors[i * 3 + 1] = 0.7; starColors[i * 3 + 2] = 1.0; }
            else if (t < 0.22) { starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 0.6; }
            else { starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1.0; }
        }
        starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        starGeom.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.85 });
        scene.add(new THREE.Points(starGeom, starMat));

        // --- Nebula clouds (soft glow planes) ---
        const nebulaColors = [0x001133, 0x0a0020, 0x001a0a];
        for (let n = 0; n < 3; n++) {
            const nebGeom = new THREE.PlaneGeometry(45, 30);
            const nebMat = new THREE.MeshBasicMaterial({
                color: nebulaColors[n],
                transparent: true,
                opacity: 0.18,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            const neb = new THREE.Mesh(nebGeom, nebMat);
            neb.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            neb.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 20);
            scene.add(neb);
        }

        // --- Core Sun (solar colors: white-yellow core → orange corona) ---
        const sunGeom = new THREE.SphereGeometry(0.55, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff4c2 }); // hot white-yellow core
        const sun = new THREE.Mesh(sunGeom, sunMat);
        scene.add(sun);
        // Corona glow rings: inner yellow → outer deep orange
        const coronaColors = [0xffe066, 0xff9a00, 0xff5500];
        const coronaOpacities = [0.22, 0.13, 0.06];
        for (let i = 0; i < 3; i++) {
            const glowGeom = new THREE.SphereGeometry(0.7 + i * 0.35, 24, 24);
            const glowMat = new THREE.MeshBasicMaterial({
                color: coronaColors[i],
                transparent: true,
                opacity: coronaOpacities[i],
                side: THREE.BackSide,
                depthWrite: false,
            });
            scene.add(new THREE.Mesh(glowGeom, glowMat));
        }

        // --- Build planets ---
        const planets = buildPlanets(nodes);
        planetsRef.current = planets;
        anglesRef.current = planets.map(p => p.orbitPhase);

        const planetMeshes: THREE.Mesh[] = [];
        const labelSprites: THREE.Sprite[] = [];

        planets.forEach((planet, i) => {
            const r = Math.max(0.08, (planet.size || 5) * 0.028);

            // Orbit path — sample using the same trig as the animation loop
            // so the drawn path matches the planet's actual trajectory exactly
            const orbitPoints: THREE.Vector3[] = [];
            const cosI = Math.cos(planet.inclination);
            const sinI = Math.sin(planet.inclination);
            const cosA = Math.cos(planet.tiltAxis);
            const sinA = Math.sin(planet.tiltAxis);
            const steps = 128;
            for (let s = 0; s <= steps; s++) {
                const t = (s / steps) * Math.PI * 2;
                const lx = planet.orbitRadius * Math.cos(t);
                const ly = planet.orbitRadius * Math.sin(t);
                orbitPoints.push(new THREE.Vector3(
                    lx * cosA - ly * sinA * cosI,
                    ly * sinI,
                    lx * sinA + ly * cosA * cosI
                ));
            }
            const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMat = new THREE.LineBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.1,
                depthWrite: false,
            });
            const orbitLine = new THREE.Line(orbitGeom, orbitMat);
            scene.add(orbitLine);

            // Planet mesh — MeshBasicMaterial: unlit, color always 100% vivid regardless of lighting
            const geom = new THREE.SphereGeometry(r, 24, 24);
            const mat = new THREE.MeshBasicMaterial({
                color: planet.color,
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.userData = { planetIndex: i };
            scene.add(mesh);
            planetMeshes.push(mesh);

            // Glow halo — larger and more opaque for neon glow effect
            const haloGeom = new THREE.SphereGeometry(r * 2.2, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.18,
                side: THREE.BackSide,
                depthWrite: false,
            });
            const halo = new THREE.Mesh(haloGeom, haloMat);
            mesh.add(halo);

            // Outer soft halo
            const outerHaloGeom = new THREE.SphereGeometry(r * 3.5, 16, 16);
            const outerHaloMat = new THREE.MeshBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.06,
                side: THREE.BackSide,
                depthWrite: false,
            });
            mesh.add(new THREE.Mesh(outerHaloGeom, outerHaloMat));

            // Label
            const hexColor = `#${planet.color.getHexString()}`;
            const label = makeLabelSprite(planet.id, hexColor);
            label.userData = { planetIndex: i };
            scene.add(label);
            labelSprites.push(label);
        });

        planetMeshesRef.current = planetMeshes;
        labelCanvasesRef.current = labelSprites;

        // --- Connection lines between planets ---
        const lineObjects: THREE.Line[] = [];
        links.forEach(link => {
            const si = planets.findIndex(n => n.id === link.source);
            const ti = planets.findIndex(n => n.id === link.target);
            if (si === -1 || ti === -1) return;
            const geom = new THREE.BufferGeometry();
            geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
            const col = planets[si].color;
            const mat = new THREE.LineBasicMaterial({
                color: col,
                transparent: true,
                opacity: 0.12,
                depthWrite: false,
            });
            const line = new THREE.Line(geom, mat);
            line.userData = { source: si, target: ti, baseColor: col };
            scene.add(line);
            lineObjects.push(line);
        });
        lineMeshesRef.current = lineObjects;

        // --- Raycaster for click/hover ---
        const raycaster = new THREE.Raycaster();
        raycaster.params.Points = { threshold: 0.15 };

        const getIntersectedPlanet = (clientX: number, clientY: number): number | null => {
            const rect = mount.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
            const hits = raycaster.intersectObjects(planetMeshes);
            if (hits.length > 0) return hits[0].object.userData.planetIndex as number;
            return null;
        };

        // --- Mouse / Touch events ---
        const onMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = false;
            prevMouseRef.current = { x: e.clientX, y: e.clientY };
            mount.addEventListener("mousemove", onMouseDrag);
            mount.addEventListener("mouseup", onMouseUp);
        };

        const onMouseDrag = (e: MouseEvent) => {
            const dx = e.clientX - prevMouseRef.current.x;
            const dy = e.clientY - prevMouseRef.current.y;
            if (Math.abs(dx) + Math.abs(dy) > 3) isDraggingRef.current = true;
            cameraAngleRef.current.theta -= dx * 0.006;
            cameraAngleRef.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, cameraAngleRef.current.phi + dy * 0.006));
            prevMouseRef.current = { x: e.clientX, y: e.clientY };
            updateCamera();
        };

        const onMouseUp = (e: MouseEvent) => {
            mount.removeEventListener("mousemove", onMouseDrag);
            mount.removeEventListener("mouseup", onMouseUp);
            if (!isDraggingRef.current) {
                const idx = getIntersectedPlanet(e.clientX, e.clientY);
                if (idx !== null) {
                    onSelectNode(planets[idx]);
                } else {
                    onSelectNode(null);
                }
            }
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            cameraAngleRef.current.radius = Math.max(4, Math.min(22, cameraAngleRef.current.radius + e.deltaY * 0.012));
            updateCamera();
        };

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        mount.addEventListener("mousedown", onMouseDown);
        mount.addEventListener("mousemove", onMouseMove);
        mount.addEventListener("wheel", onWheel, { passive: false });

        // Touch support
        let touchStart = { x: 0, y: 0 };
        let touchMoved = false;
        const onTouchStart = (e: TouchEvent) => {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            touchMoved = false;
        };
        const onTouchMove = (e: TouchEvent) => {
            const dx = e.touches[0].clientX - touchStart.x;
            const dy = e.touches[0].clientY - touchStart.y;
            if (Math.abs(dx) + Math.abs(dy) > 5) touchMoved = true;
            cameraAngleRef.current.theta -= dx * 0.006;
            cameraAngleRef.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, cameraAngleRef.current.phi + dy * 0.006));
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            updateCamera();
        };
        const onTouchEnd = (e: TouchEvent) => {
            if (!touchMoved) {
                const t = e.changedTouches[0];
                const idx = getIntersectedPlanet(t.clientX, t.clientY);
                if (idx !== null) onSelectNode(planets[idx]);
                else onSelectNode(null);
            }
        };
        mount.addEventListener("touchstart", onTouchStart, { passive: true });
        mount.addEventListener("touchmove", onTouchMove, { passive: true });
        mount.addEventListener("touchend", onTouchEnd, { passive: true });

        // --- Resize ---
        const onResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener("resize", onResize);

        // --- Animation loop ---
        let lastTime = performance.now();
        let sunPulse = 0;

        const animate = (now: number) => {
            frameRef.current = requestAnimationFrame(animate);
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            sunPulse += dt;

            // Sun pulse
            const s = 1 + 0.08 * Math.sin(sunPulse * 2.2);
            sun.scale.setScalar(s);

            // Slow auto-rotate camera when not dragging
            if (!isDraggingRef.current) {
                cameraAngleRef.current.theta += dt * 0.04;
                updateCamera();
            }

            // Orbit planets
            if (isOrbitingRef.current) {
                anglesRef.current = anglesRef.current.map((a, i) => a + planets[i].orbitSpeed * dt);
            }

            // Update planet positions — same trig as orbit path generation
            planets.forEach((planet, i) => {
                const theta = anglesRef.current[i];
                const cosT = Math.cos(theta), sinT = Math.sin(theta);
                const cosI = Math.cos(planet.inclination);
                const sinI = Math.sin(planet.inclination);
                const cosA = Math.cos(planet.tiltAxis);
                const sinA = Math.sin(planet.tiltAxis);
                const lx = planet.orbitRadius * cosT;
                const ly = planet.orbitRadius * sinT;
                const x = lx * cosA - ly * sinA * cosI;
                const y = ly * sinI;
                const z = lx * sinA + ly * cosA * cosI;
                planetMeshes[i].position.set(x, y, z);
                planetMeshes[i].rotation.y += dt * 0.4;

                // Label follows planet, offset upward
                const r = Math.max(0.08, (planet.size || 5) * 0.028);
                labelSprites[i].position.set(x, y + r + 0.35, z);

                // Dim label based on distance to camera
                const dist = camera.position.distanceTo(new THREE.Vector3(x, y, z));
                const labelMat = labelSprites[i].material as THREE.SpriteMaterial;
                labelMat.opacity = Math.max(0, Math.min(1, 2.5 - dist * 0.18));
            });

            // Update connection lines
            lineObjects.forEach(line => {
                const si = line.userData.source as number;
                const ti = line.userData.target as number;
                const sp = planetMeshes[si].position;
                const tp = planetMeshes[ti].position;
                const pos = line.geometry.attributes.position as THREE.BufferAttribute;
                pos.setXYZ(0, sp.x, sp.y, sp.z);
                pos.setXYZ(1, tp.x, tp.y, tp.z);
                pos.needsUpdate = true;
                const mat = line.material as THREE.LineBasicMaterial;
                const sel = selectedIdRef.current;
                if (sel) {
                    const isConnected =
                        planets[si].id === sel || planets[ti].id === sel;
                    mat.opacity = isConnected ? 0.65 : 0.03;
                } else {
                    mat.opacity = 0.12;
                }
            });

            renderer.render(scene, camera);
        };
        frameRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            cancelAnimationFrame(frameRef.current);
            mount.removeEventListener("mousedown", onMouseDown);
            mount.removeEventListener("mousemove", onMouseMove);
            mount.removeEventListener("wheel", onWheel);
            mount.removeEventListener("touchstart", onTouchStart);
            mount.removeEventListener("touchmove", onTouchMove);
            mount.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("resize", onResize);

            // Dispose all scene geometries, materials, and textures to prevent GPU memory leaks.
            // renderer.dispose() alone only releases the GL context — it does NOT free
            // BufferGeometry index buffers, material uniforms, or CanvasTexture uploads.
            scene.traverse((obj) => {
                if ((obj as THREE.Mesh).isMesh || obj instanceof THREE.Line || obj instanceof THREE.Points || obj instanceof THREE.Sprite) {
                    const mesh = obj as THREE.Mesh;
                    mesh.geometry?.dispose();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach((m) => {
                            // Dispose any textures referenced by the material
                            Object.values(m).forEach((v) => {
                                if (v instanceof THREE.Texture) v.dispose();
                            });
                            m.dispose();
                        });
                    } else if (mesh.material) {
                        Object.values(mesh.material).forEach((v) => {
                            if (v instanceof THREE.Texture) v.dispose();
                        });
                        (mesh.material as THREE.Material).dispose();
                    }
                }
            });

            renderer.dispose();
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes, links]);

    return (
        <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ minHeight: 480 }}
        />
    );
}
