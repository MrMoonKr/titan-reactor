import React from "react";
import { connect } from "react-redux";
import WrappedElement from "../WrappedElement";
import { toggleFogOfWar } from "./replayHudReducer";

const Minimap = ({
  className = "",
  timeLabel,
  textSize,
  onDropPings,
  canvas,
  showFogOfWar,
  toggleFogOfWar,
  hoveringOverMinimap,
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";
  return (
    <div
      className={`minimap-parent flex items-stretch select-none ${className}`}
      onMouseEnter={() => {
        hoveringOverMinimap(true);
      }}
      onMouseLeave={() => {
        hoveringOverMinimap(false);
      }}
    >
      <div className="rounded mb-2 flex flex-1 border-2 border-yellow-900">
        <article className="minimap flex-1 relative bg-black flex items-center">
          <p
            className={`text-gray-400 text-${textSize} bg-black inline-block absolute px-6 pt-1 pb-2 rounded-tl-full rounded-tr-full border-t-2 border-yellow-800`}
            style={{
              top: "-1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {timeLabel}
          </p>
          <WrappedElement domElement={canvas} />
        </article>

        <aside
          className="view-controls flex-0 flex flex-col space-y-2 px-2"
          style={{ backgroundColor: "#1a202c99" }}
        >
          <i
            className={`material-icons rounded cursor-pointer ${
              showFogOfWar
                ? "text-gray-600 hover:text-yellow-600"
                : "text-yellow-600 hover:text-gray-600"
            }  `}
            style={{ fontSize: smallIconFontSize }}
            title={"Reveal Entire Map"}
            data-tip={"Reveal Entire Map"}
            onClick={toggleFogOfWar}
          >
            filter_hdr
          </i>
          <i
            className="material-icons hover:text-yellow-500 rounded cursor-pointer"
            style={{ fontSize: smallIconFontSize }}
            title={`Drop Pings`}
            data-tip={`Drop Pings`}
            onClick={() => onDropPings && onDropPings()}
          >
            notifications_active
          </i>
        </aside>
      </div>
    </div>
  );
};

export default connect(
  (state) => ({
    showFogOfWar: state.replay.hud.showFogOfWar,
  }),
  (dispatch) => ({
    toggleFogOfWar: () => dispatch(toggleFogOfWar()),
  })
)(Minimap);
