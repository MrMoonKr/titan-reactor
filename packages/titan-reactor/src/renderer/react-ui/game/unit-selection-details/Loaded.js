import { range } from "ramda";
import React, { forwardRef } from "react";
import SmallUnitItem from "./SmallUnitItem";

export default forwardRef(({ unit }, ref) => {
  return (
    <div className="flex pl-1 pt-1" ref={ref}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 2.5rem)",
          gridTemplateRows: "repeat(2, 2.5rem)",
          gridGap: ".25rem",
        }}
      >
        {range(0, 8).map((i) => (
          <SmallUnitItem key={i} index={i} unit={unit} showLoaded={true} />
        ))}
      </div>
    </div>
  );
});
