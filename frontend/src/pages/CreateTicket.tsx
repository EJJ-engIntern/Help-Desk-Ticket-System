import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

// Category type
type Category = "Technical" | "Engineering" | "General" | "HR" | "Others";

// Form type
type FormState = {
  title: string;
  description: string;
  category: Category | "";
};

const CATEGORIES: Category[] = ["Technical", "Engineering", "General", "HR", "Others"];

export default function CreateTicket(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // ✅ Typed handler
  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<{ id: string }>("/api/tickets", {
        title: form.title,
        description: form.description,
        category: form.category.toLowerCase() || null,
      });

      navigate(`/tickets/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Create New Ticket
      </Typography>

      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Title"
              value={form.title}
              onChange={handleChange("title")}
              required
              fullWidth
              placeholder="Brief summary of your issue"
            />

            <TextField
              label="Category"
              select
              value={form.category}
              onChange={handleChange("category")}
              fullWidth
            >
              <MenuItem value="">— Select category —</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange("description")}
              multiline
              rows={5}
              fullWidth
              placeholder="Describe your issue in detail..."
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/")} disabled={loading}>
                Cancel
              </Button>

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}