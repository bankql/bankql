import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>BankQL</h1>
      <p>Welcome to BankQL.</p>
    </main>
  );
}
