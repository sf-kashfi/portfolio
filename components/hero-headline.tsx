import { TechText } from "@/components/tech-text";

export function HeroHeadline() {
  return (
    <div className="tech-text relative">
      <h1>
        <span data-tech-line>I turn complex</span>{" "}
        <span data-tech-line>systems into</span>{" "}
        <span data-tech-line className="tech-text-accent">clear products.</span>
      </h1>
      <TechText />
    </div>
  );
}
