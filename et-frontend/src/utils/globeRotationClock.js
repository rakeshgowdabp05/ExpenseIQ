const GLOBE_ROTATION_STORAGE_KEY =
  "expenseiq:landing-globe-rotation-started-at";

const DEFAULT_ROTATION_SPEED_DEGREES_PER_SECOND =
  1.8;

function getStoredStartTime() {
  const value = window.localStorage.getItem(
    GLOBE_ROTATION_STORAGE_KEY,
  );

  const timestamp = Number(value);

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  return timestamp;
}

function ensureStartTime() {
  const existingStartTime =
    getStoredStartTime();

  if (existingStartTime) {
    return existingStartTime;
  }

  const now = Date.now();

  window.localStorage.setItem(
    GLOBE_ROTATION_STORAGE_KEY,
    String(now),
  );

  return now;
}

export function getContinuousGlobeRotation({
  baseLongitude = 77.61166,
  speedDegreesPerSecond =
    DEFAULT_ROTATION_SPEED_DEGREES_PER_SECOND,
} = {}) {
  const startTime = ensureStartTime();

  const elapsedSeconds =
    (Date.now() - startTime) / 1000;

  const rotationOffset =
    (elapsedSeconds * speedDegreesPerSecond) % 360;

  return {
    longitude:
      ((baseLongitude + rotationOffset + 540) % 360) -
      180,

    latitude: 12.92072,
  };
}

export function resetGlobeRotationClock() {
  window.localStorage.removeItem(
    GLOBE_ROTATION_STORAGE_KEY,
  );
}