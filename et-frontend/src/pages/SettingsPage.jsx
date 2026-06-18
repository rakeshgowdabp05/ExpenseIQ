import {
    BadgeCheck,
    CalendarDays,
    CircleAlert,
    Clock3,
    Eye,
    EyeOff,
    Globe2,
    KeyRound,
    LoaderCircle,
    LocateFixed,
    LockKeyhole,
    LogOut,
    Mail,
    MapPin,
    MonitorSmartphone,
    Phone,
    RefreshCw,
    Save,
    ShieldCheck,
    UserRound,
  } from "lucide-react";
import PageToastBridge from "../components/PageToastBridge";
  import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  import { useNavigate } from "react-router";
  
  import { appRoutes } from "../config/appConfig";
  import {
    DATE_FORMAT_OPTIONS,
    formatDatePreview,
    getCurrencyOptions,
    getTimezoneOptions,
  } from "../config/settingsOptions";
  import { useAuth } from "../hooks/useAuth";
  import { registrationRegionService } from "../services/registrationRegionService";
  import { settingsService } from "../services/settingsService";
  import { getApiErrorMessage } from "../utils/apiError";
  const PASSWORD_INITIAL_STATE =
    Object.freeze({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  
  const INPUT_CLASS =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white dark:disabled:bg-slate-900";
  
  const PRIMARY_BUTTON_CLASS =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.18)] transition hover:bg-[#1848b5] disabled:cursor-not-allowed disabled:opacity-60";
  
  const SECONDARY_BUTTON_CLASS =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-[#0b1220] shadow-sm transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#101a2c] dark:text-white";
  
  function getBrowserTimezone() {
    try {
      return (
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone || ""
      );
    } catch {
      return "";
    }
  }
  
  function getProfileForm(profile) {
    return {
      firstName:
        profile?.firstName ?? "",
      lastName:
        profile?.lastName ?? "",
      phone:
        profile?.phone ?? "",
    };
  }
  
  function getPreferenceForm(profile) {
    return {
      preferredCurrency:
        profile?.preferredCurrency ?? "",
  
      preferredTimezone:
        profile?.preferredTimezone ??
        profile?.registrationTimezone ??
        getBrowserTimezone(),
  
      dateFormat:
        profile?.dateFormat ??
        "DD_MM_YYYY",
  
      themePreference:
        profile?.themePreference ??
        "SYSTEM",
    };
  }
  
  function getResultData(result) {
    return (
      result?.data ??
      result ??
      null
    );
  }
  
  function getFullName(profile) {
    const name = [
      profile?.firstName,
      profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  
    return name || "ExpenseIQ user";
  }
  
  function getInitials(profile) {
    const firstInitial =
      profile?.firstName
        ?.trim()
        .charAt(0) ?? "";
  
    const lastInitial =
      profile?.lastName
        ?.trim()
        .charAt(0) ?? "";
  
    return (
      `${firstInitial}${lastInitial}`.toUpperCase() ||
      "U"
    );
  }
  
  function normalizeCurrency(value) {
    return String(value ?? "")
      .trim()
      .toUpperCase();
  }
  
  function hasCapturedLocation(profile) {
    return (
      Number.isFinite(
        Number(
          profile?.registrationLatitude,
        ),
      ) &&
      Number.isFinite(
        Number(
          profile?.registrationLongitude,
        ),
      )
    );
  }
  
  function hasLatinText(value) {
    return /[A-Za-z]/.test(
      String(value ?? ""),
    );
  }
  
  function getEnglishLocationLabel(value) {
    const parts = String(value ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter(hasLatinText);
  
    return parts.join(", ");
  }
  
  function getLocationLabel(profile) {
    if (!hasCapturedLocation(profile)) {
      return "Not captured";
    }
  
    const englishLabel =
      getEnglishLocationLabel(
        profile?.registrationRegionLabel,
      );
  
    if (englishLabel) {
      return englishLabel;
    }
  
    return `Latitude ${Number(
      profile.registrationLatitude,
    ).toFixed(5)}, Longitude ${Number(
      profile.registrationLongitude,
    ).toFixed(5)}`;
  }
  
  function formatCoordinates(profile) {
    if (!hasCapturedLocation(profile)) {
      return "No coordinates saved yet.";
    }
  
    return `Latitude ${Number(
      profile.registrationLatitude,
    ).toFixed(5)}, Longitude ${Number(
      profile.registrationLongitude,
    ).toFixed(5)}`;
  }
  
  function formatInstant(
    value,
    dateFormat,
  ) {
    if (!value) {
      return "Not available";
    }
  
    const date = new Date(value);
  
    if (
      Number.isNaN(date.getTime())
    ) {
      return String(value);
    }
  
    const formattedDate =
      formatDatePreview(
        dateFormat,
        date,
      );
  
    const time =
      new Intl.DateTimeFormat(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      ).format(date);
  
    return `${formattedDate}, ${time}`;
  }
  
  export default function SettingsPage() {
    const navigate = useNavigate();
  
    const {
      user,
      logout,
      refreshCurrentUser,
    } = useAuth();
  
    const [profile, setProfile] =
      useState(user);
  
    const [
      profileForm,
      setProfileForm,
    ] = useState(() =>
      getProfileForm(user),
    );
  
    const [
      preferenceForm,
      setPreferenceForm,
    ] = useState(() =>
      getPreferenceForm(user),
    );
  
    const [
      passwordForm,
      setPasswordForm,
    ] = useState(
      PASSWORD_INITIAL_STATE,
    );
  
    const [sessions, setSessions] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [refreshing, setRefreshing] =
      useState(false);
  
    const [
      profileSaving,
      setProfileSaving,
    ] = useState(false);
  
    const [
      preferencesSaving,
      setPreferencesSaving,
    ] = useState(false);
  
    const [
      locationSaving,
      setLocationSaving,
    ] = useState(false);
  
    const [
      passwordSaving,
      setPasswordSaving,
    ] = useState(false);
  
    const [
      sessionActionId,
      setSessionActionId,
    ] = useState("");
  
    const [
      confirmation,
      setConfirmation,
    ] = useState(null);
  
    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");
  
    const [
      errorMessage,
      setErrorMessage,
    ] = useState("");
  
    const [
      visiblePasswords,
      setVisiblePasswords,
    ] = useState({
      current: false,
      next: false,
      confirmation: false,
    });
  
    const currencyOptions =
      useMemo(
        () =>
          getCurrencyOptions(
            preferenceForm
              .preferredCurrency,
          ),
        [
          preferenceForm
            .preferredCurrency,
        ],
      );
  
    const timezoneOptions =
      useMemo(
        () =>
          getTimezoneOptions(
            preferenceForm
              .preferredTimezone,
          ),
        [
          preferenceForm
            .preferredTimezone,
        ],
      );
  
    useEffect(() => {
      let active = true;
  
      Promise.all([
        settingsService.getProfile(),
        settingsService.getSessions(),
      ])
        .then(
          ([
            profileResponse,
            sessionResponse,
          ]) => {
            if (!active) {
              return;
            }
  
            const loadedPreferences =
              getPreferenceForm(
                profileResponse,
              );
  
            setProfile(profileResponse);
  
            setProfileForm(
              getProfileForm(
                profileResponse,
              ),
            );
  
            setPreferenceForm(
              loadedPreferences,
            );
  
            setSessions(
              sessionResponse,
            );
  
            setErrorMessage("");
          },
        )
        .catch((error) => {
          if (!active) {
            return;
          }
  
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to load your settings.",
            ),
          );
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
  
      return () => {
        active = false;
      };
    }, []);
  
    function clearMessages() {
      setSuccessMessage("");
      setErrorMessage("");
    }
  
    async function refreshSettings() {
      clearMessages();
      setRefreshing(true);
  
      try {
        const [
          profileResponse,
          sessionResponse,
        ] = await Promise.all([
          settingsService.getProfile(),
          settingsService.getSessions(),
        ]);
  
        const loadedPreferences =
          getPreferenceForm(
            profileResponse,
          );
  
        setProfile(profileResponse);
  
        setProfileForm(
          getProfileForm(
            profileResponse,
          ),
        );
  
        setPreferenceForm(
          loadedPreferences,
        );
  
        setSessions(sessionResponse);
  
        setSuccessMessage(
          "Settings refreshed successfully.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to refresh your settings.",
          ),
        );
      } finally {
        setRefreshing(false);
      }
    }
  
    function updateProfileField(event) {
      const { name, value } =
        event.target;
  
      setProfileForm(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );
    }
  
    function updatePreferenceField(
      event,
    ) {
      const { name, value } =
        event.target;
  
      const nextValue =
        name === "preferredCurrency"
          ? value.toUpperCase()
          : value;
  
      setPreferenceForm(
        (current) => ({
          ...current,
          [name]: nextValue,
        }),
      );
    }
  
    function updatePasswordField(event) {
      const { name, value } =
        event.target;
  
      setPasswordForm(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );
    }
  
    async function saveProfile(event) {
      event.preventDefault();
  
      clearMessages();
      setProfileSaving(true);
  
      try {
        const result =
          await settingsService
            .updateProfile({
              firstName:
                profileForm.firstName
                  .trim(),
  
              lastName:
                profileForm.lastName
                  .trim() ||
                null,
  
              phone:
                profileForm.phone
                  .trim() ||
                null,
            });
  
        const updatedProfile =
          getResultData(result);
  
        if (updatedProfile) {
          setProfile(updatedProfile);
  
          setProfileForm(
            getProfileForm(
              updatedProfile,
            ),
          );
        }
  
        await refreshCurrentUser();
  
        setSuccessMessage(
          result?.message ||
            "Profile updated successfully.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to update your profile.",
          ),
        );
      } finally {
        setProfileSaving(false);
      }
    }
  
    async function savePreferences(
      event,
    ) {
      event.preventDefault();
  
      clearMessages();
  
      const preferredCurrency =
        normalizeCurrency(
          preferenceForm
            .preferredCurrency,
        );
  
      if (
        preferredCurrency &&
        !/^[A-Z]{3}$/.test(
          preferredCurrency,
        )
      ) {
        setErrorMessage(
          "Preferred currency must contain exactly three letters.",
        );
  
        return;
      }
  
      if (
        !preferenceForm
          .preferredTimezone
          .trim()
      ) {
        setErrorMessage(
          "Preferred timezone is required.",
        );
  
        return;
      }
  
      setPreferencesSaving(true);
  
      try {
        const payload = {
          preferredCurrency:
            preferredCurrency ||
            null,
  
          preferredTimezone:
            preferenceForm
              .preferredTimezone
              .trim(),
  
          dateFormat:
            preferenceForm.dateFormat,
  
          themePreference:
            profile?.themePreference ??
            preferenceForm.themePreference ??
            "SYSTEM",
        };
  
        const result =
          await settingsService
            .updatePreferences(
              payload,
            );
  
        const updatedProfile =
          getResultData(result);
  
        if (updatedProfile) {
          setProfile(updatedProfile);
  
          setPreferenceForm(
            getPreferenceForm(
              updatedProfile,
            ),
          );
        }
  
        await refreshCurrentUser();
  
        setSuccessMessage(
          result?.message ||
            "Preferences updated successfully.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to update your preferences.",
          ),
        );
      } finally {
        setPreferencesSaving(false);
      }
    }
  
    async function updateCurrentLocation() {
      clearMessages();
      setLocationSaving(true);
  
      try {
        const location =
          await registrationRegionService
            .captureCurrentLocation();
  
        const result =
          await settingsService
            .updateLocation({
              latitude:
                location.latitude,
  
              longitude:
                location.longitude,
  
              regionCode:
                location.regionCode,
  
              regionLabel:
                location.regionLabel,
  
              timezone:
                location.timezone,
  
              locationSource:
                location.locationSource,
            });
  
        const updatedProfile =
          getResultData(result);
  
        if (updatedProfile) {
          setProfile(updatedProfile);
  
          setPreferenceForm(
            getPreferenceForm(
              updatedProfile,
            ),
          );
        }
  
        await refreshCurrentUser();
  
        setSuccessMessage(
          result?.message ||
            "Location updated successfully.",
        );
      } catch (error) {
        setErrorMessage(
          error?.message ||
            getApiErrorMessage(
              error,
              "Unable to update your location.",
            ),
        );
      } finally {
        setLocationSaving(false);
      }
    }
  
    async function changePassword(
      event,
    ) {
      event.preventDefault();
  
      clearMessages();
  
      if (
        passwordForm.newPassword !==
        passwordForm.confirmNewPassword
      ) {
        setErrorMessage(
          "New password and confirmation do not match.",
        );
  
        return;
      }
  
      if (
        passwordForm.newPassword
          .length < 8
      ) {
        setErrorMessage(
          "New password must contain at least 8 characters.",
        );
  
        return;
      }
  
      setPasswordSaving(true);
  
      try {
        const result =
          await settingsService
            .changePassword(
              passwordForm,
            );
  
        setPasswordForm(
          PASSWORD_INITIAL_STATE,
        );
  
        try {
          await logout();
        } catch {
          // Local authentication is still cleared.
        }
  
        navigate(
          appRoutes.login,
          {
            replace: true,
            state: {
              registrationMessage:
                result?.message ||
                "Password changed successfully. Sign in again.",
            },
          },
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to change your password.",
          ),
        );
      } finally {
        setPasswordSaving(false);
      }
    }
  
    async function confirmSessionAction() {
      if (!confirmation) {
        return;
      }
  
      clearMessages();
  
      if (
        confirmation.type === "all"
      ) {
        setSessionActionId("ALL");
  
        try {
          const result =
            await settingsService
              .revokeAllSessions();
  
          try {
            await logout();
          } catch {
            // Local authentication is still cleared.
          }
  
          navigate(
            appRoutes.login,
            {
              replace: true,
              state: {
                registrationMessage:
                  result?.message ||
                  "All devices were signed out.",
              },
            },
          );
        } catch (error) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to sign out all devices.",
            ),
          );
        } finally {
          setSessionActionId("");
          setConfirmation(null);
        }
  
        return;
      }
  
      const selectedSession =
        confirmation.session;
  
      setSessionActionId(
        selectedSession.publicId,
      );
  
      try {
        const result =
          await settingsService
            .revokeSession(
              selectedSession.publicId,
            );
  
        setSessions(
          (current) =>
            current.filter(
              (session) =>
                session.publicId !==
                selectedSession.publicId,
            ),
        );
  
        setSuccessMessage(
          result?.message ||
            "Device signed out successfully.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to sign out this device.",
          ),
        );
      } finally {
        setSessionActionId("");
        setConfirmation(null);
      }
    }
  
    if (loading) {
      return <SettingsLoading />;
    }
  
    return (
      <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 overflow-x-hidden">
      {errorMessage && (
        <PageToastBridge
          type="error"
          message={errorMessage}
          onConsumed={() => setErrorMessage("")}
        />
      )}

      {successMessage && (
        <PageToastBridge
          type="success"
          message={successMessage}
          onConsumed={() => setSuccessMessage("")}
        />
      )}

        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.19em] text-[#1f55cf] dark:text-blue-300">
              Account settings
            </p>
  
            <h1 className="mt-3 text-[2.15rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
              Settings
            </h1>
  
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage your profile,
              preferences, security and
              active sessions.
            </p>
          </div>
  
          <button
            type="button"
            onClick={refreshSettings}
            disabled={refreshing}
            className={SECONDARY_BUTTON_CLASS}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
  
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </header>
  
        <div
          aria-live="polite"
          className="mt-5 space-y-3"
        >
          {successMessage && (
            <PageToastBridge
              type="success"
              message={successMessage}
              onClose={() =>
                setSuccessMessage("")
              }
            />
          )}
  
          {errorMessage && (
            <PageToastBridge
              type="error"
              message={errorMessage}
              onClose={() =>
                setErrorMessage("")
              }
            />
          )}
        </div>
  
        <section className="mt-8 flex flex-col gap-5 rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1f55cf] text-lg font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.18)]">
            {getInitials(profile)}
          </div>
  
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-extrabold text-[#080808] dark:text-white">
                {getFullName(profile)}
              </h2>
  
              <StatusBadge
                active={
                  profile?.accountStatus ===
                  "ACTIVE"
                }
                label={
                  profile?.accountStatus ||
                  "Unavailable"
                }
              />
  
              {profile?.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[0.65rem] font-extrabold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
  
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {profile?.email}
            </p>
          </div>
  
          <div className="grid shrink-0 gap-1 text-sm sm:text-right">
            <span className="font-extrabold text-[#0b1220] dark:text-slate-100">
              {preferenceForm
                .preferredTimezone ||
                "Timezone not selected"}
            </span>
  
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {hasCapturedLocation(profile)
                ? "Location captured"
                : "Location not captured"}
            </span>
          </div>
        </section>
  
        <div className="mt-6 space-y-6">
          <SettingsSection
            icon={UserRound}
            title="Profile"
            description="Update the personal details associated with your account."
          >
            <form onSubmit={saveProfile}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="First name"
                  icon={UserRound}
                >
                  <input
                    name="firstName"
                    value={
                      profileForm.firstName
                    }
                    onChange={
                      updateProfileField
                    }
                    minLength={2}
                    maxLength={100}
                    autoComplete="given-name"
                    required
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </Field>
  
                <Field
                  label="Last name"
                  icon={UserRound}
                >
                  <input
                    name="lastName"
                    value={
                      profileForm.lastName
                    }
                    onChange={
                      updateProfileField
                    }
                    maxLength={100}
                    autoComplete="family-name"
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </Field>
  
                <Field
                  label="Email address"
                  icon={Mail}
                >
                  <input
                    value={
                      profile?.email ?? ""
                    }
                    disabled
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </Field>
  
                <Field
                  label="Phone number"
                  icon={Phone}
                >
                  <input
                    name="phone"
                    type="tel"
                    value={
                      profileForm.phone
                    }
                    onChange={
                      updateProfileField
                    }
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="Add phone number"
                    className={`${INPUT_CLASS} pl-10`}
                  />
                </Field>
              </div>
  
              <SectionActions>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className={
                    PRIMARY_BUTTON_CLASS
                  }
                >
                  {profileSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
  
                  {profileSaving
                    ? "Saving..."
                    : "Save profile"}
                </button>
              </SectionActions>
            </form>
          </SettingsSection>
  
          <SettingsSection
            icon={Globe2}
            title="Preferences"
            description="Choose your currency, timezone and date display."
          >
            <form
              onSubmit={savePreferences}
            >
              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="Preferred currency"
                  icon={Globe2}
                >
                  <select
                    name="preferredCurrency"
                    value={
                      preferenceForm
                        .preferredCurrency
                    }
                    onChange={
                      updatePreferenceField
                    }
                    className={`${INPUT_CLASS} pl-10`}
                  >
                    <option value="">
                      Select currency
                    </option>
  
                    {currencyOptions.map(
                      (currency) => (
                        <option
                          key={currency}
                          value={currency}
                        >
                          {currency}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
  
                <Field
                  label="Preferred timezone"
                  icon={Clock3}
                >
                  <select
                    name="preferredTimezone"
                    value={
                      preferenceForm
                        .preferredTimezone
                    }
                    onChange={
                      updatePreferenceField
                    }
                    required
                    className={`${INPUT_CLASS} pl-10`}
                  >
                    <option value="">
                      Select timezone
                    </option>
  
                    {timezoneOptions.map(
                      (timezone) => (
                        <option
                          key={timezone}
                          value={timezone}
                        >
                          {timezone}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
  
                <Field
                  label="Date display"
                  icon={CalendarDays}
                >
                  <select
                    name="dateFormat"
                    value={
                      preferenceForm
                        .dateFormat
                    }
                    onChange={
                      updatePreferenceField
                    }
                    className={`${INPUT_CLASS} pl-10`}
                  >
                    {DATE_FORMAT_OPTIONS.map(
                      (format) => (
                        <option
                          key={format}
                          value={format}
                        >
                          {formatDatePreview(
                            format,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              </div>
  
              <SectionActions>
                <button
                  type="submit"
                  disabled={
                    preferencesSaving
                  }
                  className={
                    PRIMARY_BUTTON_CLASS
                  }
                >
                  {preferencesSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
  
                  {preferencesSaving
                    ? "Saving..."
                    : "Save preferences"}
                </button>
              </SectionActions>
            </form>
          </SettingsSection>
  
          <SettingsSection
            icon={ShieldCheck}
            title="Active sessions"
            description="Devices currently signed in to your ExpenseIQ account."
            action={
              sessions.length > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmation({
                      type: "all",
                    })
                  }
                  disabled={
                    sessionActionId ===
                    "ALL"
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/30 dark:bg-[#101a2c] dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out all devices
                </button>
              ) : null
            }
          >
            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center dark:border-slate-700">
                <MonitorSmartphone className="mx-auto h-7 w-7 text-slate-400" />
  
                <p className="mt-4 text-sm font-extrabold text-[#0b1220] dark:text-white">
                  No active sessions
                </p>
  
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  No refresh sessions were
                  returned for this account.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                {sessions.map(
                  (session) => (
                    <SessionRow
                      key={
                        session.publicId
                      }
                      session={session}
                      dateFormat={
                        preferenceForm
                          .dateFormat
                      }
                      revoking={
                        sessionActionId ===
                        session.publicId
                      }
                      onSignOut={() =>
                        setConfirmation({
                          type: "single",
                          session,
                        })
                      }
                    />
                  ),
                )}
              </div>
            )}
          </SettingsSection>
  
          <SettingsSection
            icon={KeyRound}
            title="Change password"
            description="Changing your password signs out every active device."
          >
            <form
              onSubmit={changePassword}
            >
              <div className="space-y-5">
                <PasswordField
                  label="Current password"
                  name="currentPassword"
                  value={
                    passwordForm
                      .currentPassword
                  }
                  onChange={
                    updatePasswordField
                  }
                  visible={
                    visiblePasswords.current
                  }
                  onToggle={() =>
                    setVisiblePasswords(
                      (current) => ({
                        ...current,
                        current:
                          !current.current,
                      }),
                    )
                  }
                  autoComplete="current-password"
                />
  
                <div className="grid gap-5 sm:grid-cols-2">
                  <PasswordField
                    label="New password"
                    name="newPassword"
                    value={
                      passwordForm
                        .newPassword
                    }
                    onChange={
                      updatePasswordField
                    }
                    visible={
                      visiblePasswords.next
                    }
                    onToggle={() =>
                      setVisiblePasswords(
                        (current) => ({
                          ...current,
                          next:
                            !current.next,
                        }),
                      )
                    }
                    autoComplete="new-password"
                  />
  
                  <PasswordField
                    label="Confirm new password"
                    name="confirmNewPassword"
                    value={
                      passwordForm
                        .confirmNewPassword
                    }
                    onChange={
                      updatePasswordField
                    }
                    visible={
                      visiblePasswords
                        .confirmation
                    }
                    onToggle={() =>
                      setVisiblePasswords(
                        (current) => ({
                          ...current,
                          confirmation:
                            !current
                              .confirmation,
                        }),
                      )
                    }
                    autoComplete="new-password"
                  />
                </div>
              </div>
  
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                You will need to sign in again
                after changing your password.
              </div>
  
              <SectionActions>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className={
                    PRIMARY_BUTTON_CLASS
                  }
                >
                  {passwordSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
  
                  {passwordSaving
                    ? "Changing..."
                    : "Change password"}
                </button>
              </SectionActions>
            </form>
          </SettingsSection>
  
          <SettingsSection
            icon={CircleAlert}
            title="Account information"
            description="Important account, login and saved location details."
            action={
              <button
                type="button"
                onClick={
                  updateCurrentLocation
                }
                disabled={locationSaving}
                className={
                  PRIMARY_BUTTON_CLASS
                }
              >
                {locationSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="h-4 w-4" />
                )}
  
                {locationSaving
                  ? "Capturing..."
                  : hasCapturedLocation(profile)
                    ? "Update location"
                    : "Capture location"}
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoTile
                icon={BadgeCheck}
                label="Account status"
                value={
                  profile?.accountStatus ||
                  "Unavailable"
                }
                tone="success"
              />
  
              <InfoTile
                icon={Mail}
                label="Email verification"
                value={
                  profile?.emailVerified
                    ? "Verified"
                    : "Not verified"
                }
                tone={
                  profile?.emailVerified
                    ? "success"
                    : "warning"
                }
              />
  
              <InfoTile
                icon={CalendarDays}
                label="Member since"
                value={formatInstant(
                  profile?.createdAt,
                  preferenceForm
                    .dateFormat,
                )}
              />
  
              <InfoTile
                icon={Clock3}
                label="Last sign-in"
                value={formatInstant(
                  profile?.lastLoginAt,
                  preferenceForm
                    .dateFormat,
                )}
              />
  
              <InfoTile
                icon={MapPin}
                label="Saved location"
                value={getLocationLabel(
                  profile,
                )}
                helper={
                  hasCapturedLocation(profile)
                    ? formatCoordinates(
                        profile,
                      )
                    : "Click Capture location and allow browser permission."
                }
                tone={
                  hasCapturedLocation(profile)
                    ? "success"
                    : "warning"
                }
              />
  
              <InfoTile
                icon={Globe2}
                label="Preferred timezone"
                value={
                  preferenceForm
                    .preferredTimezone ||
                  "Not configured"
                }
                helper="Used for dashboard and analytics reports."
              />
            </div>
  
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4 text-sm leading-6 text-slate-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-slate-300">
              <div className="flex flex-wrap gap-3">
                <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1f55cf] dark:text-blue-300" />
  
                <div>
                  <p className="font-extrabold text-[#0b1220] dark:text-white">
                    Landing globe marker uses this saved location.
                  </p>
  
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Your saved location is used
                    only to place your private
                    marker on the landing page
                    globe.
                  </p>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>
  
        {confirmation && (
          <ConfirmationDialog
            confirmation={
              confirmation
            }
            submitting={Boolean(
              sessionActionId,
            )}
            onCancel={() =>
              setConfirmation(null)
            }
            onConfirm={
              confirmSessionAction
            }
          />
        )}
      </div>
    );
  }
  
  function SettingsSection({
    icon: Icon,
    title,
    description,
    action,
    children,
  }) {
    return (
      <section className="rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c]">
        <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
              <Icon className="h-4.5 w-4.5" />
            </div>
  
            <div>
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
                {title}
              </h2>
  
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>
  
          {action}
        </header>
  
        <div className="px-5 py-6 sm:px-6">
          {children}
        </div>
      </section>
    );
  }
  
  function Field({
    label,
    icon: Icon,
    children,
  }) {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-extrabold text-[#0b1220] dark:text-slate-200">
          {label}
        </span>
  
        <div className="relative">
          <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
  
          {children}
        </div>
      </label>
    );
  }
  
  function PasswordField({
    label,
    visible,
    onToggle,
    ...inputProperties
  }) {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-extrabold text-[#0b1220] dark:text-slate-200">
          {label}
        </span>
  
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  
          <input
            {...inputProperties}
            type={
              visible
                ? "text"
                : "password"
            }
            required
            minLength={8}
            maxLength={72}
            className={`${INPUT_CLASS} pl-10 pr-11`}
          />
  
          <button
            type="button"
            onClick={onToggle}
            aria-label={
              visible
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1f55cf] dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </label>
    );
  }
  
  function SectionActions({
    children,
  }) {
    return (
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
        {children}
      </div>
    );
  }
  
  function SessionRow({
    session,
    dateFormat,
    revoking,
    onSignOut,
  }) {
    return (
      <article className="flex flex-col gap-4 bg-white px-4 py-4 dark:bg-[#101a2c] sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          <MonitorSmartphone className="h-4 w-4" />
        </div>
  
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-[#0b1220] dark:text-white">
            {session.deviceName ||
              "Unnamed device"}
          </p>
  
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {session.ipAddress ||
              "IP unavailable"}
          </p>
        </div>
  
        <div className="grid shrink-0 gap-1 text-xs text-slate-500 dark:text-slate-400 sm:min-w-64">
          <p>
            Signed in:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatInstant(
                session.issuedAt,
                dateFormat,
              )}
            </span>
          </p>
  
          <p>
            Expires:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatInstant(
                session.expiresAt,
                dateFormat,
              )}
            </span>
          </p>
        </div>
  
        <button
          type="button"
          onClick={onSignOut}
          disabled={revoking}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        >
          {revoking ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
  
          Sign out
        </button>
      </article>
    );
  }
  
  function InfoTile({
    icon: Icon,
    label,
    value,
    helper,
    tone = "default",
  }) {
    const toneClass =
      tone === "success"
        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
        : tone === "warning"
          ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300";
  
    return (
      <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-[#0b1424] dark:hover:border-slate-600 dark:hover:bg-[#101a2c]">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
  
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              {label}
            </p>
  
            <p className="mt-1 break-words text-sm font-extrabold text-[#0b1220] dark:text-white">
              {value}
            </p>
  
            {helper && (
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {helper}
              </p>
            )}
          </div>
        </div>
      </article>
    );
  }
  
  function StatusBadge({
    active,
    label,
  }) {
    return (
      <span
        className={`rounded-full px-2 py-1 text-[0.65rem] font-extrabold ${
          active
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {label}
      </span>
    );
  }
function ConfirmationDialog({
    confirmation,
    submitting,
    onCancel,
    onConfirm,
  }) {
    const signOutAll =
      confirmation.type === "all";
  
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onCancel}
          disabled={submitting}
          className="absolute inset-0"
        />
  
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-md rounded-[1.4rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#101a2c]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <LogOut className="h-4 w-4" />
          </div>
  
          <h2 className="mt-4 text-xl font-extrabold tracking-[-0.025em] text-[#0b1220] dark:text-white">
            {signOutAll
              ? "Sign out all devices?"
              : "Sign out this device?"}
          </h2>
  
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {signOutAll
              ? "All active sessions will be removed, including this browser. You must sign in again."
              : `The ${
                  confirmation.session
                    ?.deviceName ||
                  "selected device"
                } session will be removed.`}
          </p>
  
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className={
                SECONDARY_BUTTON_CLASS
              }
            >
              Cancel
            </button>
  
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
  
              {submitting
                ? "Signing out..."
                : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  function SettingsLoading() {
    return (
      <div className="mx-auto w-full max-w-[1480px] animate-pulse px-4 py-7 sm:px-6 lg:px-8 lg:py-9 overflow-x-hidden">
        <div className="h-28 rounded-[1.4rem] bg-slate-200 dark:bg-slate-800" />
  
        <div className="mt-8 h-28 rounded-[1.4rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101a2c]" />
  
        <div className="mt-6 space-y-6">
          {[
            "profile",
            "preferences",
            "sessions",
            "password",
            "account-info",
          ].map((key) => (
            <div
              key={key}
              className="h-64 rounded-[1.4rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101a2c]"
            />
          ))}
        </div>
      </div>
    );
  }