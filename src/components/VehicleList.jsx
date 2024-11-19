import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  Box, Grid, Paper, Typography, Card, CardContent, SpeedDial, 
  SpeedDialAction, Chip, useTheme, useMediaQuery, TextField,
  InputAdornment, Button, IconButton, Tooltip, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, TablePagination,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert, Fade,
  CircularProgress, Backdrop, styled, Divider, 
  Stack, TableSortLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import {
  Visibility, Print, Delete, Edit, MoreVert as MoreVertIcon,
  Search as SearchIcon, FilterList, Sort, Close, CloudDownload,
  CheckCircle, Cancel, LocalShipping, CalendarToday, LocationOn,
  PhotoCamera
} from '@mui/icons-material';
import {
  Visibility as PreviewIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ImageList, ImageListItem } from '@mui/material';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      width: '100%',
      maxHeight: '100%',
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Desktop Vehicle Table Component

const VehicleList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State Management
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: 'inDate', direction: 'desc' });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [previewVehicle, setPreviewVehicle] = useState(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [filters, setFilters] = useState({
    vehicleType: 'all',
    dateRange: { start: '', end: '' },
    status: 'all'
  });
  const [bulkPrintDialogOpen, setBulkPrintDialogOpen] = useState(false);

  // Data Fetching
  useEffect(() => {
    fetchVehicles();
    fetchLocations();
  }, [sortConfig, filters]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError('Error loading vehicles. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/locations');
      const data = await response.json();
      setLocations(data.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };
  const DesktopVehicleTable = ({ vehicles }) => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell padding="checkbox">
              <Checkbox
                checked={selectedVehicles.length === vehicles.length}
                indeterminate={selectedVehicles.length > 0 && selectedVehicles.length < vehicles.length}
                onChange={handleSelectAllClick}
              />
            </StyledTableCell>
            <StyledTableCell>
              <TableSortLabel
                active={sortConfig.field === 'registrationNumber'}
                direction={sortConfig.direction}
                onClick={() => handleSort('registrationNumber')}
              >
                Registration No
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell>Owner Name</StyledTableCell>
            <StyledTableCell>Vehicle Type</StyledTableCell>
            <StyledTableCell>
              <TableSortLabel
                active={sortConfig.field === 'inDate'}
                direction={sortConfig.direction}
                onClick={() => handleSort('inDate')}
              >
                Entry Date
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell>Location</StyledTableCell>
            <StyledTableCell align="center">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow
              key={vehicle.id}
              hover
              selected={selectedVehicles.includes(vehicle.id)}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedVehicles.includes(vehicle.id)}
                  onChange={() => handleSelectVehicle(vehicle.id)}
                />
              </TableCell>
              <TableCell>{vehicle.registration_number}</TableCell>
              <TableCell>{vehicle.owner_name}</TableCell>
              <TableCell>
                <Chip
                  label={vehicle.vehicle_type}
                  size="small"
                  color="primary"
                />
              </TableCell>
              <TableCell>{new Date(vehicle.in_date).toLocaleDateString()}</TableCell>
              <TableCell>{vehicle.in_place}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <IconButton onClick={() => handlePreview(vehicle.id)} color="primary">
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handlePrint(vehicle)} color="secondary">
                    <Print />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(vehicle)} color="info">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(vehicle.id)} color="error">
                    <Delete />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  const MobileVehicleList = ({ vehicles }) => (
    <Box>
      {vehicles.map(vehicle => (
        <StyledCard key={vehicle.id} >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Checkbox
                checked={selectedVehicles.includes(vehicle.id)}
                onChange={() => handleSelectVehicle(vehicle.id)}
                sx={{ mr: 1 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {vehicle.registration_number}
                </Typography>
                <Chip
                  label={vehicle.vehicle_type}
                  size="small"
                  color="secondary"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
  
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Owner
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {vehicle.owner_name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Entry Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(vehicle.in_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {vehicle.in_place}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
  
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              <IconButton size="small" color="primary" onClick={() => handlePreview(vehicle.id)}>
                <Visibility />
              </IconButton>
              <IconButton size="small" color="secondary" onClick={() => handlePrint(vehicle)}>
                <Print />
              </IconButton>
              <IconButton size="small" color="info" onClick={() => handleEdit(vehicle)}>
                <Edit />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => handleDelete(vehicle.id)}>
                <Delete />
              </IconButton>
            </Stack>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
  
  // Handlers
  const handlePreview = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/${id}`);
      const data = await response.json();
      setPreviewVehicle(data);
      setOpenPreviewDialog(true);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setOpenEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchVehicles();
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleSort = (field) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredVehicles.map(vehicle => vehicle.id);
      setSelectedVehicles(newSelected);
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (id) => {
    const selectedIndex = selectedVehicles.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selectedVehicles, id];
    } else {
      newSelected = selectedVehicles.filter(vehicleId => vehicleId !== id);
    }
    
    setSelectedVehicles(newSelected);
  };

  const filteredVehicles = vehicles
  .filter(vehicle => {
    const matchesSearch = 
      vehicle.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vehicle_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = selectedLocation === 'all' || vehicle.in_place === selectedLocation;
    
    return matchesSearch && matchesLocation;
  })
  .sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    return direction * (new Date(b[sortConfig.field]) - new Date(a[sortConfig.field]));
  });
// Enhanced PreviewDialog Component
const PreviewDialog = ({ vehicle, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  


  return (
    <StyledDialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen={isMobile}
    >
      <StyledDialogTitle>
        Vehicle Details
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Agreement No" value={vehicle?.agreement_no || ''} fullWidth disabled />
                    <TextField label="Financier Name" value={vehicle?.financier_name || ''} fullWidth disabled sx={{ mt: 2 }} />
                    <TextField label="Owner Name" value={vehicle?.owner_name || ''} fullWidth disabled sx={{ mt: 2 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Registration Number" value={vehicle?.registration_number || ''} fullWidth disabled />
                    <TextField label="Vehicle Type" value={vehicle?.vehicle_type || ''} fullWidth disabled sx={{ mt: 2 }} />
                    <TextField label="Make & Model" value={`${vehicle?.make || ''} ${vehicle?.model || ''}`} fullWidth disabled sx={{ mt: 2 }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Technical Details Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Technical Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Engine No" value={vehicle?.engine_no || ''} fullWidth disabled />
                    <TextField label="Chassis No" value={vehicle?.chassis_no || ''} fullWidth disabled sx={{ mt: 2 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="KMs Run" value={vehicle?.kms_run || ''} fullWidth disabled />
                    <TextField label="Year" value={vehicle?.year || ''} fullWidth disabled sx={{ mt: 2 }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Battery Details Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Battery Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField label="Battery Make" value={vehicle?.battery_make || ''} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField label="Battery Number" value={vehicle?.battery_number || ''} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField label="Battery Condition" value={vehicle?.battery_condition || ''} fullWidth disabled />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Documents Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Documents
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(vehicle?.documents || {}).map(([doc, available]) => (
                    <Grid item xs={12} sm={6} md={4} key={doc}>
                      <FormControlLabel
                        control={<Checkbox checked={available} disabled />}
                        label={doc}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Images Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Vehicle Images
                </Typography>
                {vehicle?.images?.length > 0 ? (
                  <ImageList cols={isMobile ? 2 : 3} gap={8}>
                    {vehicle.images.map((img, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={`http://localhost:5000${img}`}
                          alt={`Vehicle image ${index + 1}`}
                          loading="lazy"
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No images available
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </StyledDialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

const handleBulkPrint = () => {
  if (selectedVehicles.length === 0) {
    alert('Please select vehicles to print');
    return;
  }
  
  selectedVehicles.forEach(vehicleId => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      handlePrint(vehicle);
    }
  });
  
  setSelectedVehicles([]);
};

const executeBulkPrint = () => {
  selectedVehicles.forEach(vehicleId => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      handlePrint(vehicle);
    }
  });
  setBulkPrintDialogOpen(false);
  setSelectedVehicles([]);
};

const generateVehicleInfoSection = (vehicle) => `
  <div class="section">
    <div class="section-title">Vehicle Information</div>
    <div class="grid">
      <div class="info-item">
        <div class="label">Agreement No:</div>
        <div>${vehicle.agreement_no || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Financier Name:</div>
        <div>${vehicle.financier_name || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Owner Name:</div>
        <div>${vehicle.owner_name || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Vehicle Type:</div>
        <div>${vehicle.vehicle_type || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Make & Model:</div>
        <div>${vehicle.make} ${vehicle.model || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Registration Number:</div>
        <div>${vehicle.registration_number || '-'}</div>
     
      </div>
      <div class="info-item">
        <div class="label">Entry Date:</div>
        <div>${new Date(vehicle.in_date).toLocaleDateString() || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Entry Time:</div>
        <div>${vehicle.in_time || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Location:</div>
        <div>${vehicle.in_place || '-'}</div>
      </div>
    </div>
  </div>
`;
const generateTechnicalDetailsSection = (vehicle) => `
  <div class="section">
    <div class="section-title">Technical Details</div>
    <div class="grid">
      <div class="info-item">
        <div class="label">Engine Number</div>
        <div>${vehicle.engine_no || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Chassis Number</div>
        <div>${vehicle.chassis_no || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Kilometers Run</div>
        <div>${vehicle.kms_run || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Year</div>
        <div>${vehicle.year || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Make</div>
        <div>${vehicle.make || '-'}</div>
      </div>
      <div class="info-item">
        <div class="label">Model</div>
        <div>${vehicle.model || '-'}</div>
      </div>
    </div>
    
   
      </div>
    </div>
  </div>
`;
const generateBatteryTyreSection = (vehicle) => `
  <div class="section">
    <div class="section-title">Battery & Tyre Details</div>
    
    <!-- Battery Details -->
    <div class="grid-container">
      <div class="battery-info">
        <div class="info-item">
          <span class="label">Battery Make:</span> ${vehicle.battery_make || '-'}
        </div>
        <div class="info-item">
          <span class="label">Number:</span> ${vehicle.battery_number || '-'}
        </div>
        <div class="info-item">
          <span class="label">Condition:</span> ${vehicle.battery_condition || '-'}
        </div>
      </div>

      <!-- Tyre Details in Grid -->
      <div class="tyre-grid">
        ${vehicle.tyres?.map(tyre => `
          <div class="tyre-item">
            <span class="label">${tyre.position}:</span>
            <span>${tyre.make || '-'}</span> |
            <span>${tyre.number || '-'}</span> |
            <span>${tyre.condition || '-'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <style>
    .grid-container {
      display: flex;
      gap: 4px;
    }
    .battery-info {
      width: 30%;
    }
    .tyre-grid {
      width: 70%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px;
    }
    .tyre-item {
      font-size: 8px;
      padding: 1px;
      white-space: nowrap;
    }
  </style>
`;

const generateDocumentsAccessoriesSection = (vehicle) => `
  <div class="section">
    <div class="section-title">Documents & Accessories</div>
    <div class="doc-grid">
      ${Object.entries(vehicle.documents || {}).map(([doc, available]) => `
        <div class="info-item">
          <div class="label">${doc.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')}</div>
          <div class="${available ? 'available' : 'not-available'}">
            ${available ? '✓' : '✗'}
          </div>
        </div>
      `).join('')}
    </div>

    <style>
      .doc-grid { 
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
      }
      .available { color: #4caf50; font-weight: bold; }
      .not-available { color: #f44336; font-weight: bold; }
      .info-item { 
        padding: 2px;
        border: 1px solid #eee;
        border-radius: 2px;
        margin: 1px;
      }
    </style>
  </div>
`;




const generateSignatureSection = () => `
  <div class="section signature-section">
    <div class="section-title">Authorization</div>
    
    <!-- First Party -->
    <div class="party-section">
      <div class="party-title">First Party (Funding)</div>
      <div class="signature-grid">
        <div class="signature-item">
          <div class="label">Place:</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <div class="label">Person Funding Vehicle:</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <div class="label">Godown Keeper Signature:</div>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>

    <!-- Second Party -->
    <div class="party-section">
      <div class="party-title">Second Party (Collection)</div>
      <div class="signature-grid">
        <div class="signature-item">
          <div class="label">Person Taking Custody:</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <div class="label">Vehicle Name:</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <div class="label">Name:</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <div class="label">Collection Co.:</div>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>

    <style>
      .signature-section {
        margin-top: 20px;
        page-break-inside: avoid;
      }
      .party-section {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .party-title {
        font-weight: bold;
        color: #1976d2;
        margin-bottom: 10px;
      }
      .signature-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      .signature-item {
        margin-bottom: 10px;
      }
      .signature-line {
        margin-top: 20px;
        border-top: 1px solid #000;
        width: 100%;
      }
    </style>
  </div>
`;
const generatePrintStyles = () => `
  @page { size: A4; margin: 0.2cm; }
  body { 
    font-family: Arial, sans-serif; 
    padding: 3px; 
    font-size: 15px;
    line-height: 1.1;
  }
  .header { 
    text-align: center; 
    margin-bottom: 2px;
    border-bottom: 1px solid #1976d2;
    padding-bottom: 2px;
  }
  .header h1 { 
    font-size: 15px; 
    margin: 0; 
    font-weight: bold;
    display: inline-block;
  }
  .header h2 { 
    font-size: 14px; 
    margin: 0; 
    display: inline-block;
    margin-left: 10px;
  }
  
  .section { 
    margin-bottom: 1px;
  }
  .section-title { 
    font-size: 15px;
    margin: 0;
    font-weight: bold;
    color: #1976d2;
    border-bottom: 1px solid #eee;
  }
  .label { 
    font-size: 15px; 
    font-weight: bold;
  }
  
  table { 
    font-size: 15px;
    margin: 1px 0; 
  }
  
  .tyre-item {
    font-size: 8px;
    padding: 1px;
  }
  
  .doc-grid .info-item {
    font-size: 8px;
  }
`;





// Enhanced EditDialog Component
const EditDialog = ({ vehicle, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [editedData, setEditedData] = useState({
    agreement_no: vehicle?.agreement_no || '',
    financier_name: vehicle?.financier_name || '',
    owner_name: vehicle?.owner_name || '',
    address: vehicle?.address || '',
    registration_number: vehicle?.registration_number || '',
    vehicle_type: vehicle?.vehicle_type || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    engine_no: vehicle?.engine_no || '',
    chassis_no: vehicle?.chassis_no || '',
    kms_run: vehicle?.kms_run || '',
    in_date: vehicle?.in_date ? new Date(vehicle.in_date).toISOString().split('T')[0] : '',
    in_time: vehicle?.in_time || '',
    in_place: vehicle?.in_place || '',
    battery_make: vehicle?.battery_make || '',
    battery_number: vehicle?.battery_number || '',
    battery_condition: vehicle?.battery_condition || '',
    additional_details: vehicle?.additional_details || '',
    tyres: vehicle?.tyres || [],
    documents: vehicle?.documents || {},
    images: vehicle?.images || []
  });

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicle.id}/images`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setEditedData(prev => ({
          ...prev,
          images: [...prev.images, ...data.files.map(file => `/uploads/${file}`)]
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const handleSave = async () => {
    const updateData = {
      // Vehicle basic details
      agreement_no: editedData.agreement_no,
      financier_name: editedData.financier_name,
      owner_name: editedData.owner_name,
      address: editedData.address,
      registration_number: editedData.registration_number,
      vehicle_type: editedData.vehicle_type,
      make: editedData.make,
      model: editedData.model,
      year: editedData.year,
      engine_no: editedData.engine_no,
      chassis_no: editedData.chassis_no,
      kms_run: editedData.kms_run,
      in_date: new Date(editedData.in_date).toISOString().split('T')[0],
      in_time: editedData.in_time,
      in_place: editedData.in_place,
      additional_details: editedData.additional_details,
  
      // Battery details
      battery_details: {
        make: editedData.battery_make,
        number: editedData.battery_number,
        condition_status: editedData.battery_condition
      },
  
      // Tyre details
      tyres: editedData.tyres,
  
      // Document details
      documents: Object.entries(editedData.documents).map(([doc_type, is_available]) => ({
        doc_type,
        is_available: is_available ? 1 : 0
      }))
    };
  
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
  
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error.message);
    }
  };

  const validateUpdateData = (data) => {
    const requiredFields = ['registration_number', 'owner_name', 'vehicle_type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }
    return true;
  };
  
  

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen={isMobile}
    >
      <StyledDialogTitle>
        Edit Vehicle Details
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Agreement No"
                      value={editedData.agreement_no}
                      onChange={(e) => setEditedData({...editedData, agreement_no: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Financier Name"
                      value={editedData.financier_name}
                      onChange={(e) => setEditedData({...editedData, financier_name: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      value={editedData.owner_name}
                      onChange={(e) => setEditedData({...editedData, owner_name: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Registration Number"
                      value={editedData.registration_number}
                      onChange={(e) => setEditedData({...editedData, registration_number: e.target.value})}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Technical Details Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Technical Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Engine No"
                      value={editedData.engine_no}
                      onChange={(e) => setEditedData({...editedData, engine_no: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Chassis No"
                      value={editedData.chassis_no}
                      onChange={(e) => setEditedData({...editedData, chassis_no: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="KMs Run"
                      value={editedData.kms_run}
                      onChange={(e) => setEditedData({...editedData, kms_run: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Year"
                      value={editedData.year}
                      onChange={(e) => setEditedData({...editedData, year: e.target.value})}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Battery Details Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Battery Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Battery Make"
                      value={editedData.battery_make}
                      onChange={(e) => setEditedData({...editedData, battery_make: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Battery Number"
                      value={editedData.battery_number}
                      onChange={(e) => setEditedData({...editedData, battery_number: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Battery Condition</InputLabel>
                      <Select
                        value={editedData.battery_condition}
                        onChange={(e) => setEditedData({...editedData, battery_condition: e.target.value})}
                      >
                        <MenuItem value="good">Good</MenuItem>
                        <MenuItem value="average">Average</MenuItem>
                        <MenuItem value="bad">Bad</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Documents Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Documents
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(editedData.documents).map(([doc, available]) => (
                    <Grid item xs={12} sm={6} md={4} key={doc}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={available}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              documents: { ...editedData.documents, [doc]: e.target.checked }
                            })}
                          />
                        }
                        label={doc}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Images Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Vehicle Images
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                />
                <label htmlFor="image-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 2 }}
                  >
                    Upload Images
                  </Button>
                </label>
                <ImageList cols={isMobile ? 2 : 3} gap={8}>
                  {editedData.images.map((img, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={`http://localhost:5000${img}`}
                        alt={`Vehicle image ${index + 1}`}
                        loading="lazy"
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          bgcolor: 'background.paper'
                        }}
                        onClick={() => {
                          const newImages = [...editedData.images];
                          newImages.splice(index, 1);
                          setEditedData({...editedData, images: newImages});
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </StyledDialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
// Print Functionality
const generateUniqueId = () => {
  return 'print-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const handlePrint = (vehicle) => {
  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vehicle Details - ${vehicle.registration_number}</title>
        <style>
          @page { size: A4; margin: 0.5cm; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 10px; 
            font-size: 10px;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 10px; 
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .logo {
            max-width: 100px;
            margin-bottom: 5px;
          }
          .title {
            color: #1976d2;
            font-size: 18px;
            margin: 0;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
            margin: 3px 0;
          }
          .section {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
          }
          .section-title {
            color: #1976d2;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 3px;
            border-bottom: 1px solid #1976d2;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          ${generatePrintStyles()}
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.png" class="logo" />
          <h1 class="title">Vehicle Details Report</h1>
          <h2 class="subtitle">${vehicle.registration_number}</h2>
        </div>
        ${generateVehicleInfoSection(vehicle)}
        ${generateTechnicalDetailsSection(vehicle)}
        ${generateBatteryTyreSection(vehicle)}
        ${generateDocumentsAccessoriesSection(vehicle)}
        ${generateSignatureSection()}
        <div class="footer">
          <p>Generated on: ${new Date().toLocaleString()} | Document ID: ${generateUniqueId()}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

// Bulk Print Dialog
const BulkPrintDialog = () => (
  <StyledDialog
    open={bulkPrintDialogOpen}
    onClose={() => setBulkPrintDialogOpen(false)}
    maxWidth="sm"
    fullWidth
  >
    <StyledDialogTitle>
      Bulk Print Vehicles
      <IconButton onClick={() => setBulkPrintDialogOpen(false)} sx={{ color: 'white' }}>
        <Close />
      </IconButton>
    </StyledDialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Selected vehicles: {selectedVehicles.length}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        This will open multiple print dialogs. Please ensure your browser allows popup windows.
      </Alert>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setBulkPrintDialogOpen(false)}>Cancel</Button>
      <Button
        variant="contained"
        onClick={executeBulkPrint}
        startIcon={<Print />}
      >
        Print Selected
      </Button>
    </DialogActions>
  </StyledDialog>
);
// Filter Dialog Component
const FilterDialog = ({ open, onClose, filters, setFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        Filter Vehicles
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={tempFilters.vehicleType}
              onChange={(e) => setTempFilters({ ...tempFilters, vehicleType: e.target.value })}
              label="Vehicle Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="truck">Truck</MenuItem>
              <MenuItem value="car">Car</MenuItem>
              <MenuItem value="bus">Bus</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Date Range</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="From"
                  value={tempFilters.dateRange.start}
                  onChange={(e) => setTempFilters({
                    ...tempFilters,
                    dateRange: { ...tempFilters.dateRange, start: e.target.value }
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="To"
                  value={tempFilters.dateRange.end}
                  onChange={(e) => setTempFilters({
                    ...tempFilters,
                    dateRange: { ...tempFilters.dateRange, end: e.target.value }
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="checked_out">Checked Out</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleApplyFilters}
          startIcon={<FilterList />}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

// Main render return statement
return (
  <Box sx={{ p: isMobile ? 2 : 3 }}>
    <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, borderRadius: 2 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 500 }}>
              Vehicle List
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {selectedVehicles.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handleBulkPrint}
                  color="secondary"
                >
                  Print Selected ({selectedVehicles.length})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilterDialogOpen(true)}
              >
                Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filter Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            size={isMobile ? "small" : "medium"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Location"
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locations.map(location => (
                <MenuItem key={location.id} value={location.name}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Vehicle List Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {isMobile ? (
        <MobileVehicleList 
          vehicles={filteredVehicles}
          selectedVehicles={selectedVehicles}
          onSelectVehicle={handleSelectVehicle}
        />
      ) : (
        <DesktopVehicleTable 
          vehicles={filteredVehicles}
          selectedVehicles={selectedVehicles}
          onSelectVehicle={handleSelectVehicle}
          onSelectAll={handleSelectAllClick}
        />
      )}
          
          <TablePagination
            component="div"
            count={filteredVehicles.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={isMobile ? [5, 10] : [10, 25, 50]}
          />
        </>
      )}
    </Paper>

    {/* Dialogs */}
    <PreviewDialog
      vehicle={previewVehicle}
      open={openPreviewDialog}
      onClose={() => {
        setOpenPreviewDialog(false);
        setPreviewVehicle(null);
      }}
    />
    <EditDialog
      vehicle={editVehicle}
      open={openEditDialog}
      onClose={() => {
        setOpenEditDialog(false);
        setEditVehicle(null);
      }}
    />
    <FilterDialog
      open={filterDialogOpen}
      onClose={() => setFilterDialogOpen(false)}
      filters={filters}
      setFilters={setFilters}
    />
    <BulkPrintDialog />
  </Box>
);
// Mobile Vehicle List Component

}
export default VehicleList;
