import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, TextField, Typography, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
  useTheme, useMediaQuery, Box, Alert
} from '@mui/material';

const VehicleDetails = ({ formData, updateFormData, errors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, locationsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/settings/vehicle-types'),
          fetch('http://localhost:5000/api/settings/locations')
        ]);

        const typesData = await typesResponse.json();
        const locationsData = await locationsResponse.json();

        setVehicleTypes(typesData.data);
        setLocations(locationsData.data);
        setFetchError(null);
      } catch (error) {
        setFetchError('Failed to load vehicle types and locations');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field) => (event) => {
    updateFormData({ [field]: event.target.value });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={isMobile ? 30 : 40} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {fetchError}
      </Alert>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: isMobile ? 2 : 3, 
        mt: 2, 
        mb: 2,
        borderRadius: 2
      }}
    >
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            Vehicle Details
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange('registrationNumber')}
            error={!!errors.registrationNumber}
            helperText={errors.registrationNumber}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            required 
            error={!!errors.vehicleType}
            size={isMobile ? "small" : "medium"}
          >
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={formData.vehicleType || ''}
              onChange={handleChange('vehicleType')}
              label="Vehicle Type"
              sx={{ borderRadius: 1.5 }}
            >
              {vehicleTypes.map((type) => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Make"
            value={formData.make}
            onChange={handleChange('make')}
            error={!!errors.make}
            helperText={errors.make}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Model"
            value={formData.model}
            onChange={handleChange('model')}
            error={!!errors.model}
            helperText={errors.model}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Year"
            value={formData.year}
            onChange={handleChange('year')}
            error={!!errors.year}
            helperText={errors.year}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Engine Number"
            value={formData.engineNo}
            onChange={handleChange('engineNo')}
            error={!!errors.engineNo}
            helperText={errors.engineNo}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Chassis Number"
            value={formData.chassisNo}
            onChange={handleChange('chassisNo')}
            error={!!errors.chassisNo}
            helperText={errors.chassisNo}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Kilometers Run"
            value={formData.kmsRun}
            onChange={handleChange('kmsRun')}
            error={!!errors.kmsRun}
            helperText={errors.kmsRun}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="In Date"
            type="date"
            value={formData.inDate}
            onChange={handleChange('inDate')}
            InputLabelProps={{ shrink: true }}
            error={!!errors.inDate}
            helperText={errors.inDate}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="In Time"
            type="time"
            value={formData.inTime}
            onChange={handleChange('inTime')}
            InputLabelProps={{ shrink: true }}
            error={!!errors.inTime}
            helperText={errors.inTime}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            required 
            error={!!errors.inPlace}
            size={isMobile ? "small" : "medium"}
          >
            <InputLabel>In Place</InputLabel>
            <Select
              value={formData.inPlace || ''}
              onChange={handleChange('inPlace')}
              label="In Place"
              sx={{ borderRadius: 1.5 }}
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.name}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default VehicleDetails;