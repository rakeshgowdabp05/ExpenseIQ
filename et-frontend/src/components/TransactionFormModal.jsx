import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  FileImage,
  FileText,
  Hash,
  LoaderCircle,
  Mic,
  MicOff,
  ScanText,
  Sparkles,
  Store,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  TRANSACTION_FORM_LIMITS,
  TRANSACTION_TYPE_OPTIONS,
} from "../config/transactionOptions";
import { receiptOcrService } from "../services/receiptOcrService";
import { transactionService } from "../services/transactionService";
import { getApiErrorMessage } from "../utils/apiError";

const inputClassName =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#2457d6] focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800";

const inputWithIconClassName =
  `${inputClassName} pl-11`;

const SMART_SUGGESTION_LIMIT = 8;

function getTodayValue() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60_000,
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

function createInitialFormData(
  transaction,
) {
  if (transaction) {
    return {
      transactionType:
        transaction.transactionType,

      accountPublicId:
        transaction.account?.publicId ??
        "",

      destinationAccountPublicId:
        transaction.destinationAccount
          ?.publicId ?? "",

      categoryPublicId:
        transaction.category?.publicId ??
        "",

      amount:
        transaction.amount?.toString() ??
        "",

      transactionDate:
        transaction.transactionDate ??
        getTodayValue(),

      merchantName:
        transaction.merchantName ?? "",

      description:
        transaction.description ?? "",

      referenceNumber:
        transaction.referenceNumber ?? "",
    };
  }

  return {
    transactionType: "EXPENSE",
    accountPublicId: "",
    destinationAccountPublicId: "",
    categoryPublicId: "",
    amount: "",
    transactionDate: getTodayValue(),
    merchantName: "",
    description: "",
    referenceNumber: "",
  };
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function getBrowserSpeechRecognition() {
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );
}

function getSuggestionKey(suggestion) {
  return [
    suggestion.transactionType,
    suggestion.merchantName,
    suggestion.accountPublicId,
    suggestion.categoryPublicId,
    suggestion.lastUsedDate,
  ]
    .filter(Boolean)
    .join("-");
}

function getSuggestionSubtitle(suggestion) {
  const parts = [
    suggestion.categoryName,
    suggestion.accountName,
    suggestion.currencyCode,
  ].filter(Boolean);

  if (suggestion.usageCount) {
    parts.push(
      `${suggestion.usageCount} previous use${
        suggestion.usageCount === 1
          ? ""
          : "s"
      }`,
    );
  }

  return parts.join(" · ");
}

function getReceiptAmount(parsed) {
  return (
    parsed?.totalAmount ??
    parsed?.amount ??
    null
  );
}

export default function TransactionFormModal({
  transaction,
  accounts,
  categories,
  onClose,
  onSaved,
}) {
  const editing = Boolean(transaction);

  const todayValue = getTodayValue();

  const [formData, setFormData] =
    useState(() =>
      createInitialFormData(transaction),
    );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const [
    suggestionsLoading,
    setSuggestionsLoading,
  ] = useState(false);

  const [
    suggestionError,
    setSuggestionError,
  ] = useState("");

  const [
    listening,
    setListening,
  ] = useState(false);

  const [
    receiptScanning,
    setReceiptScanning,
  ] = useState(false);

  const [
    receiptProgress,
    setReceiptProgress,
  ] = useState(0);

  const [
    receiptFileName,
    setReceiptFileName,
  ] = useState("");

  const [
    receiptUploadFile,
    setReceiptUploadFile,
  ] = useState(null);

  const [
    receiptPreviewUrl,
    setReceiptPreviewUrl,
  ] = useState("");

  const [
    receiptResult,
    setReceiptResult,
  ] = useState(null);

  const [
    receiptError,
    setReceiptError,
  ] = useState("");

  const speechRecognitionRef =
    useRef(null);

  const keepListeningRef =
    useRef(false);

  const activeAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => account.active,
      ),
    [accounts],
  );

  const sourceAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.publicId ===
          formData.accountPublicId,
      ) ?? null,
    [accounts, formData.accountPublicId],
  );

  const selectableSourceAccounts =
    useMemo(() => {
      if (
        !editing ||
        !transaction?.account
      ) {
        return activeAccounts;
      }

      const currentAccountIncluded =
        activeAccounts.some(
          (account) =>
            account.publicId ===
            transaction.account.publicId,
        );

      if (currentAccountIncluded) {
        return activeAccounts;
      }

      return [
        {
          ...transaction.account,
          active: false,
        },
        ...activeAccounts,
      ];
    }, [
      activeAccounts,
      editing,
      transaction,
    ]);

  const destinationAccounts = useMemo(
    () => {
      if (!sourceAccount) {
        return [];
      }

      const matchingAccounts =
        activeAccounts.filter(
          (account) =>
            account.publicId !==
              sourceAccount.publicId &&
            account.currencyCode ===
              sourceAccount.currencyCode,
        );

      if (
        editing &&
        transaction?.destinationAccount &&
        !matchingAccounts.some(
          (account) =>
            account.publicId ===
            transaction.destinationAccount
              .publicId,
        )
      ) {
        return [
          {
            ...transaction.destinationAccount,
            active: false,
          },
          ...matchingAccounts,
        ];
      }

      return matchingAccounts;
    },
    [
      activeAccounts,
      editing,
      sourceAccount,
      transaction,
    ],
  );

  const matchingCategories =
    useMemo(() => {
      if (
        formData.transactionType ===
        "TRANSFER"
      ) {
        return [];
      }

      const matching =
        categories.filter(
          (category) =>
            category.categoryType ===
            formData.transactionType,
        );

      if (
        !editing ||
        !transaction?.category
      ) {
        return matching.filter(
          (category) => category.active,
        );
      }

      const activeMatching =
        matching.filter(
          (category) => category.active,
        );

      const currentIncluded =
        activeMatching.some(
          (category) =>
            category.publicId ===
            transaction.category.publicId,
        );

      if (currentIncluded) {
        return activeMatching;
      }

      return [
        {
          ...transaction.category,
          active: false,
        },
        ...activeMatching,
      ];
    }, [
      categories,
      editing,
      formData.transactionType,
      transaction,
    ]);

  const noActiveAccounts =
    selectableSourceAccounts.length ===
    0;

  const noMatchingCategories =
    formData.transactionType !==
      "TRANSFER" &&
    matchingCategories.length === 0;

  const transferAvailable =
    destinationAccounts.length > 0;

  const selectedSourceInactive =
    sourceAccount?.active === false;

  const selectedDestinationInactive =
    destinationAccounts.some(
      (account) =>
        account.publicId ===
          formData.destinationAccountPublicId &&
        account.active === false,
    );

  useEffect(() => {
    if (
      editing ||
      formData.transactionType ===
        "TRANSFER"
    ) {
      return undefined;
    }

    let active = true;

    const timer = window.setTimeout(
      async () => {
        setSuggestionsLoading(true);
        setSuggestionError("");

        try {
          const results =
            await transactionService
              .getSuggestions({
                type:
                  formData.transactionType,

                query:
                  formData.merchantName,

                limit:
                  SMART_SUGGESTION_LIMIT,
              });

          if (active) {
            setSuggestions(
              Array.isArray(results)
                ? results
                : [],
            );
          }
        } catch (error) {
          if (active) {
            setSuggestionError(
              getApiErrorMessage(
                error,
                "Unable to load smart suggestions.",
              ),
            );
          }
        } finally {
          if (active) {
            setSuggestionsLoading(false);
          }
        }
      },
      300,
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    editing,
    formData.merchantName,
    formData.transactionType,
  ]);

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;

      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onend =
          null;

        speechRecognitionRef.current.stop();
        speechRecognitionRef.current =
          null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) {
        URL.revokeObjectURL(
          receiptPreviewUrl,
        );
      }
    };
  }, [receiptPreviewUrl]);

  function updateField(event) {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function selectTransactionType(
    transactionType,
  ) {
    setFormData((current) => ({
      ...current,
      transactionType,
      categoryPublicId: "",
      destinationAccountPublicId: "",
      merchantName:
        transactionType === "TRANSFER"
          ? ""
          : current.merchantName,
    }));
  }

  function selectSourceAccount(event) {
    const nextAccountPublicId =
      event.target.value;

    setFormData((current) => ({
      ...current,
      accountPublicId:
        nextAccountPublicId,
      destinationAccountPublicId: "",
    }));
  }

  function applySuggestion(
    suggestion,
  ) {
    setFormData((current) => ({
      ...current,

      transactionType:
        suggestion.transactionType ??
        current.transactionType,

      merchantName:
        suggestion.merchantName ??
        current.merchantName,

      description:
        suggestion.description ??
        current.description,

      amount:
        current.amount ||
        (suggestion.suggestedAmount
          ? String(
              suggestion.suggestedAmount,
            )
          : current.amount),

      accountPublicId:
        suggestion.accountPublicId ??
        current.accountPublicId,

      categoryPublicId:
        suggestion.categoryPublicId ??
        current.categoryPublicId,

      destinationAccountPublicId: "",
    }));
  }

  function appendVoiceText(transcript) {
    const cleanedText =
      normalizeText(transcript);

    if (!cleanedText) {
      return;
    }

    setFormData((current) => ({
      ...current,
      description: [
        current.description,
        cleanedText,
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }

  function stopVoiceInput() {
    keepListeningRef.current = false;

    const recognition =
      speechRecognitionRef.current;

    if (recognition) {
      recognition.onend = null;
      recognition.stop();
    }

    speechRecognitionRef.current = null;
    setListening(false);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      getBrowserSpeechRecognition();

    if (!SpeechRecognition) {
      setErrorMessage(
        "Voice input is not supported by this browser.",
      );

      return;
    }

    if (listening) {
      stopVoiceInput();
      return;
    }

    setErrorMessage("");
    setListening(true);
    keepListeningRef.current = true;

    const createRecognition = () => {
      const recognition =
        new SpeechRecognition();

      recognition.lang =
        navigator.language || "en-IN";

      recognition.interimResults = false;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        for (
          let index =
            event.resultIndex;
          index <
          event.results.length;
          index += 1
        ) {
          const result =
            event.results[index];

          if (!result?.isFinal) {
            continue;
          }

          appendVoiceText(
            result[0]?.transcript ??
              "",
          );
        }
      };

      recognition.onerror = (event) => {
        if (
          event?.error ===
            "no-speech" ||
          event?.error === "aborted"
        ) {
          return;
        }

        keepListeningRef.current = false;
        setListening(false);

        setErrorMessage(
          "Voice input could not be captured. Try again.",
        );
      };

      recognition.onend = () => {
        if (
          !keepListeningRef.current
        ) {
          setListening(false);
          return;
        }

        try {
          const nextRecognition =
            createRecognition();

          speechRecognitionRef.current =
            nextRecognition;

          nextRecognition.start();
        } catch {
          keepListeningRef.current = false;
          setListening(false);
        }
      };

      return recognition;
    };

    try {
      const recognition =
        createRecognition();

      speechRecognitionRef.current =
        recognition;

      recognition.start();
    } catch {
      keepListeningRef.current = false;
      setListening(false);

      setErrorMessage(
        "Voice input could not be started. Check microphone permission and try again.",
      );
    }
  }

  function applyReceiptParsedData(
    parsed,
    historySuggestion,
  ) {
    setFormData((current) => {
      const parsedAmount =
        getReceiptAmount(parsed);

      return {
        ...current,

        merchantName:
          current.transactionType ===
          "TRANSFER"
            ? current.merchantName
            : parsed.merchantName ??
              current.merchantName,

        amount:
          parsedAmount ??
          current.amount,

        transactionDate:
          parsed.transactionDate ??
          current.transactionDate,

        referenceNumber:
          parsed.referenceNumber ??
          current.referenceNumber,

        description:
          parsed.description ??
          current.description,

        accountPublicId:
          historySuggestion?.accountPublicId ??
          current.accountPublicId,

        categoryPublicId:
          historySuggestion?.categoryPublicId ??
          current.categoryPublicId,

        destinationAccountPublicId: "",
      };
    });
  }

  async function findReceiptHistorySuggestion(
    parsed,
  ) {
    if (
      formData.transactionType ===
        "TRANSFER" ||
      !parsed?.merchantName
    ) {
      return null;
    }

    try {
      const results =
        await transactionService
          .getSuggestions({
            type:
              formData.transactionType,

            query:
              parsed.merchantName,

            limit: 1,
          });

      return Array.isArray(results)
        ? results[0] ?? null
        : null;
    } catch {
      return null;
    }
  }

  async function handleReceiptUpload(event) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (receiptPreviewUrl) {
      URL.revokeObjectURL(
        receiptPreviewUrl,
      );
    }

    setReceiptScanning(true);
    setReceiptProgress(0);
    setReceiptError("");
    setReceiptResult(null);
    setReceiptUploadFile(file);
    setReceiptFileName(file.name);
    setReceiptPreviewUrl(
      URL.createObjectURL(file),
    );

    try {
      const parsed =
        await receiptOcrService
          .scanReceiptImage(file, {
            onProgress(progress) {
              setReceiptProgress(
                progress,
              );
            },
          });

      const historySuggestion =
        await findReceiptHistorySuggestion(
          parsed,
        );

      applyReceiptParsedData(
        parsed,
        historySuggestion,
      );

      setReceiptResult({
        ...parsed,
        totalAmount:
          getReceiptAmount(parsed),
        matchedHistory:
          Boolean(historySuggestion),
        extractionSource:
          "Browser OCR",
      });

      setReceiptProgress(100);
    } catch (error) {
      setReceiptError(
        error?.message ||
          "Unable to scan this receipt.",
      );
    } finally {
      setReceiptScanning(false);
    }
  }

  function createPayload() {
    return {
      transactionType:
        formData.transactionType,

      accountPublicId:
        formData.accountPublicId,

      destinationAccountPublicId:
        formData.transactionType ===
        "TRANSFER"
          ? formData
              .destinationAccountPublicId
          : null,

      categoryPublicId:
        formData.transactionType ===
        "TRANSFER"
          ? null
          : formData.categoryPublicId,

      amount: formData.amount,

      transactionDate:
        formData.transactionDate,

      merchantName:
        formData.transactionType ===
        "TRANSFER"
          ? null
          : normalizeText(
              formData.merchantName,
            ) || null,

      description:
        normalizeText(
          formData.description,
        ) || null,

      referenceNumber:
        normalizeText(
          formData.referenceNumber,
        ) || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload = createPayload();

      const result = editing
        ? await transactionService
            .updateTransaction(
              transaction.publicId,
              payload,
            )
        : await transactionService
            .createTransaction(payload);

      const savedTransaction =
        result?.data ?? result;

      if (
        !editing &&
        receiptUploadFile &&
        savedTransaction?.publicId
      ) {
        try {
          await transactionService.uploadReceipt(
            savedTransaction.publicId,
            receiptUploadFile,
          );

          onSaved(
            "Transaction created and receipt attached successfully.",
          );

          return;
        } catch {
          onSaved(
            "Transaction created successfully. Receipt attachment could not be saved.",
          );

          return;
        }
      }

      onSaved(
        result?.message ||
          (editing
            ? "Transaction updated successfully."
            : "Transaction created successfully."),
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          editing
            ? "Unable to update the transaction."
            : "Unable to post the transaction.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#101a2c] overflow-x-hidden">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#2457d6] dark:text-cyan-300">
              Smart transaction entry
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[#080808] dark:text-white">
              {editing
                ? "Edit transaction"
                : "Post transaction"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Receipt OCR, voice notes and smart suggestions work from your secured records.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label="Close transaction form"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-5 py-6 sm:px-6"
        >
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <FormField
            label="Transaction type"
            required
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {TRANSACTION_TYPE_OPTIONS.map(
                (option) => (
                  <TransactionTypeButton
                    key={option.value}
                    option={option}
                    selected={
                      formData.transactionType ===
                      option.value
                    }
                    onClick={() =>
                      selectTransactionType(
                        option.value,
                      )
                    }
                  />
                ),
              )}
            </div>
          </FormField>

          {!editing && (
            <ReceiptOcrPanel
              scanning={receiptScanning}
              progress={receiptProgress}
              fileName={receiptFileName}
              previewUrl={receiptPreviewUrl}
              result={receiptResult}
              error={receiptError}
              onUpload={handleReceiptUpload}
            />
          )}

          {!editing &&
            formData.transactionType !==
              "TRANSFER" && (
              <SmartSuggestionPanel
                suggestions={suggestions}
                loading={suggestionsLoading}
                error={suggestionError}
                onApply={applySuggestion}
              />
            )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={
                formData.transactionType ===
                "TRANSFER"
                  ? "Source account"
                  : "Financial account"
              }
              required
            >
              <select
                name="accountPublicId"
                value={
                  formData.accountPublicId
                }
                onChange={selectSourceAccount}
                required
                disabled={noActiveAccounts}
                className={inputClassName}
              >
                <option value="">
                  Select an account
                </option>

                {selectableSourceAccounts.map(
                  (account) => (
                    <option
                      key={account.publicId}
                      value={account.publicId}
                      disabled={
                        account.active ===
                        false
                      }
                    >
                      {account.name} ·{" "}
                      {account.currencyCode}
                      {account.active ===
                      false
                        ? " (inactive)"
                        : ""}
                    </option>
                  ),
                )}
              </select>

              {selectedSourceInactive && (
                <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                  This account is inactive. Select an active account or reactivate it before saving.
                </p>
              )}
            </FormField>

            {formData.transactionType ===
            "TRANSFER" ? (
              <FormField
                label="Destination account"
                required
              >
                <select
                  name="destinationAccountPublicId"
                  value={
                    formData
                      .destinationAccountPublicId
                  }
                  onChange={updateField}
                  required
                  disabled={
                    !sourceAccount ||
                    !transferAvailable
                  }
                  className={inputClassName}
                >
                  <option value="">
                    {sourceAccount
                      ? "Select destination account"
                      : "Select source account first"}
                  </option>

                  {destinationAccounts.map(
                    (account) => (
                      <option
                        key={account.publicId}
                        value={account.publicId}
                        disabled={
                          account.active ===
                          false
                        }
                      >
                        {account.name} ·{" "}
                        {account.currencyCode}
                        {account.active ===
                        false
                          ? " (inactive)"
                          : ""}
                      </option>
                    ),
                  )}
                </select>

                {sourceAccount &&
                  !transferAvailable && (
                    <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                      No other active account uses {sourceAccount.currencyCode}.
                    </p>
                  )}

                {selectedDestinationInactive && (
                  <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                    This destination account is inactive. Select an active destination or reactivate it before saving.
                  </p>
                )}
              </FormField>
            ) : (
              <FormField
                label="Category"
                required
              >
                <select
                  name="categoryPublicId"
                  value={
                    formData.categoryPublicId
                  }
                  onChange={updateField}
                  required
                  disabled={
                    noMatchingCategories
                  }
                  className={inputClassName}
                >
                  <option value="">
                    Select a category
                  </option>

                  {matchingCategories.map(
                    (category) => (
                      <option
                        key={
                          category.publicId
                        }
                        value={
                          category.publicId
                        }
                        disabled={
                          category.active ===
                          false
                        }
                      >
                        {category.name}
                        {category.active ===
                        false
                          ? " (inactive)"
                          : ""}
                      </option>
                    ),
                  )}
                </select>

                {noMatchingCategories && (
                  <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                    No active {formData.transactionType.toLowerCase()} category is available.
                  </p>
                )}
              </FormField>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Amount"
              required
            >
              <div className="relative">
                <CircleDollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={updateField}
                  required
                  className={
                    inputWithIconClassName
                  }
                  placeholder="0.00"
                />
              </div>
            </FormField>

            <FormField
              label="Transaction date"
              required
            >
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                  name="transactionDate"
                  type="date"
                  value={
                    formData.transactionDate
                  }
                  onChange={updateField}
                  max={todayValue}
                  required
                  className={
                    inputWithIconClassName
                  }
                />
              </div>
            </FormField>
          </div>

          {formData.transactionType !==
            "TRANSFER" && (
            <FormField label="Merchant or payee">
              <div className="relative">
                <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                  name="merchantName"
                  value={
                    formData.merchantName
                  }
                  onChange={updateField}
                  maxLength={
                    TRANSACTION_FORM_LIMITS
                      .merchantMaxLength
                  }
                  list="transaction-merchant-suggestions"
                  className={
                    inputWithIconClassName
                  }
                  placeholder="Example: Grocery store, salary, fuel station"
                />

                <datalist id="transaction-merchant-suggestions">
                  {suggestions.map(
                    (suggestion) => (
                      <option
                        key={getSuggestionKey(
                          suggestion,
                        )}
                        value={
                          suggestion.merchantName
                        }
                      />
                    ),
                  )}
                </datalist>
              </div>
            </FormField>
          )}

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <FormField label="Description">
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={updateField}
                  maxLength={
                    TRANSACTION_FORM_LIMITS
                      .descriptionMaxLength
                  }
                  className={
                    inputWithIconClassName
                  }
                  placeholder="Add useful notes"
                />
              </div>
            </FormField>

            <div className="flex items-end">
              <button
                type="button"
                onClick={startVoiceInput}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition ${
                  listening
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#2457d6] hover:text-[#2457d6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {listening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}

                {listening
                  ? "Stop voice"
                  : "Voice note"}
              </button>
            </div>
          </div>

          <FormField label="Reference number">
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

              <input
                name="referenceNumber"
                value={
                  formData.referenceNumber
                }
                onChange={updateField}
                maxLength={
                  TRANSACTION_FORM_LIMITS
                    .referenceMaxLength
                }
                className={
                  inputWithIconClassName
                }
                placeholder="Bill number, UPI reference, invoice ID"
              />
            </div>
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                noActiveAccounts ||
                noMatchingCategories ||
                (formData.transactionType ===
                  "TRANSFER" &&
                  !transferAvailable)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2457d6] px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {submitting
                ? "Saving..."
                : editing
                  ? "Save transaction"
                  : "Post transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReceiptOcrPanel({
  scanning,
  progress,
  fileName,
  previewUrl,
  result,
  error,
  onUpload,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2457d6] dark:bg-blue-500/10 dark:text-blue-300">
            <ScanText className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-[#0b1220] dark:text-white">
              Receipt OCR upload
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Upload a receipt image. ExpenseIQ scans merchant, amount, date and reference, then matches your transaction history for account and category.
            </p>
          </div>
        </div>

        <label
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition ${
            scanning
              ? "cursor-not-allowed bg-blue-400"
              : "cursor-pointer bg-[#2457d6] hover:bg-[#1f4fc4]"
          }`}
        >
          <UploadCloud className="h-4 w-4" />

          {scanning
            ? "Scanning..."
            : "Upload receipt"}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            onChange={onUpload}
            disabled={scanning}
            className="sr-only"
          />
        </label>
      </div>

      {(previewUrl ||
        scanning ||
        result ||
        error) && (
        <div className="mt-4 grid gap-4 md:grid-cols-[120px_1fr]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Uploaded receipt preview"
              className="h-28 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
            />
          ) : (
            <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
              <FileImage className="h-6 w-6" />
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            {fileName && (
              <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                {fileName}
              </p>
            )}

            {scanning && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>
                    Scanning receipt details
                  </span>
                  <span>{progress}%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#2457d6] transition-all duration-300"
                    style={{
                      width: `${Math.max(progress, 5)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm font-bold text-rose-600 dark:text-rose-300">
                {error}
              </p>
            )}

            {result && (
              <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <p>
                  <span className="font-black text-slate-900 dark:text-white">
                    Merchant:
                  </span>{" "}
                  {result.merchantName ||
                    "Not detected"}
                </p>

                <p>
                  <span className="font-black text-slate-900 dark:text-white">
                    Amount:
                  </span>{" "}
                  {result.totalAmount ||
                    "Not detected"}
                </p>

                <p>
                  <span className="font-black text-slate-900 dark:text-white">
                    Date:
                  </span>{" "}
                  {result.transactionDate ||
                    "Not detected"}
                </p>

                <p>
                  <span className="font-black text-slate-900 dark:text-white">
                    Reference:
                  </span>{" "}
                  {result.referenceNumber ||
                    "Not detected"}
                </p>

                <p>
                  <span className="font-black text-slate-900 dark:text-white">
                    Source:
                  </span>{" "}
                  {result.extractionSource ||
                    "Browser OCR"}
                </p>

                <p>
                  <span className="font-black text-slate-900 dark:text-white">
                    Match:
                  </span>{" "}
                  {result.matchedHistory
                    ? "History matched"
                    : "Manual category may be needed"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function SmartSuggestionPanel({
  suggestions,
  loading,
  error,
  onApply,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-slate-300">
        <div className="flex items-center gap-2 font-extrabold text-[#2457d6] dark:text-blue-300">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Finding smart suggestions from your history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
        {error}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="flex min-w-0 items-start gap-3">
          <Sparkles className="mt-0.5 h-4.5 w-4.5 text-[#2457d6] dark:text-blue-300" />

          <div>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">
              Smart suggestions will appear after you have matching transaction history.
            </p>

            <p className="mt-1 text-xs leading-5">
              ExpenseIQ never invents merchants or categories. It learns only from your posted records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4.5 w-4.5 text-[#2457d6] dark:text-blue-300" />

        <p className="text-sm font-black text-[#0b1220] dark:text-white">
          Smart suggestions
        </p>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          From your real history
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={getSuggestionKey(suggestion)}
            type="button"
            onClick={() =>
              onApply(suggestion)
            }
            className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#2457d6] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="truncate text-sm font-black text-[#0b1220] dark:text-white">
              {suggestion.merchantName}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {getSuggestionSubtitle(
                suggestion,
              )}
            </p>

            {suggestion.suggestedAmount && (
              <p className="mt-2 text-xs font-extrabold text-[#2457d6] dark:text-blue-300">
                Suggested amount:{" "}
                {suggestion.currencyCode}{" "}
                {suggestion.suggestedAmount}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function TransactionTypeButton({
  option,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#2457d6] bg-blue-50 ring-4 ring-blue-600/10 dark:bg-blue-500/10"
          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      }`}
    >
      <TransactionTypeChoiceIcon
        transactionType={option.value}
        selected={selected}
      />

      <p className="mt-3 text-sm font-black">
        {option.label}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {option.description}
      </p>
    </button>
  );
}

function TransactionTypeChoiceIcon({
  transactionType,
  selected,
}) {
  const className = `h-5 w-5 ${
    selected
      ? "text-[#2457d6] dark:text-cyan-300"
      : "text-slate-400"
  }`;

  if (transactionType === "INCOME") {
    return (
      <ArrowDownLeft className={className} />
    );
  }

  if (transactionType === "TRANSFER") {
    return (
      <ArrowRightLeft className={className} />
    );
  }

  return (
    <ArrowUpRight className={className} />
  );
}

function FormField({
  label,
  required,
  children,
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </p>

      {children}
    </div>
  );
}