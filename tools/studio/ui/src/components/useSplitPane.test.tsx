import { fireEvent, render, screen } from "@testing-library/react";
import { useSplitPane } from "./useSplitPane";

function Probe() {
  const { width, handleProps } = useSplitPane("test", { min: 100, max: 500, fallback: 300 });
  return (
    <div>
      <output data-testid="w">{width}</output>
      <div data-testid="handle" {...handleProps} />
    </div>
  );
}

const width = () => Number(screen.getByTestId("w").textContent);

// jsdom has no PointerEvent: build the pointer events on MouseEvent (clientX travels) and
// graft the pointerId — React only cares about the native event type.
const pointer = (type: string, init: { clientX: number; pointerId: number }) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: init.clientX });
  Object.assign(e, { pointerId: init.pointerId });
  return e;
};

beforeEach(() => window.localStorage.removeItem("studio.split.test"));

describe("useSplitPane — the editor/chat divider", () => {
  it("dragging the handle LEFT widens the right pane; release persists the width", () => {
    render(<Probe />);
    const handle = screen.getByTestId("handle");
    fireEvent(handle, pointer("pointerdown", { clientX: 400, pointerId: 1 }));
    fireEvent(handle, pointer("pointermove", { clientX: 360, pointerId: 1 }));
    expect(width()).toBe(340);
    fireEvent(handle, pointer("pointerup", { clientX: 360, pointerId: 1 }));
    expect(window.localStorage.getItem("studio.split.test")).toBe("340");
  });

  it("clamps to [min, max] whatever the drag asks", () => {
    render(<Probe />);
    const handle = screen.getByTestId("handle");
    fireEvent(handle, pointer("pointerdown", { clientX: 0, pointerId: 1 }));
    fireEvent(handle, pointer("pointermove", { clientX: -900, pointerId: 1 }));
    expect(width()).toBe(500);
    fireEvent(handle, pointer("pointermove", { clientX: 900, pointerId: 1 }));
    expect(width()).toBe(100);
  });

  it("arrow keys move in fixed steps and announce through aria-valuenow", () => {
    render(<Probe />);
    const handle = screen.getByTestId("handle");
    expect(handle).toHaveAttribute("role", "separator");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(width()).toBe(316);
    expect(handle).toHaveAttribute("aria-valuenow", "316");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(width()).toBe(300);
  });

  it("double-click returns to the fallback and forgets the preference", () => {
    window.localStorage.setItem("studio.split.test", "480");
    render(<Probe />);
    expect(width()).toBe(480);
    fireEvent.doubleClick(screen.getByTestId("handle"));
    expect(width()).toBe(300);
    expect(window.localStorage.getItem("studio.split.test")).toBeNull();
  });

  it("a stored width is restored on mount, clamped to the bounds", () => {
    window.localStorage.setItem("studio.split.test", "9999");
    render(<Probe />);
    expect(width()).toBe(500);
  });
});
