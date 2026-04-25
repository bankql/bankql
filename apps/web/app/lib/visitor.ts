import FingerprintJS from "@fingerprintjs/fingerprintjs";

let visitorIdPromise: Promise<string> | null = null;

export function getVisitorId(): Promise<string> {
  if (!visitorIdPromise) {
    visitorIdPromise = FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => result.visitorId);
  }
  return visitorIdPromise;
}
