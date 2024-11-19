import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const VehicleTypeSettings = () => {
  const [vehicleTypes, setVehicleTypes] = useState([
    'Truck',
    'Bus',
    'Van',
    'Car',
    'Two Wheeler',
    'Three Wheeler',
    'Heavy Vehicle'
  ]);
  const [newType, setNewType] = useState('');

  const handleAddType = () => {
    if (newType.trim() && !vehicleTypes.includes(newType.trim())) {
      setVehicleTypes([...vehicleTypes, newType.trim()]);
      setNewType('');
    }
  };

  const handleDeleteType = (typeToDelete) => {
    setVehicleTypes(vehicleTypes.filter(type => type !== typeToDelete));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manage Vehicle Types
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          label="New Vehicle Type"
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddType}
        >
          Add Type
        </Button>
      </Box>

      <List>
        {vehicleTypes.map((type) => (
          <ListItem
            key={type}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDeleteType(type)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={type} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default VehicleTypeSettings;