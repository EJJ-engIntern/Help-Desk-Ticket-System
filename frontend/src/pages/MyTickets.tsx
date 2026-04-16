import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

// ✅ Status type
type Status = "open" | "in_progress" | "closed";

// ✅ Ticket type
type Ticket = {
  id: string;
  title: string;
  category?: string;
  status: Status;
  created_at: string;
};

export default function MyTickets(): JSX.Element {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<Ticket[]>("/api/tickets")
      .then((res) => setTickets(res.data))
      .catch((err: any) =>
        setError(err.response?.data?.error || "Failed to load tickets")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          My Tickets
        </Typography>

        <Button variant="contained" onClick={() => navigate("/create")}>
          + New Ticket
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {tickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No tickets yet.</Typography>

          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => navigate("/create")}
          >
            Create your first ticket
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell><strong>#</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>{ticket.id}</TableCell>

                  <TableCell>{ticket.title}</TableCell>

                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {ticket.category || "—"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>

                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}