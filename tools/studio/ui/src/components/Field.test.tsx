// One frontmatter field as a typed control: the control's shape follows the value's type, and every
// edit flows back through onChange in the field's native type (bool, number, string[], text).
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { COPY } from "../copy.ts";
import { Field } from "./Field.tsx";

describe("Field — the control follows the value's type", () => {
  it("a boolean renders a checkbox and toggles to its negation", async () => {
    const onChange = vi.fn();
    render(<Field name="enabled" value={false} onChange={onChange} />);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("a number renders a number input and emits a Number", async () => {
    const onChange = vi.fn();
    render(<Field name="weight" value={3} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    await userEvent.type(input, "9");
    expect(onChange).toHaveBeenLastCalledWith(39);
  });

  it("a string array renders a comma-joined text input and emits a trimmed array", async () => {
    const onChange = vi.fn();
    render(<Field name="tags" value={["a", "b"]} onChange={onChange} />);
    const input = screen.getByPlaceholderText(COPY.field.listPlaceholder) as HTMLInputElement;
    // Shown comma-joined; the control is controlled by the `value` prop (no local state).
    expect(input.value).toBe("a, b");
    // A change event carries the parsed array: split on commas, each entry trimmed, blanks dropped.
    fireEvent.change(input, { target: { value: "x, y ,  , z" } });
    expect(onChange).toHaveBeenLastCalledWith(["x", "y", "z"]);
  });

  it("a nested object is shown as a read-only JSON preview, not an editable control", () => {
    render(<Field name="meta" value={{ a: 1 }} onChange={() => {}} />);
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("a short string renders a text input; a long one renders a textarea", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Field name="title" value="court" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    expect(input.tagName).toBe("INPUT");
    await userEvent.type(input, "!");
    expect(onChange).toHaveBeenLastCalledWith("court!");

    rerender(<Field name="description" value="peu importe" onChange={onChange} />);
    expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  });

  it("a long string value also becomes a textarea", () => {
    render(<Field name="x" value={"y".repeat(80)} onChange={() => {}} />);
    expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  });

  it("a null/undefined value renders an empty text input", () => {
    render(<Field name="x" value={null} onChange={() => {}} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  });

  it("structural keys are read-only and labelled as such", () => {
    render(<Field name="schema_version" value={1} onChange={() => {}} />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    expect(screen.getByText(/structurel/)).toBeInTheDocument();
  });

  it("a required field shows the required marker", () => {
    render(<Field name="title" value="x" required onChange={() => {}} />);
    expect(screen.getByLabelText(COPY.field.requiredAria)).toBeInTheDocument();
  });
});
