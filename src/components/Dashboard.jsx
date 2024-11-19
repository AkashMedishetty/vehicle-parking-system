
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Switch,
  CircularProgress, useTheme, useMediaQuery,
  TextField, InputAdornment, Fade
} from '@mui/material';
import {
  ArrowBack, Search as SearchIcon,
  LocalParking
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [checkedOutVehicles, setCheckedOutVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckedOut, setShowCheckedOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadVehicles();
      loadCheckedOutVehicles();
    }
  }, [selectedLocation, showCheckedOut]);

  const loadLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/locations');
      const data = await response.json();
      const locationsWithCounts = await Promise.all(data.data.map(async location => {
        const vehiclesResponse = await fetch('http://localhost:5000/api/vehicles');
        const vehicles = await vehiclesResponse.json();
        const currentVehicles = vehicles.filter(v => v.in_place === location.name).length;
        return { ...location, current_vehicles: currentVehicles };
      }));
      setLocations(locationsWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles');
      const data = await response.json();
      setVehicles(data.filter(v => v.in_place === selectedLocation.name));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadCheckedOutVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles/checked-out');
      const data = await response.json();
      const locationCheckouts = data
        .filter(checkout => JSON.parse(checkout.vehicle_details).in_place === selectedLocation.name)
        .map(checkout => ({
          id: checkout.vehicle_id,
          registration_number: checkout.registration_number,
          vehicle_type: checkout.vehicle_type,
          owner_name: checkout.owner_name,
          checkout_date: checkout.checkout_date,
          status: 'checked_out'
        }));
      setCheckedOutVehicles(locationCheckouts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredVehicles = (showCheckedOut ? checkedOutVehicles : vehicles)
    .filter(vehicle => 
      vehicle.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getVehicleTypeCounts = () => {
    const currentVehicles = showCheckedOut ? checkedOutVehicles : vehicles;
    return currentVehicles.reduce((acc, vehicle) => {
      const type = vehicle.vehicle_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  };

  const LocationCard = ({ location }) => (
    <Card
      elevation={3}
      sx={{
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white'
      }}
      onClick={() => setSelectedLocation(location)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalParking sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {location.name}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Capacity</Typography>
            <Typography variant="h4">{location.capacity}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Currently Parked</Typography>
            <Typography variant="h4">{location.current_vehicles}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, color }) => (
    <Card sx={{ 
      bgcolor: color, 
      color: 'white',
      height: '100%',
      boxShadow: 3,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'scale(1.02)' }
    }}>
      <CardContent>
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{value}</Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" color="textSecondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {!selectedLocation ? (
          <Box>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                mb: 4,
                fontWeight: 600,
                fontSize: isMobile ? '1.75rem' : '2.125rem'
              }}
            >
              Parking Locations
            </Typography>
            <Grid container spacing={3}>
              {locations.map(location => (
                <Grid item xs={12} sm={6} md={4} key={location.id}>
                  <LocationCard location={location} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box>
            <Box sx={{ 
              mb: 3,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 2
            }}>
              <IconButton 
                onClick={() => setSelectedLocation(null)}
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'background.paper' }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: isMobile ? '1.5rem' : '1.75rem'
                }}
              >
                {selectedLocation.name}
              </Typography>
              <Box sx={{ 
                ml: isMobile ? 0 : 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="body2" color="textSecondary">
                  {isMobile ? 'Show Out' : 'Show Checked Out'}
                </Typography>
                <Switch
                  checked={showCheckedOut}
                  onChange={(e) => setShowCheckedOut(e.target.checked)}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              size={isMobile ? 'small' : 'medium'}
              placeholder="Search by registration, owner, or vehicle type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  title="Total Vehicles"
                  value={filteredVehicles.length}
                  color={theme.palette.primary.main}
                />
              </Grid>
              {Object.entries(getVehicleTypeCounts()).map(([type, count], index) => (
                <Grid item xs={6} sm={6} md={3} key={type}>
                  <StatCard
                    title={type}
                    value={count}
                    color={`hsl(${index * 40}, 70%, 50%)`}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ 
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 3,
              mb: 2
            }}>
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <TableContainer sx={{ minWidth: isMobile ? 600 : '100%' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow sx={{ 
                        bgcolor: theme.palette.primary.main,
                        '& th': { 
                          color: 'white',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          padding: isMobile ? '12px 16px' : '16px 20px'
                        }
                      }}>
                        <TableCell>Vehicle No</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>{showCheckedOut ? 'Checkout' : 'Entry'}</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredVehicles.map((vehicle) => (
                        <TableRow 
                          key={vehicle.id}
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            '& td': { 
                              padding: isMobile ? '12px 16px' : '16px 20px',
                              whiteSpace: 'nowrap'
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            fontWeight: 500,
                            color: theme.palette.primary.main
                          }}>
                            {vehicle.registration_number}
                          </TableCell>
                          <TableCell>
                            {vehicle.vehicle_type}
                          </TableCell>
                          <TableCell>{vehicle.owner_name}</TableCell>
                          <TableCell>
                            {new Date(showCheckedOut ? vehicle.checkout_date : vehicle.in_date)
                              .toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={showCheckedOut ? 'Out' : 'In'}
                              color={showCheckedOut ? 'default' : 'success'}
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                minWidth: 60,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              {isMobile && (
                <Box sx={{ 
                  p: 1, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Scroll horizontally to view more →
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default Dashboard;
