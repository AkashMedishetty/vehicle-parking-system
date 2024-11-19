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

const LocationSettings = () => {
  const [locations, setLocations] = useState([
    'Parking Lot A',
    'Parking Lot B',
    'Garage 1',
    'Garage 2',
    'Workshop Area',
    'Storage Yard'
  ]);
  const [newLocation, setNewLocation] = useState('');

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleDeleteLocation = (locationToDelete) => {
    setLocations(locations.filter(location => location !== locationToDelete));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manage Locations
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          label="New Location"
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLocation}
        >
          Add Location
        </Button>
      </Box>

      <List>
        {locations.map((location) => (
          <ListItem
            key={location}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDeleteLocation(location)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={location} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LocationSettings;
