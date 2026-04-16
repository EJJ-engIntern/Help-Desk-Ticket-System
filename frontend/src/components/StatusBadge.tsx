import Chip from "@mui/material/Chip";

// ✅ Define allowed status values
type Status = "open" | "in_progress" | "closed";

// ✅ Define config type
type StatusConfig = {
  label: string;
  color: "default" | "info" | "warning";
};

// ✅ Typed config object
const statusConfig: Record<Status, StatusConfig> = {
  open: { label: "Open", color: "info" },
  in_progress: { label: "In Progress", color: "warning" },
  closed: { label: "Closed", color: "default" },
};

// ✅ Props type
type StatusBadgeProps = {
  status: Status;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps): JSX.Element {
  const config = statusConfig[status] || statusConfig.open;

  return <Chip label={config.label} color={config.color} size="small" />;
}