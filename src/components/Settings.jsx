import React, { useState, useEffect } from 'react';
import {
  Box, Tab, Tabs, Typography, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Card, CardContent, ButtonGroup, useTheme, useMediaQuery,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem,
  MenuItem
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit,
  Save,
  Close,
  ExpandMore
} from '@mui/icons-material';





const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState(0);
  const [locations, setLocations] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [prices, setPrices] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [tempPrices, setTempPrices] = useState({});
  const [openUserDialog, setOpenUserDialog] = useState(false);
const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  
  // Dialog states
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openVehicleTypeDialog, setOpenVehicleTypeDialog] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', capacity: '' });
  const [newVehicleType, setNewVehicleType] = useState({ name: '' });

  useEffect(() => {
    fetchLocations();
    fetchVehicleTypes();
    fetchPrices();
  }, []);


  // Add this to your existing state declarations
const [users, setUsers] = useState([]);

// Add this to your useEffect hook
useEffect(() => {
  fetchLocations();
  fetchVehicleTypes();
  fetchPrices();
  fetchUsers();
}, []);

// Add this function to fetch users
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/settings/users');
    const data = await response.json();
    setUsers(data.data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};


  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/locations');
      const data = await response.json();
      setLocations(data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/vehicle-types');
      const data = await response.json();
      setVehicleTypes(data.data);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/prices');
      const data = await response.json();
      
      // Transform the array of prices into the required object format
      const priceObject = {};
      data.data.forEach(price => {
        const key = `${price.location_id}-${price.vehicle_type_id}`;
        priceObject[key] = price.price;
      });
      
      setPrices(priceObject);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };



  const handleAddUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        fetchUsers();
        setOpenUserDialog(false);
        setNewUser({ username: '', password: '', role: 'user' });
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
  
  

  const handleAddLocation = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      });
      if (response.ok) {
        fetchLocations();
        setOpenLocationDialog(false);
        setNewLocation({ name: '', address: '', capacity: '' });
      }
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleAddVehicleType = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/vehicle-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicleType)
      });
      if (response.ok) {
        fetchVehicleTypes();
        setOpenVehicleTypeDialog(false);
        setNewVehicleType({ name: '' });
      }
    } catch (error) {
      console.error('Error adding vehicle type:', error);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/settings/locations/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchLocations();
        }
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleDeleteVehicleType = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle type?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/settings/vehicle-types/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchVehicleTypes();
        }
      } catch (error) {
        console.error('Error deleting vehicle type:', error);
      }
    }
  };

  const handleEditPrices = () => {
    setTempPrices(prices);
    setEditMode(true);
  };

  const handleSavePrices = async () => {
    try {
      const priceUpdates = [];
      
      locations.forEach(location => {
        vehicleTypes.forEach(type => {
          const price = tempPrices[`${location.id}-${type.id}`];
          if (price) {
            priceUpdates.push({
              locationId: location.id,
              vehicleTypeId: type.id,
              price: Number(price)
            });
          }
        });
      });
  
      const response = await fetch('http://localhost:5000/api/settings/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: priceUpdates })
      });
  
      if (response.ok) {
        setPrices(tempPrices);
        setEditMode(false);
        fetchPrices();
      } else {
        throw new Error('Failed to save prices');
      }
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  };
  
  
  

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Tabs 
        value={tab} 
        onChange={(e, newValue) => setTab(newValue)} 
        sx={{ mb: 3 }}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons="auto"
      >
        <Tab label="Locations" />
        <Tab label="Vehicle Types" />
        <Tab label="Pricing" />
        <Tab label="Users" />
      </Tabs>

      {tab === 0 && (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Locations</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="contained" 
                onClick={() => setOpenLocationDialog(true)}
              >
                Add Location
              </Button>
            </Box>
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    {!isMobile && <TableCell>Address</TableCell>}
                    <TableCell>Capacity</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>{location.name}</TableCell>
                      {!isMobile && <TableCell>{location.address}</TableCell>}
                      <TableCell>{location.capacity}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => handleDeleteLocation(location.id)}
                          color="error"
                          size={isMobile ? "small" : "medium"}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Vehicle Types</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="contained"
                onClick={() => setOpenVehicleTypeDialog(true)}
              >
                Add Vehicle Type
              </Button>
            </Box>
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>{type.name}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => handleDeleteVehicleType(type.id)}
                          color="error"
                          size={isMobile ? "small" : "medium"}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

{tab === 2 && (
  <Card elevation={3}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Pricing Settings</Typography>
        {!editMode ? (
          <Button
            startIcon={<Edit />}
            variant="contained"
            onClick={handleEditPrices}
          >
            Edit Prices
          </Button>
        ) : (
          <ButtonGroup>
            <Button
              startIcon={<Save />}
              variant="contained"
              color="success"
              onClick={handleSavePrices}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </ButtonGroup>
        )}
      </Box>

      {isMobile ? (
        // Mobile Accordion View
        <Box sx={{ mt: 2 }}>
          {locations.map(location => (
            <Accordion key={location.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="bold">{location.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {vehicleTypes.map(type => (
                    <ListItem
                      key={type.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1
                      }}
                    >
                      <Typography>{type.name}</Typography>
                      {editMode ? (
                        <TextField
                          type="number"
                          value={tempPrices[`${location.id}-${type.id}`] || ''}
                          onChange={(e) => setTempPrices(prev => ({
                            ...prev,
                            [`${location.id}-${type.id}`]: e.target.value
                          }))}
                          InputProps={{
                            startAdornment: <Typography>₹</Typography>
                          }}
                          size="small"
                          variant="outlined"
                          sx={{ width: '120px' }}
                        />
                      ) : (
                        <Typography>
                          ₹{prices[`${location.id}-${type.id}`] || '0'}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                {vehicleTypes.map(type => (
                  <TableCell key={type.id}>{type.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map(location => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  {vehicleTypes.map(type => (
                    <TableCell key={type.id}>
                      {editMode ? (
                        <TextField
                          type="number"
                          value={tempPrices[`${location.id}-${type.id}`] || ''}
                          onChange={(e) => setTempPrices(prev => ({
                            ...prev,
                            [`${location.id}-${type.id}`]: e.target.value
                          }))}
                          InputProps={{
                            startAdornment: <Typography>₹</Typography>
                          }}
                          size="small"
                          variant="outlined"
                          sx={{ width: '150px' }}
                        />
                      ) : (
                        <Typography>
                          ₹{prices[`${location.id}-${type.id}`] || '0'}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
)}


{tab === 3 && (
  <Card elevation={3}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">User Management</Typography>
        <Button 
          startIcon={<AddIcon />} 
          variant="contained"
          onClick={() => setOpenUserDialog(true)}
        >
          Add User
        </Button>
      </Box>
      <TableContainer>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleDeleteUser(user.id)}
                    color="error"
                    size={isMobile ? "small" : "medium"}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
)}

      {/* Location Dialog */}
      <Dialog open={openLocationDialog} onClose={() => setOpenLocationDialog(false)}>
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={newLocation.address}
            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={newLocation.capacity}
            onChange={(e) => setNewLocation({ ...newLocation, capacity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLocationDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLocation} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>



      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
  <DialogTitle>Add New User</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Username"
      fullWidth
      value={newUser.username}
      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
    />
    <TextField
      margin="dense"
      label="Password"
      type="password"
      fullWidth
      value={newUser.password}
      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
    />
    <TextField
      select
      margin="dense"
      label="Role"
      fullWidth
      value={newUser.role}
      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
    >
      <MenuItem value="admin">Admin</MenuItem>
      <MenuItem value="user">User</MenuItem>
    </TextField>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
    <Button onClick={handleAddUser} variant="contained">Add</Button>
  </DialogActions>
</Dialog>

      {/* Vehicle Type Dialog */}
      <Dialog open={openVehicleTypeDialog} onClose={() => setOpenVehicleTypeDialog(false)}>
        <DialogTitle>Add New Vehicle Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Vehicle Type Name"
            fullWidth
            value={newVehicleType.name}
            onChange={(e) => setNewVehicleType({ ...newVehicleType, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVehicleTypeDialog(false)}>Cancel</Button>
          <Button onClick={handleAddVehicleType} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
