import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

// ✅ Match your AuthContext User type
type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

// ✅ API response type
type LoginResponse = {
  token: string;
  user: User;
};

export default function Login(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Card sx={{ width: 380, p: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            HelpDesk Login
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to manage your support tickets
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={2}
          >
            Default password for seeded users: <strong>password123</strong>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}