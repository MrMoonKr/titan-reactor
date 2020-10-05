import React, { useState } from "react";
import Minimap from "./Minimap";
import Production from "./Production";
import Resources from "./Resources";
import ReactTooltip from "react-tooltip";
import Details from "./Details";
import ReplayPosition from "./ReplayPosition";
import { gameSpeeds } from "../../utils/conversions";

const config = {
  textSize: "sm",
  showTooltips: true,
};

const players = [
  {
    name: "Flash",
    minerals: 100,
    gas: 50,
    workers: 7,
    supply: 12,
    race: "terran",
    apm: 356,
    color: "#f56565",
    units: [
      {
        image: "https://i.imgur.com/CBDWAUr.png",
        progress: 50,
        name: "Zerg Drone",
      },
    ],
  },
  {
    name: "Jaedong",
    minerals: 150,
    gas: 20,
    workers: 8,
    supply: 11,
    race: "zerg",
    apm: 477,
    color: "#4299e1",
    units: [
      {
        image: "https://i.imgur.com/CBDWAUr.png",
        progress: 50,
        name: "Zerg Drone",
      },
    ],
  },
];

const demo = {
  position: 90,
  selectedUnits: [],
};

export default ({ position, timeLabel }) => {
  const [showResources, setShowResources] = useState(true);
  const [showProduction, setShowProduction] = useState(true);

  const onTogglePlayerVision = (e) => {
    console.log("onTogglePlayerVision", e);
  };
  const onTogglePlayerFPV = (e) => {
    console.log("onTogglePlayerFPV", e);
  };
  const onToggleDualFPV = (e) => {
    console.log("onToggleDualFPV", e);
  };

  const onTogglePlay = (e) => {
    console.log("onTogglePlay", e);
  };
  const onChangePosition = (e) => {
    console.log("onChangePosition", e);
  };
  const onChangeAutoGameSpeed = (e) => {
    console.log("onChangeAutoGameSpeed", e);
  };
  const onChangeGameSpeed = (e) => {
    console.log("onChangeGameSpeed", e);
  };

  const onRevealMap = (e) => {
    console.log("onRevealMap", e);
  };
  const onShowHeatMap = (e) => {
    console.log("onShowHeatMap", e);
  };

  const onDropPings = (e) => {
    console.log("onDropPings", e);
  };

  const onUnitDetails = (e) => {
    console.log("onUnitDetails", e);
  };
  const onShowAttackDetails = (e) => {
    console.log("onShowAttackDetails", e);
  };
  const onFollowUnit = (e) => {
    console.log("onFollowUnit", e);
  };
  const onUnitFPV = (e) => {
    console.log("onUnitFPV", e);
  };

  return (
    <>
      {config.showTooltips && <ReactTooltip textColor="#cbd5e0" />}
      {showProduction && (
        <Production players={players} textSize={config.textSize} />
      )}
      {showResources && (
        <Resources
          onTogglePlayerVision={onTogglePlayerVision}
          onTogglePlayerFPV={onTogglePlayerFPV}
          onToggleDualFPV={onToggleDualFPV}
          players={players}
          textSize={config.textSize}
        />
      )}
      <div className="w-full flex absolute bottom-0 items-stretch divide-x-4 divide-transparent px-2">
        <Minimap
          onRevealMap={onRevealMap}
          onShowHeatMap={onShowHeatMap}
          onDropPings={onDropPings}
          timeLabel={timeLabel}
          textSize={config.textSize}
        />
        <Details
          units={demo.selectedUnits}
          onUnitDetails={onUnitDetails}
          onShowAttackDetails={onShowAttackDetails}
          onFollowUnit={onFollowUnit}
          onUnitFPV={onUnitFPV}
          textSize={config.textSize}
        />
        <ReplayPosition
          timeLabel={timeLabel}
          position={position}
          defaultGameSpeed={gameSpeeds.fastest}
          onTogglePlay={onTogglePlay}
          onChangePosition={onChangePosition}
          onChangeAutoGameSpeed={onChangeAutoGameSpeed}
          onChangeGameSpeed={onChangeGameSpeed}
          onToggleProduction={setShowProduction}
          onToggleResources={setShowResources}
          textSize={config.textSize}
        />
      </div>
    </>
  );
};
