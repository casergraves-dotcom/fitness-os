"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  useDexaRecords,
} from "../hooks/useDexaRecords";

import type {
  DexaRecord,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

interface DexaFormState {
  scanDate:
    string;

  weightLb:
    string;

  bodyFatPercent:
    string;

  fatMassLb:
    string;

  leanMassLb:
    string;

  notes:
    string;
}


// ============================================================
// Helpers
// ============================================================

function formatLocalDate(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
      1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function formatDisplayDate(
  date:
    string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}


function parseOptionalNumber(
  value:
    string
) {
  if (
    value.trim() ===
    ""
  ) {
    return undefined;
  }

  const parsed =
    Number(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : undefined;
}


function createEmptyForm():
DexaFormState {
  return {
    scanDate:
      formatLocalDate(
        new Date()
      ),

    weightLb:
      "",

    bodyFatPercent:
      "",

    fatMassLb:
      "",

    leanMassLb:
      "",

    notes:
      "",
  };
}


function createFormFromRecord(
  record:
    DexaRecord
):
DexaFormState {
  function value(
    number:
      number |
      undefined
  ) {
    return number ===
      undefined
      ? ""
      : String(
          number
        );
  }

  return {
    scanDate:
      record.scanDate,

    weightLb:
      value(
        record.weightLb
      ),

    bodyFatPercent:
      value(
        record.bodyFatPercent
      ),

    fatMassLb:
      value(
        record.fatMassLb
      ),

    leanMassLb:
      value(
        record.leanMassLb
      ),

    notes:
      record.notes ??
      "",
  };
}


// ============================================================
// Component
// ============================================================

export default function DexaRecords() {
  const {
    loaded,
    user,
    records,
    addDexaRecord,
    updateDexaRecord,
    deleteDexaRecord,
    openDexaReport,
  } =
    useDexaRecords();

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<
      DexaFormState
    >(
      createEmptyForm
    );

  const [
    reportFile,
    setReportFile,
  ] =
    useState<
      File |
      null
    >(
      null
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    earlierId,
    setEarlierId,
  ] =
    useState("");

  const [
    laterId,
    setLaterId,
  ] =
    useState("");


  const chronologicalRecords =
    useMemo(
      () =>
        [...records].sort(
          (
            a,
            b
          ) =>
            a.scanDate.localeCompare(
              b.scanDate
            ) ||
            a.createdAt.localeCompare(
              b.createdAt
            )
        ),
      [
        records,
      ]
    );

  const earlierRecord =
    chronologicalRecords.find(
      (
        record
      ) =>
        record.id ===
        earlierId
    );

  const laterRecord =
    chronologicalRecords.find(
      (
        record
      ) =>
        record.id ===
        laterId
    );


  const editingRecord =
    editingId
      ? records.find(
          (
            record
          ) =>
            record.id ===
            editingId
        ) ??
        null
      : null;


  // ----------------------------------------------------------
  // Form
  // ----------------------------------------------------------

  function updateField(
    field:
      keyof DexaFormState,
    value:
      string
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        [field]:
          value,
      })
    );
  }


  function beginAdd() {
    setEditingId(
      null
    );

    setForm(
      createEmptyForm()
    );

    setReportFile(
      null
    );

    setMessage(
      null
    );

    setFormOpen(
      true
    );
  }


  function beginEdit(
    record:
      DexaRecord
  ) {
    setEditingId(
      record.id
    );

    setForm(
      createFormFromRecord(
        record
      )
    );

    setReportFile(
      null
    );

    setMessage(
      null
    );

    setFormOpen(
      true
    );
  }


  function cancelForm() {
    setFormOpen(
      false
    );

    setEditingId(
      null
    );

    setReportFile(
      null
    );

    setMessage(
      null
    );
  }


  async function saveRecord() {
    const weightLb =
      parseOptionalNumber(
        form.weightLb
      );

    const bodyFatPercent =
      parseOptionalNumber(
        form.bodyFatPercent
      );

    const fatMassLb =
      parseOptionalNumber(
        form.fatMassLb
      );

    const leanMassLb =
      parseOptionalNumber(
        form.leanMassLb
      );

    const numericValues = [
      weightLb,
      bodyFatPercent,
      fatMassLb,
      leanMassLb,
    ].filter(
      (
        value
      ): value is number =>
        value !==
        undefined
    );

    if (
      numericValues.length ===
        0 &&
      !reportFile &&
      !editingRecord?.reportFile
    ) {
      setMessage(
        "Enter at least one DEXA value or attach the original report."
      );

      return;
    }

    if (
      numericValues.some(
        (
          value
        ) =>
          value <=
          0
      )
    ) {
      setMessage(
        "DEXA values must be greater than zero."
      );

      return;
    }

    if (
      bodyFatPercent !==
        undefined &&
      bodyFatPercent >=
        100
    ) {
      setMessage(
        "Body fat must be between 0 and 100%."
      );

      return;
    }

    if (
      reportFile &&
      !user
    ) {
      setMessage(
        "Sign in before attaching a DEXA report. Manual DEXA values can still be saved without a file."
      );

      return;
    }

    setSaving(
      true
    );

    setMessage(
      null
    );

    try {
      const input = {
        scanDate:
          form.scanDate,

        weightLb,

        bodyFatPercent,

        fatMassLb,

        leanMassLb,

        notes:
          form.notes.trim() !==
          ""
            ? form.notes.trim()
            : undefined,
      };

      if (
        editingId
      ) {
        await updateDexaRecord(
          editingId,
          input
        );
      } else {
        await addDexaRecord(
          input,
          reportFile ??
          undefined
        );
      }

      setFormOpen(
        false
      );

      setEditingId(
        null
      );

      setReportFile(
        null
      );
    } catch (
      error
    ) {
      console.error(
        "DEXA save failed:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "DEXA save failed."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading DEXA records...
        </p>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="space-y-4">

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              DEXA Records
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Scan History
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Store DEXA results as a distinct assessment source.
              You can enter the reported values manually and optionally
              keep the original report with the scan.
            </p>

          </div>


          {!formOpen && (
            <Button
              type="button"
              onClick={
                beginAdd
              }
              className="gap-2"
            >
              <Plus
                size={16}
              />

              Add DEXA Scan
            </Button>
          )}

        </div>


        {records.length ===
          0 && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">

            <p className="text-sm font-semibold text-slate-900">
              No DEXA scans yet
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add a scan when you have one. DEXA remains separate
              from home-scale estimates while still contributing its
              measurements to body-composition history.
            </p>

          </div>
        )}

      </div>


      {formOpen && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            {editingId
              ? "Edit DEXA Scan"
              : "New DEXA Scan"}
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {editingId
              ? "Correct Scan Results"
              : "Record Scan Results"}
          </h3>


          <div className="mt-5 space-y-5">

            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Scan Date
              </span>

              <Input
                type="date"
                value={
                  form.scanDate
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "scanDate",
                    event.target.value
                  )
                }
                className="mt-2"
              />

            </label>


            <div className="grid gap-4 sm:grid-cols-2">

              <NumberField
                label="Body Weight"
                unit="lb"
                value={
                  form.weightLb
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "weightLb",
                    value
                  )
                }
              />

              <NumberField
                label="Body Fat"
                unit="%"
                value={
                  form.bodyFatPercent
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "bodyFatPercent",
                    value
                  )
                }
              />

              <NumberField
                label="Fat Mass"
                unit="lb"
                value={
                  form.fatMassLb
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "fatMassLb",
                    value
                  )
                }
              />

              <NumberField
                label="Lean Mass"
                unit="lb"
                value={
                  form.leanMassLb
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "leanMassLb",
                    value
                  )
                }
              />

            </div>


            {editingId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="text-sm font-semibold text-slate-800">
                  Original DEXA Report
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {editingRecord?.reportFile
                    ? editingRecord.reportFile.fileName
                    : "No report attached"}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Editing scan values preserves the existing report.
                  Report replacement or removal will be handled as a
                  separate intentional action.
                </p>

              </div>
            ) : (
              <label className="block">

                <span className="text-sm font-semibold text-slate-800">
                  Original DEXA Report
                </span>

                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(
                    event
                  ) =>
                    setReportFile(
                      event.target
                        .files?.[0] ??
                      null
                    )
                  }
                  className="mt-2 block w-full text-sm text-slate-700"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Optional. Uploaded reports are stored in private
                  authenticated file storage. Manual scan values remain
                  usable even when no report is attached.
                </p>

              </label>
            )}


            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Notes
              </span>

              <Textarea
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Optional scan context"
                className="mt-2"
              />

            </label>


            {message && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">

                <p className="text-sm font-medium text-amber-800">
                  {
                    message
                  }
                </p>

              </div>
            )}


            <div className="flex flex-wrap justify-end gap-3">

              <Button
                type="button"
                onClick={
                  cancelForm
                }
                disabled={
                  saving
                }
                variant="outline"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  saveRecord
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Save DEXA Scan"}
              </Button>

            </div>

          </div>

        </div>
      )}


      {records.length >
        0 && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            DEXA History
          </p>

          <div className="mt-4 space-y-3">

            {records.map(
              (
                record
              ) => (
                <DexaHistoryItem
                  key={
                    record.id
                  }
                  record={
                    record
                  }
                  onEdit={() =>
                    beginEdit(
                      record
                    )
                  }
                  onOpenReport={
                    async () => {
                      try {
                        await openDexaReport(
                          record
                        );
                      } catch (
                        error
                      ) {
                        console.error(
                          "DEXA report open failed:",
                          error
                        );

                        window.alert(
                          "The attached DEXA report could not be opened. The scan values are still available."
                        );
                      }
                    }
                  }
                  onDelete={
                    async () => {
                      const confirmed =
                        window.confirm(
                          `Delete the DEXA scan from ${formatDisplayDate(
                            record.scanDate
                          )}? This will also remove its linked DEXA measurement and attached report.`
                        );

                      if (
                        !confirmed
                      ) {
                        return;
                      }

                      try {
                        await deleteDexaRecord(
                          record.id
                        );
                      } catch (
                        error
                      ) {
                        console.error(
                          "DEXA deletion failed:",
                          error
                        );

                        window.alert(
                          "The DEXA scan could not be fully deleted. Nothing else was removed after the failure."
                        );
                      }
                    }
                  }
                />
              )
            )}

          </div>

        </div>
      )}


      {records.length >
        1 && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            DEXA Comparison
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Compare Two Scans
          </h3>


          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <ScanSelect
              label="Earlier Scan"
              value={
                earlierId
              }
              records={
                chronologicalRecords
              }
              onChange={
                setEarlierId
              }
            />

            <ScanSelect
              label="Later Scan"
              value={
                laterId
              }
              records={
                chronologicalRecords
              }
              onChange={
                setLaterId
              }
            />

          </div>


          {earlierRecord &&
            laterRecord &&
            earlierRecord.id !==
              laterRecord.id && (
            <DexaComparison
              earlier={
                earlierRecord
              }
              later={
                laterRecord
              }
            />
          )}

          {earlierRecord &&
            laterRecord &&
            earlierRecord.id ===
              laterRecord.id && (
            <p className="mt-4 text-sm text-amber-700">
              Select two different scans to compare.
            </p>
          )}

        </div>
      )}

    </div>
  );
}


// ============================================================
// Number Field
// ============================================================

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label:
    string;

  unit:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-slate-800">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-2">

        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          value={
            value
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          placeholder="Optional"
          className="w-full"
        />

        <span className="min-w-6 text-sm text-slate-500">
          {unit}
        </span>

      </div>

    </label>
  );
}


// ============================================================
// History Item
// ============================================================

function DexaHistoryItem({
  record,
  onEdit,
  onOpenReport,
  onDelete,
}: {
  record:
    DexaRecord;

  onEdit:
    () => void;

  onOpenReport:
    () => void;

  onDelete:
    () => void;
}) {
  const metrics = [
    [
      "Weight",
      record.weightLb,
      "lb",
    ],
    [
      "Body Fat",
      record.bodyFatPercent,
      "%",
    ],
    [
      "Fat Mass",
      record.fatMassLb,
      "lb",
    ],
    [
      "Lean Mass",
      record.leanMassLb,
      "lb",
    ],
  ] as const;

  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <p className="font-semibold text-slate-900">
            {
              formatDisplayDate(
                record.scanDate
              )
            }
          </p>

          <p className="mt-1 text-sm text-slate-500">
            DEXA
          </p>

        </div>


        <div className="flex flex-wrap gap-2">

          <Button
            type="button"
            onClick={
              onEdit
            }
            variant="outline"
            size="sm"
          >
            <Pencil
              size={15}
            />

            Edit
          </Button>

          {record.reportFile && (
            <Button
              type="button"
              onClick={
                onOpenReport
              }
              variant="outline"
              size="sm"
            >
              <FileText
                size={15}
              />

              Open Report
            </Button>
          )}

          <Button
            type="button"
            onClick={
              onDelete
            }
            variant="destructive"
            size="sm"
          >
            <Trash2
              size={15}
            />

            Delete
          </Button>

        </div>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

        {metrics.map(
          (
            [
              label,
              value,
              unit,
            ]
          ) => (
            <div
              key={
                label
              }
            >

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {value !==
                undefined
                  ? `${value} ${unit}`
                  : "—"}
              </p>

            </div>
          )
        )}

      </div>


      {record.reportFile && (
        <p className="mt-4 text-xs text-slate-500">
          Report:{" "}
          {
            record.reportFile.fileName
          }
        </p>
      )}


      {record.notes && (
        <div className="mt-4 border-t border-slate-200 pt-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            {
              record.notes
            }
          </p>

        </div>
      )}

    </div>
  );
}


// ============================================================
// Scan Select
// ============================================================

function ScanSelect({
  label,
  value,
  records,
  onChange,
}: {
  label:
    string;

  value:
    string;

  records:
    DexaRecord[];

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-slate-800">
        {label}
      </span>

      <Select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2"
      >
        <option value="">
          Select a scan
        </option>

        {records.map(
          (
            record
          ) => (
            <option
              key={
                record.id
              }
              value={
                record.id
              }
            >
              {
                formatDisplayDate(
                  record.scanDate
                )
              }
            </option>
          )
        )}

      </Select>

    </label>
  );
}


// ============================================================
// DEXA Comparison
// ============================================================

function DexaComparison({
  earlier,
  later,
}: {
  earlier:
    DexaRecord;

  later:
    DexaRecord;
}) {
  const chronological =
    earlier.scanDate.localeCompare(
      later.scanDate
    ) <=
    0
      ? {
          earlier,
          later,
        }
      : {
          earlier:
            later,

          later:
            earlier,
        };

  const metrics = [
    {
      label:
        "Weight",

      earlier:
        chronological.earlier.weightLb,

      later:
        chronological.later.weightLb,

      unit:
        "lb",
    },
    {
      label:
        "Body Fat",

      earlier:
        chronological.earlier.bodyFatPercent,

      later:
        chronological.later.bodyFatPercent,

      unit:
        "%",
    },
    {
      label:
        "Fat Mass",

      earlier:
        chronological.earlier.fatMassLb,

      later:
        chronological.later.fatMassLb,

      unit:
        "lb",
    },
    {
      label:
        "Lean Mass",

      earlier:
        chronological.earlier.leanMassLb,

      later:
        chronological.later.leanMassLb,

      unit:
        "lb",
    },
  ].filter(
    (
      metric
    ) =>
      metric.earlier !==
        undefined &&
      metric.later !==
        undefined
  );

  return (
    <div className="mt-5">

      <p className="text-sm text-slate-500">
        {
          formatDisplayDate(
            chronological.earlier.scanDate
          )
        }{" "}
        →{" "}
        {
          formatDisplayDate(
            chronological.later.scanDate
          )
        }
      </p>


      {metrics.length >
        0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">

          <div className="grid grid-cols-4 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">

            <span>
              Metric
            </span>

            <span>
              Earlier
            </span>

            <span>
              Later
            </span>

            <span>
              Change
            </span>

          </div>


          {metrics.map(
            (
              metric
            ) => {
              const change =
                metric.later! -
                metric.earlier!;

              const rounded =
                Math.round(
                  change *
                  10
                ) /
                10;

              return (
                <div
                  key={
                    metric.label
                  }
                  className="grid grid-cols-4 gap-2 border-t border-slate-200 px-4 py-3 text-sm"
                >

                  <span className="font-semibold text-slate-900">
                    {
                      metric.label
                    }
                  </span>

                  <span>
                    {
                      metric.earlier
                    }{" "}
                    {
                      metric.unit
                    }
                  </span>

                  <span>
                    {
                      metric.later
                    }{" "}
                    {
                      metric.unit
                    }
                  </span>

                  <span className="font-semibold">
                    {rounded >
                    0
                      ? "+"
                      : ""}
                    {rounded}{" "}
                    {
                      metric.unit
                    }
                  </span>

                </div>
              );
            }
          )}

        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          These scans do not contain any of the same metrics.
        </p>
      )}

    </div>
  );
}
