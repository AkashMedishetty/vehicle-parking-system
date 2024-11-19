import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';

const LocationDashboard = () => {
  const { locationId } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const location = settings.locations.find(loc => loc.id === parseInt(locationId));
    setLocationData(location);

    const allVehicles = JSON.parse(localStorage.getItem('vehicleEntries') || '[]');
    const locationVehicles = allVehicles.filter(v => v.locationId === parseInt(locationId));
    setVehicles(locationVehicles);
  }, [locationId]);

  const getLocationStats = () => ({
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    todayRevenue: calculateTodayRevenue(vehicles, locationData?.rates),
    occupancyRate: calculateOccupancyRate(vehicles.length, locationData?.capacity)
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {locationData?.name} Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Location Details</Typography>
          <Typography>Address: {locationData?.address}</Typography>
          <Typography>Capacity: {locationData?.capacity} vehicles</Typography>
        </Grid>
        
        {/* Vehicle Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vehicle Distribution</Typography>
              {/* Add chart or statistics here */}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Activities</Typography>
              {/* Add recent activities table here */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationDashboard;
