import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar(): JSX.Element | null {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  // If user is not logged in, render nothing
  if (!user) return null;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, cursor: "pointer", flexGrow: 0, mr: 3 }}
          onClick={() => navigate("/")}
        >
          HelpDesk
        </Typography>

        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          <Button onClick={() => navigate("/")}>My Tickets</Button>
          <Button onClick={() => navigate("/create")}>New Ticket</Button>

          {user.role === "admin" && (
            <Button onClick={() => navigate("/admin")} color="warning">
              Admin Panel
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {/* {user.name} {user.role === "admin" && "(Admin)"} */}
             {user.id} {user.role === "admin" && "(Admin)"}
          </Typography>

          <Button onClick={handleLogout} size="small" variant="outlined">
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}