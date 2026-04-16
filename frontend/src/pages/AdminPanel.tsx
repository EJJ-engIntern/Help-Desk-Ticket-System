import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

// ✅ Status type
type Status = "open" | "in_progress" | "closed";

// ✅ Ticket type
type Ticket = {
  id: string;
  title: string;
  status: Status;
  category?: string;
  users?: {
    name: string;
  };
};

// ✅ Constant typed
const STATUSES: Status[] = ["open", "in_progress", "closed"];

export default function AdminPanel(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }

    api
      .get<Ticket[]>("/api/tickets")
      .then((res) => setTickets(res.data))
      .catch((err: any) =>
        setError(err.response?.data?.error || "Failed to load tickets")
      )
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleStatusChange = async (
    ticketId: string,
    newStatus: Status
  ): Promise<void> => {
    setUpdating(ticketId);
    setSuccessMsg("");

    try {
      const res = await api.patch<{ status: Status }>(
        `/api/tickets/${ticketId}`,
        { status: newStatus }
      );

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: res.data.status } : t
        )
      );

      setSuccessMsg(`Ticket #${ticketId} updated to "${newStatus}"`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update ticket");
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  // ✅ Stats summary
  const counts: Record<Status, number> = {
    open: 0,
    in_progress: 0,
    closed: 0,
  };

  tickets.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Admin Panel
      </Typography>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {[
          { label: "Open", value: counts.open, color: "info" as const },
          { label: "In Progress", value: counts.in_progress, color: "warning" as const },
          { label: "Closed", value: counts.closed, color: "default" as const },
          { label: "Total", value: tickets.length, color: "primary" as const },
        ].map((stat) => (
          <Paper key={stat.label} sx={{ px: 3, py: 2, flex: 1, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={700}>
              {stat.value}
            </Typography>
            <Chip label={stat.label} color={stat.color} size="small" sx={{ mt: 0.5 }} />
          </Paper>
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Submitted by</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Update Status</strong></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} hover>
                <TableCell>{ticket.id}</TableCell>

                <TableCell sx={{ maxWidth: 220 }}>
                  <Typography variant="body2" noWrap>
                    {ticket.title}
                  </Typography>
                </TableCell>

                <TableCell>{ticket.users?.name || "—"}</TableCell>

                <TableCell sx={{ textTransform: "capitalize" }}>
                  {ticket.category || "—"}
                </TableCell>

                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>

                <TableCell>
                  <Select
                    size="small"
                    value={ticket.status}
                    disabled={updating === ticket.id}
                    onChange={(e: SelectChangeEvent) =>
                      handleStatusChange(ticket.id, e.target.value as Status)
                    }
                    sx={{ minWidth: 130 }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                        {s.replace("_", " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                <TableCell>
                  <Button size="small" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}