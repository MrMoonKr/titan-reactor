export interface PluginButtonProps {
  icon: React.ReactElement | null;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  isOnline?: boolean;
  hasUpdateAvailable: boolean;
}

export const PluginButton = ({
  icon,
  description,
  isSelected,
  onClick,
  isDisabled = false,
  isOnline = false,
  hasUpdateAvailable,
}: PluginButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        color: isDisabled
          ? "var(--gray-5)"
          : isSelected
          ? "var(--gray-9)"
          : "var(--gray-7)",
      }}
    >
      {icon}
      {description}{" "}
      {hasUpdateAvailable && !isDisabled && !isOnline && (
        <span
          style={{
            fontSize: "30%",
            position: "absolute",
            top: "-5px",
          }}
        >
          🔴
        </span>
      )}
    </button>
  );
};
