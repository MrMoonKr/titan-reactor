import React from "react";

const PlayerProduction = ({ color, units, textSize }) => {
  const w = ["xs"].includes(textSize) ? "w-6" : "w-8";
  const h = ["xs"].includes(textSize) ? "h-6" : "h-8";
  return (
    <ul className={`${h} mb-4`}>
      {units.map(({ image, name, progress }) => (
        <li key={image} className={`inline-block ${w} ${h} cursor-pointer`}>
          <img src={image} data-tip={name} />
          <span
            style={{ width: `${progress}%`, backgroundColor: color }}
            className="mt-1 h-1 inline-block"
          >
            &nbsp;
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ({ players, textSize }) => {
  return (
    <div className="flex absolute top-0 left-0 select-none">
      <div className="production-parent">
        <div
          className="rounded ml-1 mt-1 flex flex-col"
          style={{ backgroundColor: "#1a202c99" }}
        >
          {players
            .filter(({ units }) => units.length)
            .map(({ color, units }) => (
              <PlayerProduction
                key={color}
                color={color}
                units={units}
                textSize={textSize}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
