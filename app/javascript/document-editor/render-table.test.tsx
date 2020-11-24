import React from "react";
import { render } from "@testing-library/react";
import { NoteCell } from "./render-table-row";

describe("NoteCell", () => {
  it("hidden cell matches snapshot", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <NoteCell hidden children={<>test</>} />
          </tr>
        </tbody>
      </table>
    );
    expect(container).toMatchSnapshot();
  });
});
