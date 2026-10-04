import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type SceneSetup = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, invalidate: () => void) => void | (() => void);
export type SceneFrame = (deltaSeconds: number, elapsedSeconds: number, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;

type SceneViewportProps = {
  label: string;
  setup?: SceneSetup;
  onFrame?: SceneFrame;
  className?: string;
};

/** Shared, lifecycle-safe Three.js canvas for chapter activities. */
export function SceneViewport({ label, setup, onFrame, className = '' }: SceneViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setUnavailable(true);
      return;
    }

    setUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor('#fbfcf8', 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', label);
    renderer.domElement.setAttribute('role', 'img');
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);
    let renderOnce = () => renderer.render(scene, camera);
    const disposeSetup = setup?.(scene, camera, renderer, () => renderOnce());
    let animationFrame = 0;
    let lastTime = performance.now();
    const startTime = lastTime;

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderOnce();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    renderOnce = () => renderer.render(scene, camera);

    const renderFrame = (time: number) => {
      if (document.hidden) return;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      onFrame?.(delta, (time - startTime) / 1000, scene, camera);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(renderFrame);
    };
    const onVisibilityChange = () => {
      window.cancelAnimationFrame(animationFrame);
      lastTime = performance.now();
      if (!document.hidden) animationFrame = window.requestAnimationFrame(renderFrame);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    resize();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      disposeSetup?.();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [label, setup, onFrame]);

  return <div className={`scene-viewport ${className}`} ref={hostRef} aria-label={label}>
    {unavailable && <div className="scene-viewport__fallback" role="status">此互动需要支持 WebGL 的浏览器。图解和文字说明仍可继续使用。</div>}
  </div>;
}

/** Maps a Direct3D left-handed position to the equivalent Three.js right-handed view. */
export function dxToThreeVector(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, -z);
}

/** A handedness reflection reverses triangle winding; use this when converting DX12 vertex indices. */
export function dxToThreeTriangle(a: number, b: number, c: number): [number, number, number] {
  return [a, c, b];
}
