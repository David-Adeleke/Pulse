import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <>
      <div>
        <h1>Hello!!!</h1>
        <p>World</p>
      </div>
      <p>Its me!</p>
    </>
  );
}
