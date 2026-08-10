"use client";

interface RatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RatingSelector({
  value,
  onChange,
}: RatingSelectorProps) {
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map((rating) => {
        const selected = rating === value;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`
              h-10 w-10 rounded-full border transition-all
              ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 hover:border-blue-600 hover:bg-blue-50"
              }
            `}
          >
            {rating}
          </button>
        );
      })}
    </div>
  );
}