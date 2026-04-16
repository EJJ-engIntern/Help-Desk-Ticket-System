import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

// ✅ Types
type Status = "open" | "in_progress" | "closed";

type User = {
  name: string;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
  users?: User;
};

type Ticket = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: Status;
  created_at: string;
  users?: User;
  comments?: Comment[];
};

export default function TicketDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    api
      .get<Ticket>(`/api/tickets/${id}`)
      .then((res) => setTicket(res.data))
      .catch((err: any) =>
        setError(err.response?.data?.error || "Ticket not found")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddComment = async (): Promise<void> => {
    if (!comment.trim() || !id) return;

    setSubmitting(true);

    try {
      const res = await api.post<Comment>("/api/comments", {
        ticket_id: id,
        body: comment,
      });

      setTicket((prev) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), res.data] }
          : prev
      );

      setComment("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!ticket) return <></>;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, px: 2 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      {/* Ticket Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {ticket.title}
            </Typography>
            <StatusBadge status={ticket.status} />
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {ticket.category && (
              <Chip
                label={ticket.category}
                size="small"
                variant="outlined"
                sx={{ textTransform: "capitalize" }}
              />
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ alignSelf: "center" }}
            >
              #{ticket.id} · Opened by {ticket.users?.name} ·{" "}
              {new Date(ticket.created_at).toLocaleDateString()}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {ticket.description || "No description provided."}
          </Typography>
        </CardContent>
      </Card>

      {/* Comments */}
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Comments ({ticket.comments?.length || 0})
      </Typography>

      {ticket.comments?.length === 0 && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          No comments yet. Be the first to reply.
        </Typography>
      )}

      {ticket.comments?.map((c) => (
        <Card key={c.id} variant="outlined" sx={{ mb: 1.5 }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {c.users?.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {new Date(c.created_at).toLocaleString()}
              </Typography>
            </Box>

            <Typography variant="body2">{c.body}</Typography>
          </CardContent>
        </Card>
      ))}

      {/* Add Comment */}
      {ticket.status !== "closed" && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Add a comment
            </Typography>

            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="Write your reply..."
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setComment(e.target.value)
              }
              sx={{ mb: 1.5 }}
            />

            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={submitting || !comment.trim()}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {ticket.status === "closed" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          This ticket is closed. No new comments can be added.
        </Alert>
      )}
    </Box>
  );
}