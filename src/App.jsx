import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import VehicleEntryForm from './components/VehicleEntryForm/VehicleEntryForm';
import VehicleList from './components/VehicleList';
import Settings from './components/Settings';
import Checkout from './components/Checkout';
import Login from './components/Login';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Loading...
    </Box>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Navigation />}
      <Box component="main" sx={{ flexGrow: 1, mt: user ? 8 : 0, p: 3 }}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/new-entry" element={
            <PrivateRoute>
              <VehicleEntryForm />
            </PrivateRoute>
          } />
          <Route path="/vehicles" element={
            <PrivateRoute>
              <VehicleList />
            </PrivateRoute>
          } />
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
