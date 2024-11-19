import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Button, Box, IconButton, Drawer, List,
  ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  List as ListIcon,
  ShoppingCart as CheckoutIcon,
  Settings as SettingsIcon,
  LogoutRounded as LogoutIcon
} from '@mui/icons-material';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/new-entry', label: 'Entry', icon: <AddCircleIcon /> },
    { path: '/vehicles', label: 'Vehicles', icon: <ListIcon /> },
    { path: '/checkout', label: 'Checkout', icon: <CheckoutIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const MobileMenu = () => (
    <Drawer
      anchor="left"
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
    >
      <List sx={{ width: 250 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={() => setMenuOpen(false)}
            sx={{
              bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent'
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <Divider />
        <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <MobileMenu />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
