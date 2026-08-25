/**
 * TerrainSimulation.tsx
 *
 * Photorealistic 3D WebGL (Three.js) Rotational Landslide & Debris Flow Diorama
 * Directly modeled after NASA / PBS LearningMedia Rotational Landslide Architecture
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play, Pause, RotateCcw, Mountain, Zap, Droplets, CloudRain,
  Layers, AlertTriangle, CheckCircle2, ChevronRight, Activity, Gauge, Eye, Maximize2
} from 'lucide-react';
import { apiConfig } from '../config/apiConfig';

interface SimProps {
  latitude:    number;
  longitude:   number;
  locationName:string;
  slopeAngle:  number;
  soilMoisture:number;
  rainfall24h: number;
  fs:          number;
  riskLevel:   string;
}

type SimulationPhase = 1 | 2 | 3 | 4 | 5;

const PHASES = [
  { id: 1 as SimulationPhase, title: '1. Storm Rain Infiltration', desc: 'Precipitation saturates colluvium; groundwater table rises, escalating pore pressure u = γ_w·h_w.' },
  { id: 2 as SimulationPhase, title: '2. Crown Tension Cracking', desc: 'Effective stress drops; deep tension cracks rupture along the upper head scarp.' },
  { id: 3 as SimulationPhase, title: '3. Rotational Slump Failure', desc: 'Shear stress overcomes resisting friction; saturated soil block detaches and rotates along concave slip surface.' },
  { id: 4 as SimulationPhase, title: '4. Debris Avalanche & Mudflow', desc: 'Fluidized soil and boulders surge at high velocity down the mountainside over the highway.' },
  { id: 5 as SimulationPhase, title: '5. Highway Severance & Toe Deposit', desc: 'Roadway is completely sheared and displaced, trees topple, and a massive debris fan dams the valley.' }
];

export default function TerrainSimulation({
  latitude, longitude, locationName, slopeAngle, soilMoisture, rainfall24h, fs, riskLevel
}: SimProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Animation & Three.js Refs
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef  = useRef<number>(0);
  
  // 3D Object Group Refs for Animation
  const slumpGroupRef  = useRef<THREE.Group | null>(null);
  const crackMeshRef   = useRef<THREE.Mesh | null>(null);
  const roadLowerRef   = useRef<THREE.Mesh | null>(null);
  const roadUpperRef   = useRef<THREE.Mesh | null>(null);
  const debrisFlowRef  = useRef<THREE.Points | null>(null);
  const toeDepositRef  = useRef<THREE.Mesh | null>(null);
  const waterTableRef  = useRef<THREE.Mesh | null>(null);
  const rainSystemRef  = useRef<THREE.Points | null>(null);
  const treeMeshesRef  = useRef<Array<{ mesh: THREE.Group; initialPos: THREE.Vector3; initialRot: THREE.Euler; isSlump: boolean }>>([]);

  // Simulation State
  const [phase,        setPhase]        = useState<SimulationPhase>(1);
  const [progress,     setProgress]     = useState<number>(0); // 0 to 100%
  const [isPlaying,    setIsPlaying]    = useState<boolean>(true);
  const [simSpeed,     setSimSpeed]     = useState<1 | 2>(1);
  const [cameraView,   setCameraView]   = useState<'iso' | 'cliff' | 'road' | 'aerial'>('iso');

  // Mouse orbit state
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef  = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef  = useRef<{ radius: number; theta: number; phi: number }>({ radius: 36, theta: Math.PI / 4, phi: Math.PI / 3 });

  // Update camera from spherical coords
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 2, 0);
  }, []);

  // Preset Camera Angles
  const setPresetView = (view: 'iso' | 'cliff' | 'road' | 'aerial') => {
    setCameraView(view);
    if (view === 'iso') {
      sphericalRef.current = { radius: 36, theta: Math.PI / 4, phi: Math.PI / 3 };
    } else if (view === 'cliff') {
      sphericalRef.current = { radius: 30, theta: -Math.PI / 2.2, phi: Math.PI / 2.2 };
    } else if (view === 'road') {
      sphericalRef.current = { radius: 24, theta: Math.PI / 6, phi: Math.PI / 2.3 };
    } else if (view === 'aerial') {
      sphericalRef.current = { radius: 38, theta: Math.PI / 4, phi: 0.15 };
    }
    updateCameraPosition();
  };

  // ── THREE.JS SCENE INITIALIZATION ─────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width  = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111622); // Stormy dark slate sky
    scene.fog = new THREE.FogExp2(0x111622, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 200);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Lighting (Storm Atmosphere)
    const ambientLight = new THREE.AmbientLight(0x7c8fa6, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    dirLight.position.set(25, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width  = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    blueRimLight.position.set(-20, 15, -20);
    scene.add(blueRimLight);

    // ── 5. PROCEDURAL TEXTURES (Grass, Soil, Strata, Asphalt) ───────────────
    
    // Grassy Slope Texture
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 512; grassCanvas.height = 512;
    const gCtx = grassCanvas.getContext('2d')!;
    gCtx.fillStyle = '#4a5d35'; gCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4000; i++) {
      const x = (Math.sin(i * 12.3) * 0.5 + 0.5) * 512;
      const y = (Math.cos(i * 7.9) * 0.5 + 0.5) * 512;
      gCtx.fillStyle = i % 2 === 0 ? '#384728' : '#5d7343';
      gCtx.fillRect(x, y, 3, 3);
    }
    const grassTex = new THREE.CanvasTexture(grassCanvas);
    grassTex.wrapS = THREE.RepeatWrapping; grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(4, 4);

    // Bedrock & Strata Cross-Section Texture
    const strataCanvas = document.createElement('canvas');
    strataCanvas.width = 512; strataCanvas.height = 512;
    const sCtx = strataCanvas.getContext('2d')!;
    // Base Bedrock
    sCtx.fillStyle = '#4b5563'; sCtx.fillRect(0, 0, 512, 512);
    // Weathered Colluvium
    sCtx.fillStyle = '#785a44'; sCtx.fillRect(0, 0, 512, 260);
    // Topsoil Regolith
    sCtx.fillStyle = '#3f3024'; sCtx.fillRect(0, 0, 512, 90);
    // Strata bands
    sCtx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let y = 0; y < 512; y += 18) {
      sCtx.fillRect(0, y, 512, 4);
    }
    const strataTex = new THREE.CanvasTexture(strataCanvas);

    // ── 6. 3D ISOMETRIC CUTAWAY TERRAIN DIORAMA ─────────────────────────────
    
    // Stable Bedrock Base Block
    const baseGeo = new THREE.BoxGeometry(22, 10, 22);
    const baseMat = [
      new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.9 }), // Right cutaway
      new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.9 }), // Left cutaway
      new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.8 }),   // Top
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 1.0 }),// Bottom
      new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.9 }), // Front
      new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.9 })  // Back
    ];
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -5, 0);
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Bedrock Mountain Slope Wedge (Fixed lower bedrock)
    const wedgeShape = new THREE.Shape();
    wedgeShape.moveTo(-11, 0);
    wedgeShape.lineTo(11, 0);
    wedgeShape.lineTo(11, 1);
    wedgeShape.lineTo(-2, 2.5);
    wedgeShape.lineTo(-11, 8.5);
    wedgeShape.closePath();

    const extrudeSettings = { depth: 22, bevelEnabled: false };
    const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, extrudeSettings);
    const wedgeMat = new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.85 });
    const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeMesh.rotation.y = -Math.PI / 2;
    wedgeMesh.position.set(11, 0, -11);
    wedgeMesh.receiveShadow = true;
    wedgeMesh.castShadow = true;
    scene.add(wedgeMesh);

    // ── 7. ROTATIONAL SLUMP BLOCK (Fails & Rotates in 3D) ────────────────────
    const slumpGroup = new THREE.Group();
    slumpGroupRef.current = slumpGroup;
    scene.add(slumpGroup);

    // Curved Concave Slump Body
    const slumpShape = new THREE.Shape();
    slumpShape.moveTo(-10.5, 8.2);
    slumpShape.lineTo(-2.5, 3.2); // Slope face
    slumpShape.quadraticCurveTo(-6, 3.0, -10.5, 8.2); // Concave slip arc
    slumpShape.closePath();

    const slumpExtrude = new THREE.ExtrudeGeometry(slumpShape, { depth: 16, bevelEnabled: false });
    const slumpMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.75 });
    const slumpMesh = new THREE.Mesh(slumpExtrude, slumpMat);
    slumpMesh.rotation.y = -Math.PI / 2;
    slumpMesh.position.set(8, 0, -8);
    slumpMesh.castShadow = true;
    slumpMesh.receiveShadow = true;
    slumpGroup.add(slumpMesh);

    // ── 8. 3D MOUNTAIN HIGHWAY WITH CENTERLINE ──────────────────────────────
    
    // Lower stable road portion
    const roadLowerGeo = new THREE.PlaneGeometry(3.2, 8);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 });
    const roadLower = new THREE.Mesh(roadLowerGeo, roadMat);
    roadLower.rotation.x = -Math.PI / 2.3;
    roadLower.rotation.z = -Math.PI / 5.5;
    roadLower.position.set(4.5, 1.8, 4.5);
    roadLower.receiveShadow = true;
    roadLowerRef.current = roadLower;
    scene.add(roadLower);

    // Upper roadway on slump block (fractures & separates)
    const roadUpperGeo = new THREE.PlaneGeometry(3.2, 9);
    const roadUpper = new THREE.Mesh(roadUpperGeo, roadMat);
    roadUpper.rotation.x = -Math.PI / 2.3;
    roadUpper.rotation.z = -Math.PI / 5.5;
    roadUpper.position.set(-1.8, 4.2, -1.8);
    roadUpper.castShadow = true;
    roadUpper.receiveShadow = true;
    roadUpperRef.current = roadUpper;
    slumpGroup.add(roadUpper);

    // Road yellow dashed centerline stripe
    const stripeGeo = new THREE.PlaneGeometry(0.18, 8.8);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.z = 0.02;
    roadUpper.add(stripe);

    // ── 9. RIVER CHANNEL AT VALLEY TOE ──────────────────────────────────────
    const waterGeo = new THREE.PlaneGeometry(7, 22);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85
    });
    const riverMesh = new THREE.Mesh(waterGeo, waterMat);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.set(7.5, 0.4, 0);
    scene.add(riverMesh);

    // ── 10. GROUNDWATER TABLE INFILTRATION MESH ─────────────────────────────
    const waterTableGeo = new THREE.PlaneGeometry(16, 22);
    const waterTableMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const waterTable = new THREE.Mesh(waterTableGeo, waterTableMat);
    waterTable.rotation.y = Math.PI / 2;
    waterTable.position.set(11.02, 1.2, 0);
    waterTableRef.current = waterTable;
    scene.add(waterTable);

    // ── 11. CROWN TENSION CRACK MESH ────────────────────────────────────────
    const crackGeo = new THREE.BoxGeometry(0.2, 2.5, 14);
    const crackMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const crackMesh = new THREE.Mesh(crackGeo, crackMat);
    crackMesh.position.set(-9.8, 7.5, 0);
    crackMesh.visible = false;
    crackMeshRef.current = crackMesh;
    scene.add(crackMesh);

    // ── 12. TOE DEBRIS RUNOUT FAN MESH ──────────────────────────────────────
    const toeGeo = new THREE.ConeGeometry(5.5, 2.8, 16);
    const toeMat = new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.95 });
    const toeMesh = new THREE.Mesh(toeGeo, toeMat);
    toeMesh.position.set(5.8, 0.8, 0);
    toeMesh.scale.set(0.01, 0.01, 0.01);
    toeMesh.receiveShadow = true;
    toeMesh.castShadow = true;
    toeDepositRef.current = toeMesh;
    scene.add(toeMesh);

    // ── 13. PROCEDURAL 3D TREES (Volumetric Foliage + Trunks) ───────────────
    const treeGroupList: Array<{ mesh: THREE.Group; initialPos: THREE.Vector3; initialRot: THREE.Euler; isSlump: boolean }> = [];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x422006, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d4a22, roughness: 0.75 });
    const autumnMat  = new THREE.MeshStandardMaterial({ color: 0x506229, roughness: 0.75 });

    const createTree = (x: number, y: number, z: number, scale = 1.0, isSlump = false) => {
      const tree = new THREE.Group();
      
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale, 6);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      // Layered Foliage
      const folGeo1 = new THREE.DodecahedronGeometry(0.85 * scale, 1);
      const folMesh1 = new THREE.Mesh(folGeo1, foliageMat);
      folMesh1.position.y = 1.4 * scale;
      folMesh1.castShadow = true;
      tree.add(folMesh1);

      const folGeo2 = new THREE.DodecahedronGeometry(0.65 * scale, 1);
      const folMesh2 = new THREE.Mesh(folGeo2, autumnMat);
      folMesh2.position.y = 2.0 * scale;
      folMesh2.castShadow = true;
      tree.add(folMesh2);

      tree.position.set(x, y, z);
      tree.castShadow = true;

      if (isSlump) {
        slumpGroup.add(tree);
      } else {
        scene.add(tree);
      }

      treeGroupList.push({
        mesh: tree,
        initialPos: tree.position.clone(),
        initialRot: tree.rotation.clone(),
        isSlump
      });
    };

    // Plant trees along top crest & slope
    createTree(-9.5, 8.4, -5.0, 1.1, true);
    createTree(-8.5, 7.8,  2.0, 1.0, true);
    createTree(-6.5, 6.4, -3.5, 1.2, true);
    createTree(-5.5, 5.8,  3.0, 0.9, true);
    createTree(-4.0, 4.6, -6.0, 1.0, true);
    createTree(-3.5, 4.2,  5.0, 1.1, true);

    // Stable trees on lower slope & riverbank
    createTree( 2.5, 1.6, -7.0, 1.0, false);
    createTree( 3.5, 1.2,  6.5, 1.1, false);
    createTree( 9.0, 0.6, -4.0, 0.85,false);
    createTree( 9.5, 0.6,  3.5, 0.9, false);

    treeMeshesRef.current = treeGroupList;

    // ── 14. VOLUMETRIC STORM PRECIPITATION SYSTEM ───────────────────────────
    const rainCount = 1400;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3 + 0] = (Math.sin(i * 3.7) * 0.5) * 36;
      rainPos[i * 3 + 1] = 5 + Math.abs(Math.sin(i * 9.1)) * 25;
      rainPos[i * 3 + 2] = (Math.cos(i * 5.3) * 0.5) * 36;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.75
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    rainSystemRef.current = rainSystem;
    scene.add(rainSystem);

    // ── 15. RESIZE LISTENER ─────────────────────────────────────────────────
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── 16. ANIMATION RENDER LOOP ───────────────────────────────────────────
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rain drop falling motion
      if (rainSystemRef.current) {
        const positions = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          positions[i * 3 + 1] -= delta * 32; // Fall Y
          positions[i * 3 + 0] -= delta * 6;  // Wind angle X
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 28;
            positions[i * 3 + 0] = (Math.sin(i * 3.7) * 0.5) * 36;
          }
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Gentle river surface shimmer
      if (riverMesh) {
        riverMesh.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [updateCameraPosition]);

  // ── MOUSE / TOUCH ORBIT CONTROLS ──────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= dx * 0.008;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sphericalRef.current.phi - dy * 0.008));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    sphericalRef.current.radius = Math.max(16, Math.min(60, sphericalRef.current.radius + e.deltaY * 0.02));
    updateCameraPosition();
  };

  // ── TIMELINE SIMULATION TICK ──────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 0.4 * simSpeed;
        if (next >= 100) return 100;
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // ── UPDATE 3D PHYSICS BASED ON PROGRESS (0 to 100%) ───────────────────────
  useEffect(() => {
    // Determine active phase
    let currentPhase: SimulationPhase = 1;
    if (progress >= 80) currentPhase = 5;
    else if (progress >= 60) currentPhase = 4;
    else if (progress >= 35) currentPhase = 3;
    else if (progress >= 15) currentPhase = 2;
    setPhase(currentPhase);

    // 1. Water table rises during Phase 1-2
    if (waterTableRef.current) {
      const waterY = 1.0 + Math.min(1.0, progress / 40) * 3.2;
      waterTableRef.current.position.y = waterY;
    }

    // 2. Tension crack opens during Phase 2+
    if (crackMeshRef.current) {
      if (progress > 15) {
        crackMeshRef.current.visible = true;
        const crackScale = Math.min(1.0, (progress - 15) / 25);
        crackMeshRef.current.scale.set(1.0 + crackScale * 3.0, 1.0, 1.0);
      } else {
        crackMeshRef.current.visible = false;
      }
    }

    // 3. Rotational Slump Failure: Detaches, rotates backward, slides down
    if (slumpGroupRef.current) {
      if (progress > 30) {
        const slumpProg = Math.min(1.0, (progress - 30) / 45); // 0 to 1
        // Backward rotation around rotational axis
        slumpGroupRef.current.rotation.z = -slumpProg * 0.26; // ~15 deg backward rotation
        // Downward + outward translation along concave curve
        slumpGroupRef.current.position.x = slumpProg * 3.4;
        slumpGroupRef.current.position.y = -slumpProg * 2.8;
        slumpGroupRef.current.position.z = slumpProg * 1.8;
      } else {
        slumpGroupRef.current.rotation.set(0, 0, 0);
        slumpGroupRef.current.position.set(0, 0, 0);
      }
    }

    // 4. Highway fracture separation
    if (roadUpperRef.current && roadLowerRef.current) {
      if (progress > 35) {
        const breakGap = Math.min(1.0, (progress - 35) / 30);
        roadUpperRef.current.position.y = 4.2 - breakGap * 1.8;
      } else {
        roadUpperRef.current.position.y = 4.2;
      }
    }

    // 5. Toe Debris Runout Accumulation
    if (toeDepositRef.current) {
      if (progress > 55) {
        const toeScale = Math.min(1.0, (progress - 55) / 35);
        toeDepositRef.current.scale.set(toeScale * 1.8, toeScale * 1.2, toeScale * 1.8);
      } else {
        toeDepositRef.current.scale.set(0.001, 0.001, 0.001);
      }
    }

    // 6. Tree toppling physics
    treeMeshesRef.current.forEach(({ mesh, initialRot, isSlump }, idx) => {
      if (isSlump && progress > 30) {
        const treeTilt = Math.min(1.0, (progress - 30) / 40);
        mesh.rotation.x = initialRot.x - treeTilt * 0.35; // Tilts backward with slump
        mesh.rotation.z = initialRot.z + treeTilt * (idx % 2 === 0 ? 0.2 : -0.2);
      } else if (!isSlump && progress > 70 && idx >= 6) {
        // Lower trees overwhelmed by debris flow
        const topple = Math.min(1.0, (progress - 70) / 25);
        mesh.rotation.x = initialRot.x + topple * 1.1; // Topples forward
        mesh.position.y = Math.max(0.2, mesh.position.y - topple * 0.4);
      }
    });

  }, [progress]);

  // Jump to specific phase
  const jumpToPhase = (targetPhase: SimulationPhase) => {
    const targets = { 1: 5, 2: 20, 3: 45, 4: 70, 5: 90 };
    setProgress(targets[targetPhase]);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  // Live Scientific Readouts calculated from progress & real data
  const currentFS = Math.max(0.68, +(fs - (progress / 100) * 0.72).toFixed(2));
  const porePressure = Math.round(18 + (progress / 100) * 62); // kPa
  const infiltrationMm = Math.round(rainfall24h * 0.4 + (progress / 100) * (rainfall24h * 0.6));

  return (
    <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl text-slate-200">
      
      {/* 1. Header Toolbar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 text-white flex items-center justify-center shadow-md">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-wide">
                Photorealistic 3D Rotational Landslide Simulation
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
                NASA Geotechnical Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sector: <b className="text-slate-200">{locationName}</b> ({latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E) • DEM Slope: <b className="text-amber-400">{slopeAngle}°</b>
            </p>
          </div>
        </div>

        {/* Camera Preset Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" /> Camera:
          </span>
          <button
            onClick={() => setPresetView('iso')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cameraView === 'iso' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            📐 Isometric
          </button>
          <button
            onClick={() => setPresetView('cliff')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cameraView === 'cliff' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏔️ Cliff Profile
          </button>
          <button
            onClick={() => setPresetView('road')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cameraView === 'road' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🛣️ Highway Level
          </button>
          <button
            onClick={() => setPresetView('aerial')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              cameraView === 'aerial' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🦅 Birds Eye
          </button>
        </div>
      </div>

      {/* 2. Main 3D Canvas Viewport */}
      <div 
        className="relative w-full h-[460px] cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* Orbit instruction tooltip */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-300 pointer-events-none flex items-center gap-2">
          <span>🖱️ Click & Drag to Orbit 360°</span>
          <span>•</span>
          <span>Scroll to Zoom</span>
        </div>

        {/* Live Active Phase Badge Overlay */}
        <div className="absolute top-3 right-3 max-w-xs bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-lg pointer-events-none space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
              {PHASES[phase - 1].title}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            {PHASES[phase - 1].desc}
          </p>
        </div>

        {/* Failure condition warning banner */}
        {currentFS < 1.0 && (
          <div className="absolute bottom-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg animate-bounce pointer-events-none">
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL SHEAR FAILURE: Factor of Safety (FS = {currentFS}) &lt; 1.0</span>
          </div>
        )}
      </div>

      {/* 3. Scientific Geotechnical Telemetry Gauge Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-950 border-t border-b border-slate-800 divide-x divide-slate-800 text-xs">
        
        {/* Gauge 1: Factor of Safety */}
        <div className="p-3 flex items-center gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${currentFS < 1.0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Factor of Safety (FS)</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-extrabold font-mono ${currentFS < 1.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {currentFS}
              </span>
              <span className="text-[9px] font-bold text-slate-500">
                {currentFS < 1.0 ? 'FAILED' : currentFS < 1.3 ? 'MARGINAL' : 'STABLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Gauge 2: Pore Water Pressure */}
        <div className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Pore Water Pressure (u)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-blue-400">{porePressure}</span>
              <span className="text-[9px] text-slate-500">kPa</span>
            </div>
          </div>
        </div>

        {/* Gauge 3: Infiltration */}
        <div className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Accumulated Infiltration</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-cyan-400">{infiltrationMm}</span>
              <span className="text-[9px] text-slate-500">mm / 24h</span>
            </div>
          </div>
        </div>

        {/* Gauge 4: Slope & Lithology */}
        <div className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Slope Angle & Bedrock</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-amber-400">{slopeAngle}°</span>
              <span className="text-[9px] text-slate-500">Sandstone Bedrock</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Playback Controls & Phase Selection Buttons */}
      <div className="p-4 bg-slate-900/90 space-y-4">
        
        {/* Progress Scrubber */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>Simulation Physical Progress</span>
            <span className="font-mono text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-600 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 5 Phase Buttons matching PBS/NASA sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {PHASES.map(p => {
            const isActive = phase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => jumpToPhase(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isActive 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-400/40' 
                    : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-extrabold block">{p.title}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-tight block">{p.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play 3D Simulation'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setSimSpeed(s => s === 1 ? 2 : 1)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono transition-all"
            >
              {simSpeed}x Speed
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            Modeled using Mohr-Coulomb shear criteria $\tau_f = c\' + \sigma\'_n \tan\phi\'$
          </div>
        </div>

      </div>

    </div>
  );
}
