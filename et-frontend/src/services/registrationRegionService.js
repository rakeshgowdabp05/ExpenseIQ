import { appConfig } from "../config/appConfig";

const COORDINATE_PRECISION = 5;
const GEOLOCATION_TIMEOUT_MS = 20000;
const REGION_CODE_MAX_LENGTH = 80;
const REGION_LABEL_MAX_LENGTH = 255;

function roundCoordinate(value) {
  return Number(
    Number(value).toFixed(
      COORDINATE_PRECISION,
    ),
  );
}

function truncate(value, maxLength) {
  const text = String(value ?? "")
    .trim();

  if (!text) {
    return null;
  }

  return text.length > maxLength
    ? text.slice(0, maxLength)
    : text;
}

function getTimezone() {
  try {
    return (
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || "UTC"
    );
  } catch {
    return "UTC";
  }
}

function getLocationErrorMessage(error) {
  if (!navigator.geolocation) {
    return "Geolocation is not supported by this browser.";
  }

  if (error?.code === 1) {
    return "Location permission was denied. Allow location access in the browser and try again.";
  }

  if (error?.code === 2) {
    return "Your current location could not be detected. Check your network or device location settings.";
  }

  if (error?.code === 3) {
    return "Location detection took too long. Please try again.";
  }

  return "Unable to capture your current location.";
}

function requestBrowserPosition() {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by this browser.",
          ),
        );

        return;
      }

      navigator.geolocation
        .getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout:
              GEOLOCATION_TIMEOUT_MS,
            maximumAge: 0,
          },
        );
    },
  );
}

function buildFallbackRegionLabel(
  latitude,
  longitude,
) {
  return `Lat ${latitude.toFixed(
    COORDINATE_PRECISION,
  )}, Lng ${longitude.toFixed(
    COORDINATE_PRECISION,
  )}`;
}

function buildFallbackRegionCode(
  latitude,
  longitude,
) {
  return truncate(
    `GEO_${latitude.toFixed(
      COORDINATE_PRECISION,
    )}_${longitude.toFixed(
      COORDINATE_PRECISION,
    )}`,
    REGION_CODE_MAX_LENGTH,
  );
}

function choosePrimaryPlace(address) {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    address?.suburb ||
    address?.neighbourhood ||
    address?.hamlet ||
    address?.county ||
    null
  );
}

function chooseDistrict(address) {
  return (
    address?.county ||
    address?.state_district ||
    address?.district ||
    null
  );
}

function buildReadableLocationLabel(
  data,
  latitude,
  longitude,
) {
  const address =
    data?.address ?? {};

  const parts = [
    choosePrimaryPlace(address),
    chooseDistrict(address),
    address?.state,
    address?.country,
  ]
    .filter(Boolean)
    .map((part) =>
      String(part).trim(),
    )
    .filter(Boolean);

  const uniqueParts = [
    ...new Set(parts),
  ];

  if (uniqueParts.length > 0) {
    return truncate(
      uniqueParts.join(", "),
      REGION_LABEL_MAX_LENGTH,
    );
  }

  return truncate(
    data?.display_name ||
      buildFallbackRegionLabel(
        latitude,
        longitude,
      ),
    REGION_LABEL_MAX_LENGTH,
  );
}

function buildRegionCodeFromReverseData(
  data,
  latitude,
  longitude,
) {
  if (
    data?.osm_type &&
    data?.osm_id
  ) {
    return truncate(
      `OSM_${data.osm_type}_${data.osm_id}`,
      REGION_CODE_MAX_LENGTH,
    );
  }

  const countryCode =
    data?.address?.country_code;

  const postcode =
    data?.address?.postcode;

  if (countryCode || postcode) {
    return truncate(
      [
        countryCode?.toUpperCase(),
        postcode,
      ]
        .filter(Boolean)
        .join("_"),
      REGION_CODE_MAX_LENGTH,
    );
  }

  return buildFallbackRegionCode(
    latitude,
    longitude,
  );
}

async function reverseGeocode(
  latitude,
  longitude,
) {
  if (
    !appConfig.reverseGeocoding.enabled ||
    !appConfig.reverseGeocoding.url
  ) {
    return null;
  }

  const url = new URL(
    appConfig.reverseGeocoding.url,
  );

  url.searchParams.set(
    "format",
    "jsonv2",
  );

  url.searchParams.set(
    "lat",
    String(latitude),
  );

  url.searchParams.set(
    "lon",
    String(longitude),
  );

  url.searchParams.set(
    "addressdetails",
    "1",
  );

  url.searchParams.set(
    "zoom",
    "18",
  );

  url.searchParams.set(
    "accept-language",
    "en",
  );

  try {
    const response = await fetch(
      url.toString(),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function captureCurrentLocation() {
  try {
    const position =
      await requestBrowserPosition();

    const latitude =
      roundCoordinate(
        position.coords.latitude,
      );

    const longitude =
      roundCoordinate(
        position.coords.longitude,
      );

    const reverseData =
      await reverseGeocode(
        latitude,
        longitude,
      );

    return {
      latitude,

      longitude,

      regionCode:
        buildRegionCodeFromReverseData(
          reverseData,
          latitude,
          longitude,
        ),

      regionLabel:
        buildReadableLocationLabel(
          reverseData,
          latitude,
          longitude,
        ),

      timezone:
        getTimezone(),

      locationSource:
        reverseData
          ? "BROWSER_GEOLOCATION_REVERSE_GEOCODED"
          : "BROWSER_GEOLOCATION",
    };
  } catch (error) {
    throw new Error(
      getLocationErrorMessage(error),
      {
        cause: error,
      },
    );
  }
}

export const registrationRegionService =
  Object.freeze({
    async captureCurrentLocation() {
      return captureCurrentLocation();
    },

    async detect() {
      try {
        const location =
          await captureCurrentLocation();

        return {
          registrationRegionCode:
            location.regionCode,

          registrationRegionLabel:
            location.regionLabel,

          registrationLatitude:
            location.latitude,

          registrationLongitude:
            location.longitude,

          registrationTimezone:
            location.timezone,

          registrationLocationSource:
            location.locationSource,
        };
      } catch {
        return {
          registrationRegionCode: null,

          registrationRegionLabel: null,

          registrationLatitude: null,

          registrationLongitude: null,

          registrationTimezone:
            getTimezone(),

          registrationLocationSource:
            "NOT_CAPTURED",
        };
      }
    },
  });