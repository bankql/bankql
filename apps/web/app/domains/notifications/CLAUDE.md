# Notifications Domain

Owns toast/notification UI and logic.

## Usage

```tsx
import { toaster } from "~/domains/notifications/ui/toaster";

toaster.create({
  title: "Success",
  description: "Your changes have been saved.",
  type: "success",
});
```

The `<Toaster />` component is rendered once in `__root.tsx`. To show a toast from anywhere, import `toaster` and call `toaster.create()`.

## Available toast types

`success`, `error`, `info`, `warning`, `loading`
