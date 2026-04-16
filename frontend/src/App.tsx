import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import MyTickets from "./pages/MyTickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetail from "./pages/TicketDetail";
import AdminPanel from "./pages/AdminPanel";

// ✅ Theme typing is inferred automatically
const theme = createTheme({
  palette: {
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

// ✅ Props type for PrivateRoute
type PrivateRouteProps = {
  children: React.ReactElement;
};

// Protect routes
function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// (Optional but recommended) Admin route protection
function AdminRoute({ children }: PrivateRouteProps): JSX.Element {
  const { user } = useAuth();
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}

function AppRoutes(): JSX.Element {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <Box sx={{ pb: 6 }}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <MyTickets />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateTicket />
              </PrivateRoute>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <TicketDetail />
              </PrivateRoute>
            }
          />

          {/* ✅ Admin protected */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </>
  );
}

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}