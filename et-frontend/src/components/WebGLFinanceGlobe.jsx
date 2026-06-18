import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  geoEquirectangular,
  geoPath,
} from "d3-geo";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { feature, mesh } from "topojson-client";
import countriesAtlas from "world-atlas/countries-110m.json";
import landAtlas from "world-atlas/land-110m.json";

const GLOBE_RADIUS = 1;
const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;
const FALLBACK_ROTATION_SPEED_DEGREES_PER_SECOND = 3.8;
const FALLBACK_ROTATION_STARTED_AT_MS = Date.now();

function supportsWebGL() {
  try {
    const canvas =
      document.createElement("canvas");

    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") ||
          canvas.getContext(
            "experimental-webgl",
          )),
    );
  } catch {
    return false;
  }
}

function getClockElapsedSeconds(rotationClock) {
  const startedAtMs =
    Number(rotationClock?.startedAtMs);

  const safeStartedAtMs =
    Number.isFinite(startedAtMs) &&
    startedAtMs > 0
      ? startedAtMs
      : FALLBACK_ROTATION_STARTED_AT_MS;

  return Math.max(
    0,
    (Date.now() - safeStartedAtMs) / 1000,
  );
}

function getRotationSpeed(rotationClock) {
  const speed =
    Number(
      rotationClock?.speedDegreesPerSecond,
    );

  return Number.isFinite(speed)
    ? speed
    : FALLBACK_ROTATION_SPEED_DEGREES_PER_SECOND;
}

function normalizeLongitudeDegrees(value) {
  return (
    ((Number(value) + 540) % 360) -
    180
  );
}

function getPersistentRotationRadians({
  rotationClock,
  markerLongitude,
}) {
  const elapsedSeconds =
    getClockElapsedSeconds(rotationClock);

  const speedDegreesPerSecond =
    getRotationSpeed(rotationClock);

  const rotationOffset =
    elapsedSeconds *
    speedDegreesPerSecond;

  const baseLongitude =
    Number.isFinite(
      Number(markerLongitude),
    )
      ? -90 - Number(markerLongitude)
      : Number(
          rotationClock?.defaultLongitude,
        ) || 12;

  const continuousLongitude =
    normalizeLongitudeDegrees(
      baseLongitude + rotationOffset,
    );

  return THREE.MathUtils.degToRad(
    continuousLongitude,
  );
}

function coordinateToVector3(
  latitude,
  longitude,
  radius,
) {
  const phi =
    THREE.MathUtils.degToRad(
      90 - latitude,
    );

  const theta =
    THREE.MathUtils.degToRad(
      longitude + 180,
    );

  return new THREE.Vector3(
    -radius *
      Math.sin(phi) *
      Math.cos(theta),
    radius * Math.cos(phi),
    radius *
      Math.sin(phi) *
      Math.sin(theta),
  );
}

function deterministicNoise(
  index,
  offset = 0,
) {
  const value =
    Math.sin(
      (index + offset) * 12.9898,
    ) * 43758.5453;

  return value - Math.floor(value);
}

function createWorldTexture() {
  const canvas =
    document.createElement("canvas");

  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;

  const context =
    canvas.getContext("2d");

  const projection =
    geoEquirectangular()
      .translate([
        TEXTURE_WIDTH / 2,
        TEXTURE_HEIGHT / 2,
      ])
      .scale(
        TEXTURE_WIDTH / (2 * Math.PI),
      )
      .precision(0.15);

  const drawPath =
    geoPath(projection, context);

  const landFeature =
    feature(
      landAtlas,
      landAtlas.objects.land,
    );

  const countriesFeature =
    feature(
      countriesAtlas,
      countriesAtlas.objects
        .countries,
    );

  const oceanGradient =
    context.createLinearGradient(
      0,
      0,
      0,
      TEXTURE_HEIGHT,
    );

  oceanGradient.addColorStop(
    0,
    "#0b3a74",
  );

  oceanGradient.addColorStop(
    0.42,
    "#075b9a",
  );

  oceanGradient.addColorStop(
    1,
    "#041f4a",
  );

  context.fillStyle = oceanGradient;
  context.fillRect(
    0,
    0,
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
  );

  for (
    let index = 0;
    index < 360;
    index += 1
  ) {
    const x =
      deterministicNoise(index, 1) *
      TEXTURE_WIDTH;

    const y =
      deterministicNoise(index, 2) *
      TEXTURE_HEIGHT;

    const radius =
      12 +
      deterministicNoise(index, 3) *
        80;

    const alpha =
      0.02 +
      deterministicNoise(index, 4) *
        0.07;

    const gradient =
      context.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius,
      );

    gradient.addColorStop(
      0,
      `rgba(83, 172, 224, ${alpha})`,
    );

    gradient.addColorStop(
      1,
      "rgba(83, 172, 224, 0)",
    );

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2,
    );
    context.fill();
  }

  context.save();

  context.beginPath();
  drawPath(landFeature);
  context.clip();

  const landGradient =
    context.createLinearGradient(
      0,
      0,
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
    );

  landGradient.addColorStop(
    0,
    "#879b5f",
  );

  landGradient.addColorStop(
    0.38,
    "#b9b56a",
  );

  landGradient.addColorStop(
    0.64,
    "#687d4d",
  );

  landGradient.addColorStop(
    1,
    "#b2a86a",
  );

  context.fillStyle = landGradient;
  context.fillRect(
    0,
    0,
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
  );

  for (
    let index = 0;
    index < 950;
    index += 1
  ) {
    const x =
      deterministicNoise(index, 8) *
      TEXTURE_WIDTH;

    const y =
      deterministicNoise(index, 9) *
      TEXTURE_HEIGHT;

    const radius =
      2 +
      deterministicNoise(index, 10) *
        10;

    const greenSignal =
      deterministicNoise(index, 11);

    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2,
    );

    context.fillStyle =
      greenSignal > 0.58
        ? `rgba(27, 90, 57, ${
            0.025 + greenSignal * 0.08
          })`
        : `rgba(132, 101, 57, ${
            0.02 + greenSignal * 0.06
          })`;

    context.fill();
  }

  const polarNorth =
    context.createLinearGradient(
      0,
      0,
      0,
      150,
    );

  polarNorth.addColorStop(
    0,
    "rgba(248, 250, 252, 0.92)",
  );

  polarNorth.addColorStop(
    1,
    "rgba(248, 250, 252, 0)",
  );

  context.fillStyle = polarNorth;
  context.fillRect(
    0,
    0,
    TEXTURE_WIDTH,
    150,
  );

  const polarSouth =
    context.createLinearGradient(
      0,
      TEXTURE_HEIGHT - 150,
      0,
      TEXTURE_HEIGHT,
    );

  polarSouth.addColorStop(
    0,
    "rgba(248, 250, 252, 0)",
  );

  polarSouth.addColorStop(
    1,
    "rgba(248, 250, 252, 0.9)",
  );

  context.fillStyle = polarSouth;
  context.fillRect(
    0,
    TEXTURE_HEIGHT - 150,
    TEXTURE_WIDTH,
    150,
  );

  context.restore();

  context.beginPath();
  drawPath(landFeature);
  context.lineWidth = 2;
  context.strokeStyle =
    "rgba(234, 241, 219, 0.72)";
  context.stroke();

  context.beginPath();
  drawPath(countriesFeature);
  context.lineWidth = 0.8;
  context.strokeStyle =
    "rgba(236, 241, 221, 0.26)";
  context.stroke();

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.wrapS =
    THREE.RepeatWrapping;

  texture.wrapT =
    THREE.ClampToEdgeWrapping;

  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

function createEarthSurface(texture) {
  const geometry =
    new THREE.SphereGeometry(
      GLOBE_RADIUS,
      128,
      96,
    );

  const material =
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.66,
      metalness: 0.02,
    });

  return new THREE.Mesh(
    geometry,
    material,
  );
}

function createCountryBorders() {
  const borderMesh =
    mesh(
      countriesAtlas,
      countriesAtlas.objects.countries,
      (countryA, countryB) =>
        countryA !== countryB,
    );

  const positions = [];

  for (const line of borderMesh.coordinates) {
    for (
      let index = 0;
      index < line.length - 1;
      index += 1
    ) {
      const [
        longitudeA,
        latitudeA,
      ] = line[index];

      const [
        longitudeB,
        latitudeB,
      ] = line[index + 1];

      if (
        Math.abs(
          longitudeA - longitudeB,
        ) > 180
      ) {
        continue;
      }

      const pointA =
        coordinateToVector3(
          latitudeA,
          longitudeA,
          GLOBE_RADIUS + 0.004,
        );

      const pointB =
        coordinateToVector3(
          latitudeB,
          longitudeB,
          GLOBE_RADIUS + 0.004,
        );

      positions.push(
        pointA.x,
        pointA.y,
        pointA.z,
        pointB.x,
        pointB.y,
        pointB.z,
      );
    }
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3,
    ),
  );

  const material =
    new THREE.LineBasicMaterial({
      color: 0xdfe9d7,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });

  return new THREE.LineSegments(
    geometry,
    material,
  );
}

function createGraticuleLine(points) {
  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints(points);

  const material =
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
    });

  return new THREE.Line(
    geometry,
    material,
  );
}

function createGraticules() {
  const group = new THREE.Group();

  for (
    let latitude = -60;
    latitude <= 60;
    latitude += 30
  ) {
    const points = [];

    for (
      let longitude = -180;
      longitude <= 180;
      longitude += 4
    ) {
      points.push(
        coordinateToVector3(
          latitude,
          longitude,
          GLOBE_RADIUS + 0.006,
        ),
      );
    }

    group.add(
      createGraticuleLine(points),
    );
  }

  for (
    let longitude = -150;
    longitude <= 180;
    longitude += 30
  ) {
    const points = [];

    for (
      let latitude = -82;
      latitude <= 82;
      latitude += 4
    ) {
      points.push(
        coordinateToVector3(
          latitude,
          longitude,
          GLOBE_RADIUS + 0.006,
        ),
      );
    }

    group.add(
      createGraticuleLine(points),
    );
  }

  return group;
}

function createCloudLayer() {
  const geometry =
    new THREE.SphereGeometry(
      GLOBE_RADIUS + 0.018,
      96,
      72,
    );

  const material =
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        time: {
          value: 0,
        },
      },
      vertexShader: `
        varying vec2 vertexUv;
        varying vec3 vertexNormal;

        void main() {
          vertexUv = uv;
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vertexUv;
        varying vec3 vertexNormal;

        float wave(vec2 point, float scale, float speed) {
          return sin((point.x * scale) + (time * speed)) *
                 cos((point.y * scale * 0.72) - (time * speed * 0.72));
        }

        void main() {
          float cloud =
            wave(vertexUv, 28.0, 0.12) * 0.5 +
            wave(vertexUv + vec2(0.31, 0.12), 46.0, 0.09) * 0.35 +
            wave(vertexUv + vec2(0.08, 0.41), 72.0, 0.05) * 0.2;

          float band =
            smoothstep(0.28, 0.82, cloud);

          float horizon =
            smoothstep(0.08, 0.68, dot(vertexNormal, vec3(0.0, 0.0, 1.0)));

          float alpha = band * horizon * 0.16;

          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
    });

  const mesh = new THREE.Mesh(
    geometry,
    material,
  );

  return {
    mesh,
    material,
  };
}

function createAtmosphere() {
  const geometry =
    new THREE.SphereGeometry(
      GLOBE_RADIUS + 0.035,
      96,
      72,
    );

  const material =
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec3 vertexNormal;

        void main() {
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vertexNormal;

        void main() {
          float intensity =
            pow(0.69 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.5);

          gl_FragColor =
            vec4(0.18, 0.58, 1.0, 1.0) * intensity;
        }
      `,
    });

  return new THREE.Mesh(
    geometry,
    material,
  );
}

function createStars() {
  const positions = [];

  for (
    let index = 0;
    index < 720;
    index += 1
  ) {
    const radius =
      6 +
      deterministicNoise(index, 20) *
        8;

    const theta =
      deterministicNoise(index, 21) *
      Math.PI *
      2;

    const phi =
      Math.acos(
        2 *
          deterministicNoise(
            index,
            22,
          ) -
          1,
      );

    positions.push(
      radius *
        Math.sin(phi) *
        Math.cos(theta),
      radius * Math.cos(phi),
      radius *
        Math.sin(phi) *
        Math.sin(theta),
    );
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3,
    ),
  );

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.024,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
}

function addUserMarker(
  globeGroup,
  userRegion,
) {
  const latitude = Number(
    userRegion?.registrationLatitude,
  );

  const longitude = Number(
    userRegion?.registrationLongitude,
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const outwardNormal =
    coordinateToVector3(
      latitude,
      longitude,
      1,
    ).normalize();

  const markerGroup =
    new THREE.Group();

  markerGroup.name =
    "expenseiq-clean-location-marker";

  markerGroup.position.copy(
    outwardNormal
      .clone()
      .multiplyScalar(
        GLOBE_RADIUS + 0.052,
      ),
  );

  markerGroup.quaternion
    .setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      outwardNormal,
    );

  const surfaceHaloMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending:
        THREE.AdditiveBlending,
    });

  const ringMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending:
        THREE.AdditiveBlending,
    });

  const coreMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.2,
      metalness: 0.12,
      emissive: 0x0f7a3d,
      emissiveIntensity: 0.42,
    });

  const innerMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.06,
      emissive: 0xdcfce7,
      emissiveIntensity: 0.2,
    });

  const surfaceHalo =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.135,
        72,
      ),
      surfaceHaloMaterial,
    );

  surfaceHalo.position.z = 0.002;
  markerGroup.add(surfaceHalo);

  const outerRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.092,
        0.005,
        12,
        88,
      ),
      ringMaterial,
    );

  outerRing.position.z = 0.01;
  markerGroup.add(outerRing);

  const core =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.034,
        32,
        24,
      ),
      coreMaterial,
    );

  core.position.z = 0.048;
  markerGroup.add(core);

  const innerDot =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.013,
        24,
        16,
      ),
      innerMaterial,
    );

  innerDot.position.z = 0.069;
  markerGroup.add(innerDot);

  globeGroup.add(markerGroup);

  return {
    longitude,
    markerGroup,
    surfaceHalo,
    outerRing,
    core,
    innerDot,
  };
}

function disposeScene(
  scene,
  renderer,
  texture,
) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (
      Array.isArray(object.material)
    ) {
      object.material.forEach(
        (material) =>
          material.dispose(),
      );
    } else if (object.material) {
      object.material.dispose();
    }
  });

  texture.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
}

export default function WebGLFinanceGlobe({
  userRegion,
  reduceMotion,
  rotationClock,
}) {
  const containerReference =
    useRef(null);

  const [webGLAvailable] =
    useState(() => supportsWebGL());

  useEffect(() => {
    if (!webGLAvailable) {
      return undefined;
    }

    const container =
      containerReference.current;

    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        36,
        1,
        0.1,
        100,
      );

    camera.position.set(
      0,
      0,
      3.15,
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference:
          "high-performance",
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5,
      ),
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.06;

    renderer.setClearColor(
      0x061321,
      0,
    );

    renderer.domElement.style.display =
      "block";

    renderer.domElement.style.width =
      "100%";

    renderer.domElement.style.height =
      "100%";

    container.appendChild(
      renderer.domElement,
    );

    const worldTexture =
      createWorldTexture();

    const globeGroup =
      new THREE.Group();

    scene.add(globeGroup);

    globeGroup.add(
      createEarthSurface(worldTexture),
    );

    globeGroup.add(
      createCountryBorders(),
    );

    globeGroup.add(
      createGraticules(),
    );

    const cloudLayer =
      createCloudLayer();

    globeGroup.add(cloudLayer.mesh);

    scene.add(createAtmosphere());
    scene.add(createStars());

    scene.add(
      new THREE.HemisphereLight(
        0xc7ebff,
        0x071221,
        1.14,
      ),
    );

    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        2.85,
      );

    keyLight.position.set(
      -3.4,
      2.7,
      4.4,
    );

    scene.add(keyLight);

    const fillLight =
      new THREE.DirectionalLight(
        0x7ac8ff,
        0.7,
      );

    fillLight.position.set(
      3.2,
      0.4,
      2.0,
    );

    scene.add(fillLight);

    const rimLight =
      new THREE.DirectionalLight(
        0x3b82f6,
        1.25,
      );

    rimLight.position.set(
      3.5,
      -1.8,
      -3.0,
    );

    scene.add(rimLight);

    const markerData =
      addUserMarker(
        globeGroup,
        userRegion,
      );

    globeGroup.rotation.y =
      getPersistentRotationRadians({
        rotationClock,
        markerLongitude:
          markerData?.longitude,
      });

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement,
      );

    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.42;

    controls.minPolarAngle =
      Math.PI / 2;

    controls.maxPolarAngle =
      Math.PI / 2;

    controls.autoRotate = false;

    const resize = () => {
      const width = Math.max(
        300,
        container.clientWidth,
      );

      const height = Math.max(
        430,
        Math.min(
          640,
          width * 0.9,
        ),
      );

      renderer.setSize(
        width,
        height,
        false,
      );

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();
    };

    resize();

    const resizeObserver =
      new ResizeObserver(resize);

    resizeObserver.observe(container);

    const clock =
      new THREE.Clock();

    let animationFrameId = 0;

    const animate = () => {
      const elapsed =
        clock.getElapsedTime();

      if (!reduceMotion) {
        globeGroup.rotation.y =
          getPersistentRotationRadians({
            rotationClock,
            markerLongitude:
              markerData?.longitude,
          });
      }

      controls.update();

      cloudLayer.material.uniforms
        .time.value =
        getClockElapsedSeconds(
          rotationClock,
        );

      if (
        !reduceMotion &&
        markerData
      ) {
        const pulse =
          1 +
          Math.sin(
            elapsed * 2.4,
          ) *
            0.14;

        const softPulse =
          1 +
          Math.sin(
            elapsed * 1.8,
          ) *
            0.2;

        markerData.outerRing
          .scale
          .setScalar(pulse);

        markerData.outerRing
          .material.opacity =
          0.58 +
          Math.sin(
            elapsed * 2.4,
          ) *
            0.22;

        markerData.surfaceHalo
          .scale
          .setScalar(softPulse);

        markerData.surfaceHalo
          .material.opacity =
          0.1 +
          Math.sin(
            elapsed * 1.8,
          ) *
            0.045;

        markerData.core
          .scale
          .setScalar(
            1 +
              Math.sin(
                elapsed * 2.2,
              ) *
                0.04,
          );
      }

      renderer.render(
        scene,
        camera,
      );

      animationFrameId =
        window.requestAnimationFrame(
          animate,
        );
    };

    animate();

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      resizeObserver.disconnect();
      controls.dispose();

      disposeScene(
        scene,
        renderer,
        worldTexture,
      );

      renderer.domElement.remove();
    };
  }, [
    reduceMotion,
    rotationClock,
    userRegion,
    webGLAvailable,
  ]);

  if (!webGLAvailable) {
    return (
      <div className="webgl-globe-fallback">
        <div className="webgl-globe-fallback-sphere" />

        <p>
          Enable browser hardware
          acceleration to view the
          interactive globe.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerReference}
      className="webgl-globe-canvas"
      role="img"
      aria-label="Interactive 3D Earth globe showing your private saved location marker when available."
    />
  );
}