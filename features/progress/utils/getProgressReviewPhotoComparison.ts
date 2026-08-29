import type {
  ProgressCheckIn,
  ProgressPhotoView,
} from "../bodyCompositionTypes.ts";

import {
  isDateInProgressReviewPeriod,
} from "./getProgressReviewPeriod.ts";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod.ts";


// ============================================================
// Types
// ============================================================

export interface ProgressReviewPhotoComparison {
  earlierCheckInId: string;

  earlierDate: string;

  laterCheckInId: string;

  laterDate: string;

  sharedViews:
    ProgressPhotoView[];
}


// ============================================================
// Helpers
// ============================================================

function getPhotoViews(
  checkIn:
    ProgressCheckIn
) {
  return new Set(
    (
      checkIn.photos ??
      []
    ).map(
      (
        photo
      ) =>
        photo.view
    )
  );
}


function getSharedViews(
  earlier:
    ProgressCheckIn,
  later:
    ProgressCheckIn
): ProgressPhotoView[] {
  const earlierViews =
    getPhotoViews(
      earlier
    );

  const laterViews =
    getPhotoViews(
      later
    );

  const orderedViews:
    ProgressPhotoView[] = [
      "Front",
      "Side",
      "Back",
    ];

  return orderedViews.filter(
    (
      view
    ) =>
      earlierViews.has(
        view
      ) &&
      laterViews.has(
        view
      )
  );
}


// ============================================================
// Period Photo Comparison
// ============================================================

export function getProgressReviewPhotoComparison({
  checkIns,
  period,
}: {
  checkIns:
    ProgressCheckIn[];

  period:
    ProgressReviewPeriod;
}): ProgressReviewPhotoComparison | null {
  const eligibleCheckIns =
    checkIns
      .filter(
        (
          checkIn
        ) =>
          isDateInProgressReviewPeriod(
            checkIn.date,
            period
          ) &&
          (
            checkIn.photos?.length ??
            0
          ) >
            0
      )
      .sort(
        (
          a,
          b
        ) =>
          a.date.localeCompare(
            b.date
          )
      );

  for (
    let earlierIndex =
      0;
    earlierIndex <
      eligibleCheckIns.length -
        1;
    earlierIndex +=
      1
  ) {
    const earlier =
      eligibleCheckIns[
        earlierIndex
      ];

    for (
      let laterIndex =
        eligibleCheckIns.length -
        1;
      laterIndex >
        earlierIndex;
      laterIndex -=
        1
    ) {
      const later =
        eligibleCheckIns[
          laterIndex
        ];

      const sharedViews =
        getSharedViews(
          earlier,
          later
        );

      if (
        sharedViews.length ===
        0
      ) {
        continue;
      }

      return {
        earlierCheckInId:
          earlier.id,

        earlierDate:
          earlier.date,

        laterCheckInId:
          later.id,

        laterDate:
          later.date,

        sharedViews,
      };
    }
  }

  return null;
}
