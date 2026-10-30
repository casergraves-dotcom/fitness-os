export async function playRestCompletionSound() {
  if (typeof window === "undefined") {
    return false;
  }

  const AudioContextConstructor = window.AudioContext ?? (
    window as Window & {
      webkitAudioContext?: typeof AudioContext;
    }
  ).webkitAudioContext;

  if (!AudioContextConstructor) {
    return false;
  }

  try {
    const context = new AudioContextConstructor();
    await context.resume();

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.18,
      context.currentTime + 0.02
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.42
    );
    gain.connect(context.destination);

    const firstTone = context.createOscillator();
    firstTone.type = "sine";
    firstTone.frequency.value = 660;
    firstTone.connect(gain);
    firstTone.start(context.currentTime);
    firstTone.stop(context.currentTime + 0.18);

    const secondTone = context.createOscillator();
    secondTone.type = "sine";
    secondTone.frequency.value = 880;
    secondTone.connect(gain);
    secondTone.start(context.currentTime + 0.2);
    secondTone.stop(context.currentTime + 0.42);

    window.setTimeout(() => {
      void context.close();
    }, 600);

    return true;
  } catch {
    return false;
  }
}

export function vibrateForRestCompletion() {
  if (
    typeof navigator === "undefined" ||
    !("vibrate" in navigator)
  ) {
    return false;
  }

  return navigator.vibrate([150, 100, 150]);
}
