"use client";

// ============================================================
// Imports
// ============================================================

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useBodyMeasurements,
} from "../hooks/useBodyMeasurements";

import type {
  BodyMeasurement,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

interface MeasurementFormState {
  date: string;

  weightLb: string;

  bodyFatPercent: string;

  waistIn: string;

  leanMassLb: string;

  fatMassLb: string;

  neckIn: string;

  chestIn: string;

  shouldersIn: string;

  abdomenIn: string;

  hipsIn: string;

  leftUpperArmIn: string;

  rightUpperArmIn: string;

  leftThighIn: string;

  rightThighIn: string;

  leftCalfIn: string;

  rightCalfIn: string;

  notes: string;
}


// ============================================================
// Helpers
// ============================================================

function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
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
  date: string
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


function createEmptyForm():
MeasurementFormState {
  return {
    date:
      formatLocalDate(
        new Date()
      ),

    weightLb:
      "",

    bodyFatPercent:
      "",

    waistIn:
      "",

    leanMassLb:
      "",

    fatMassLb:
      "",

    neckIn:
      "",

    chestIn:
      "",

    shouldersIn:
      "",

    abdomenIn:
      "",

    hipsIn:
      "",

    leftUpperArmIn:
      "",

    rightUpperArmIn:
      "",

    leftThighIn:
      "",

    rightThighIn:
      "",

    leftCalfIn:
      "",

    rightCalfIn:
      "",

    notes:
      "",
  };
}


function createFormFromMeasurement(
  measurement:
    BodyMeasurement
):
MeasurementFormState {
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
    date:
      measurement.date,

    weightLb:
      value(
        measurement.weightLb
      ),

    bodyFatPercent:
      value(
        measurement.bodyFatPercent
      ),

    waistIn:
      value(
        measurement.waistIn
      ),

    leanMassLb:
      value(
        measurement.leanMassLb
      ),

    fatMassLb:
      value(
        measurement.fatMassLb
      ),

    neckIn:
      value(
        measurement.neckIn
      ),

    chestIn:
      value(
        measurement.chestIn
      ),

    shouldersIn:
      value(
        measurement.shouldersIn
      ),

    abdomenIn:
      value(
        measurement.abdomenIn
      ),

    hipsIn:
      value(
        measurement.hipsIn
      ),

    leftUpperArmIn:
      value(
        measurement.leftUpperArmIn
      ),

    rightUpperArmIn:
      value(
        measurement.rightUpperArmIn
      ),

    leftThighIn:
      value(
        measurement.leftThighIn
      ),

    rightThighIn:
      value(
        measurement.rightThighIn
      ),

    leftCalfIn:
      value(
        measurement.leftCalfIn
      ),

    rightCalfIn:
      value(
        measurement.rightCalfIn
      ),

    notes:
      measurement.notes ??
      "",
  };
}


function parseOptionalNumber(
  value: string
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


function hasAdditionalMeasurements(
  measurement:
    BodyMeasurement
) {
  return (
    measurement.neckIn !==
      undefined ||
    measurement.chestIn !==
      undefined ||
    measurement.shouldersIn !==
      undefined ||
    measurement.abdomenIn !==
      undefined ||
    measurement.hipsIn !==
      undefined ||
    measurement.leftUpperArmIn !==
      undefined ||
    measurement.rightUpperArmIn !==
      undefined ||
    measurement.leftThighIn !==
      undefined ||
    measurement.rightThighIn !==
      undefined ||
    measurement.leftCalfIn !==
      undefined ||
    measurement.rightCalfIn !==
      undefined ||
    measurement.leanMassLb !==
      undefined ||
    measurement.fatMassLb !==
      undefined
  );
}


// ============================================================
// Component
// ============================================================

export default function BodyMeasurements() {
  const {
    loaded,

    measurements,

    latestMeasurement,

    addMeasurement,

    updateMeasurement,

    deleteMeasurement,
  } =
    useBodyMeasurements();

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
    additionalOpen,
    setAdditionalOpen,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<
      MeasurementFormState
    >(
      createEmptyForm
    );

  const [
    validationMessage,
    setValidationMessage,
  ] =
    useState<
      string |
      null
    >(
      null
    );


  // ----------------------------------------------------------
  // Form Helpers
  // ----------------------------------------------------------

  function updateField(
    field:
      keyof MeasurementFormState,
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

    setAdditionalOpen(
      false
    );

    setValidationMessage(
      null
    );

    setFormOpen(
      true
    );
  }


  function beginEdit(
    measurement:
      BodyMeasurement
  ) {
    setEditingId(
      measurement.id
    );

    setForm(
      createFormFromMeasurement(
        measurement
      )
    );

    setAdditionalOpen(
      hasAdditionalMeasurements(
        measurement
      )
    );

    setValidationMessage(
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

    setValidationMessage(
      null
    );
  }


  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  function saveMeasurement() {
    const values = {
      weightLb:
        parseOptionalNumber(
          form.weightLb
        ),

      bodyFatPercent:
        parseOptionalNumber(
          form.bodyFatPercent
        ),

      waistIn:
        parseOptionalNumber(
          form.waistIn
        ),

      leanMassLb:
        parseOptionalNumber(
          form.leanMassLb
        ),

      fatMassLb:
        parseOptionalNumber(
          form.fatMassLb
        ),

      neckIn:
        parseOptionalNumber(
          form.neckIn
        ),

      chestIn:
        parseOptionalNumber(
          form.chestIn
        ),

        shouldersIn:
        parseOptionalNumber(
          form.shouldersIn
        ),

      abdomenIn:
        parseOptionalNumber(
          form.abdomenIn
        ),

      hipsIn:
        parseOptionalNumber(
          form.hipsIn
        ),

      leftUpperArmIn:
        parseOptionalNumber(
          form.leftUpperArmIn
        ),

      rightUpperArmIn:
        parseOptionalNumber(
          form.rightUpperArmIn
        ),

      leftThighIn:
        parseOptionalNumber(
          form.leftThighIn
        ),

      rightThighIn:
        parseOptionalNumber(
          form.rightThighIn
        ),

      leftCalfIn:
        parseOptionalNumber(
          form.leftCalfIn
        ),

      rightCalfIn:
        parseOptionalNumber(
          form.rightCalfIn
        ),
    };


    const numericValues =
      Object.values(
        values
      ).filter(
        (
          value
        ): value is number =>
          value !==
          undefined
      );


    if (
      numericValues.length ===
      0
    ) {
      setValidationMessage(
        "Enter at least one measurement."
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
      setValidationMessage(
        "Measurements must be greater than zero."
      );

      return;
    }


    if (
      values.bodyFatPercent !==
        undefined &&
      values.bodyFatPercent >=
        100
    ) {
      setValidationMessage(
        "Body fat must be between 0 and 100%."
      );

      return;
    }


    const input = {
      date:
        form.date,

      source:
        "Manual" as const,

      ...values,

      notes:
        form.notes.trim() !==
        ""
          ? form.notes.trim()
          : undefined,
    };


    if (
      editingId
    ) {
      updateMeasurement(
        editingId,
        input
      );
    } else {
      addMeasurement(
        input
      );
    }


    setFormOpen(
      false
    );

    setEditingId(
      null
    );

    setValidationMessage(
      null
    );
  }


  // ==========================================================
  // Loading
  // ==========================================================

  if (
    !loaded
  ) {
    return (
      <div className="py-8 text-center text-slate-500">
        Loading body measurements...
      </div>
    );
  }


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="space-y-4">

      {/* ======================================================
          Current / Add
      ======================================================= */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Latest Measurement
            </p>

            {latestMeasurement ? (
              <>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {
                    formatDisplayDate(
                      latestMeasurement.date
                    )
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Record weight frequently and circumference
                  measurements whenever you take them.
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  No measurements yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add your first measurement to begin tracking
                  body-composition trends.
                </p>
              </>
            )}

          </div>


          {!formOpen && (
            <button
              type="button"
              onClick={
                beginAdd
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus
                size={16}
              />

              Add Measurement
            </button>
          )}

        </div>


        {latestMeasurement && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <Metric
              label="Weight"
              value={
                latestMeasurement.weightLb
              }
              unit="lb"
            />

            <Metric
              label="Waist"
              value={
                latestMeasurement.waistIn
              }
              unit="in"
            />

            <Metric
              label="Body Fat"
              value={
                latestMeasurement.bodyFatPercent
              }
              unit="%"
            />

          </div>
        )}

      </div>


      {/* ======================================================
          Form
      ======================================================= */}

      {formOpen && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              {
                editingId
                  ? "Edit Measurement"
                  : "New Measurement"
              }
            </p>

            <h3 className="mt-1 text-lg font-bold">
              Body Measurements
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enter only the measurements you took today.
              Nothing except the date is required individually.
            </p>

          </div>


          <div className="mt-5 space-y-5">

            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Date
              </span>

              <input
                type="date"
                value={
                  form.date
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "date",
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              />

            </label>


            {/* ----------------------------------------------
                Primary Measurements
            ----------------------------------------------- */}

            <div>

              <p className="text-sm font-semibold text-slate-800">
                Primary Measurements
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-3">

                <NumberField
                  label="Weight"
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
                  label="Waist"
                  unit="in"
                  value={
                    form.waistIn
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "waistIn",
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

              </div>

            </div>


            {/* ----------------------------------------------
                Additional Measurements
            ----------------------------------------------- */}

            <div className="rounded-xl border border-slate-200">

              <button
                type="button"
                onClick={() =>
                  setAdditionalOpen(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Additional Measurements
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Neck, shoulders, chest, abdomen, hips, arms,
                    thighs, calves, lean mass, and fat mass.
                  </p>

                </div>

                {additionalOpen ? (
                  <ChevronUp
                    size={18}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                  />
                )}

              </button>


              {additionalOpen && (
                <div className="border-t border-slate-200 p-4">

                  <div className="grid gap-4 sm:grid-cols-2">

                    <NumberField
                      label="Neck"
                      unit="in"
                      value={
                        form.neckIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "neckIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Chest"
                      unit="in"
                      value={
                        form.chestIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "chestIn",
                          value
                        )
                      }
                    />

                                        <NumberField
                      label="Shoulders"
                      unit="in"
                      value={
                        form.shouldersIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "shouldersIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Abdomen"
                      unit="in"
                      value={
                        form.abdomenIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "abdomenIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Hips"
                      unit="in"
                      value={
                        form.hipsIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "hipsIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Left Upper Arm"
                      unit="in"
                      value={
                        form.leftUpperArmIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "leftUpperArmIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Right Upper Arm"
                      unit="in"
                      value={
                        form.rightUpperArmIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "rightUpperArmIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Left Thigh"
                      unit="in"
                      value={
                        form.leftThighIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "leftThighIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Right Thigh"
                      unit="in"
                      value={
                        form.rightThighIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "rightThighIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Left Calf"
                      unit="in"
                      value={
                        form.leftCalfIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "leftCalfIn",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Right Calf"
                      unit="in"
                      value={
                        form.rightCalfIn
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "rightCalfIn",
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

                  </div>

                </div>
              )}

            </div>


            {/* ----------------------------------------------
                Notes
            ----------------------------------------------- */}

            <label className="block">

              <span className="text-sm font-semibold text-slate-800">
                Notes
              </span>

              <textarea
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
                placeholder="Optional measurement context"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
              />

            </label>


            {validationMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">

                <p className="text-sm font-medium text-red-700">
                  {
                    validationMessage
                  }
                </p>

              </div>
            )}


            <div className="flex flex-wrap justify-end gap-3">

              <button
                type="button"
                onClick={
                  cancelForm
                }
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveMeasurement
                }
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {
                  editingId
                    ? "Save Changes"
                    : "Save Measurement"
                }
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          History
      ======================================================= */}

      {measurements.length >
        0 && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Measurement History
          </p>

          <div className="mt-4 space-y-3">

            {measurements.map(
              (
                measurement
              ) => (
                <MeasurementHistoryItem
                  key={
                    measurement.id
                  }
                  measurement={
                    measurement
                  }
                  onEdit={() =>
                    beginEdit(
                      measurement
                    )
                  }
                  onDelete={() => {
                    const confirmed =
                      window.confirm(
                        `Delete the body measurement from ${formatDisplayDate(
                          measurement.date
                        )}? This cannot be undone.`
                      );

                    if (
                      confirmed
                    ) {
                      deleteMeasurement(
                        measurement.id
                      );

                      if (
                        editingId ===
                        measurement.id
                      ) {
                        cancelForm();
                      }
                    }
                  }}
                />
              )
            )}

          </div>

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
      value: string
    ) => void;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-slate-800">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-2">

        <input
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
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
        />

        <span className="min-w-6 text-sm text-slate-500">
          {unit}
        </span>

      </div>

    </label>
  );
}


// ============================================================
// Metric
// ============================================================

function Metric({
  label,
  value,
  unit,
}: {
  label:
    string;

  value:
    number |
    undefined;

  unit:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value !==
        undefined
          ? value
          : "—"}

        {value !==
          undefined && (
          <span className="ml-1 text-sm font-medium text-slate-500">
            {unit}
          </span>
        )}
      </p>

    </div>
  );
}


// ============================================================
// Measurement History Item
// ============================================================

function MeasurementHistoryItem({
  measurement,
  onEdit,
  onDelete,
}: {
  measurement:
    BodyMeasurement;

  onEdit:
    () => void;

  onDelete:
    () => void;
}) {
  const [
    expanded,
    setExpanded,
  ] =
    useState(false);


  const details = [
    [
      "Weight",
      measurement.weightLb,
      "lb",
    ],

    [
      "Waist",
      measurement.waistIn,
      "in",
    ],

    [
      "Body Fat",
      measurement.bodyFatPercent,
      "%",
    ],

    [
      "Neck",
      measurement.neckIn,
      "in",
    ],

    [
      "Chest",
      measurement.chestIn,
      "in",
    ],

    [
      "Shoulders",
      measurement.shouldersIn,
      "in",
    ],

    [
      "Abdomen",
      measurement.abdomenIn,
      "in",
    ],

    [
      "Hips",
      measurement.hipsIn,
      "in",
    ],

    [
      "Left Upper Arm",
      measurement.leftUpperArmIn,
      "in",
    ],

    [
      "Right Upper Arm",
      measurement.rightUpperArmIn,
      "in",
    ],

    [
      "Left Thigh",
      measurement.leftThighIn,
      "in",
    ],

    [
      "Right Thigh",
      measurement.rightThighIn,
      "in",
    ],

    [
      "Left Calf",
      measurement.leftCalfIn,
      "in",
    ],

    [
      "Right Calf",
      measurement.rightCalfIn,
      "in",
    ],

    [
      "Lean Mass",
      measurement.leanMassLb,
      "lb",
    ],

    [
      "Fat Mass",
      measurement.fatMassLb,
      "lb",
    ],
  ] as const;


  const populatedDetails =
    details.filter(
      (
        detail
      ) =>
        detail[1] !==
        undefined
    );


  return (
    <div className="rounded-xl bg-slate-50">

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (
              current
            ) =>
              !current
          )
        }
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >

        <div>

          <p className="font-semibold">
            {
              formatDisplayDate(
                measurement.date
              )
            }
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {measurement.weightLb !==
            undefined
              ? `${measurement.weightLb} lb`
              : `${populatedDetails.length} measurement${
                  populatedDetails.length ===
                  1
                    ? ""
                    : "s"
                }`}
          </p>

        </div>


        {expanded ? (
          <ChevronUp
            size={18}
          />
        ) : (
          <ChevronDown
            size={18}
          />
        )}

      </button>


      {expanded && (
        <div className="border-t border-slate-200 px-4 py-4">

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            {populatedDetails.map(
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
                    {value} {unit}
                  </p>

                </div>
              )
            )}

          </div>


          {measurement.notes && (
            <div className="mt-4 border-t border-slate-200 pt-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-700">
                {
                  measurement.notes
                }
              </p>

            </div>
          )}


          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">

            <button
              type="button"
              onClick={
                onEdit
              }
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil
                size={15}
              />

              Edit
            </button>

            <button
              type="button"
              onClick={
                onDelete
              }
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2
                size={15}
              />

              Delete
            </button>

          </div>

        </div>
      )}

    </div>
  );
}