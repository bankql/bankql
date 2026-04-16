# Menu Domain

Owns the collapsible sidebar navigation. The sidebar lives in the left column of the app shell and can be toggled between expanded (icon + label) and collapsed (icon-only) states.

## Key Exports

### `ui/Sidebar.tsx`
- `Sidebar` — the sidebar nav component, renders icon buttons that expand to show labels
- Accepts `collapsed` and `onToggle` props from the layout

## Nav Items

Navigation items are defined as data in the sidebar component. As the app grows, routes and nav items should be added here.
