import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and handles clicks", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Send Inquiry</Button>);

    const button = screen.getByRole("button", { name: "Send Inquiry" });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects the disabled prop", () => {
    render(<Button disabled>Submit</Button>);

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
