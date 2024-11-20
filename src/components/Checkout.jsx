import { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, FormControlLabel, Checkbox, ImageList, ImageListItem,
  Divider, useTheme, useMediaQuery, Alert, CircularProgress,
  InputAdornment, Card, CardContent, Fade, Collapse, MenuItem
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  LocalAtm as PaymentIcon,
  CheckCircle as SuccessIcon,
  Visibility, Print, Search as SearchIcon,
  ErrorOutline as ErrorIcon,
  ArrowBack
} from '@mui/icons-material';
const styles = {
  mainContainer: {
    p: { xs: 2, md: 3 },
    maxWidth: 1200,
    mx: 'auto'
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2
  },
  actionButton: {
    height: '100%',
    whiteSpace: 'nowrap'
  }
};
const Checkout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [billingDetails, setBillingDetails] = useState(null);
  const [showCheckedOutVehicles, setShowCheckedOutVehicles] = useState(false);
  const [checkedOutVehicles, setCheckedOutVehicles] = useState([]);
  const [previewVehicle, setPreviewVehicle] = useState(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);



const handleClose = () => {
  setOpen(false);
  setShowCheckedOutVehicles(false);
};

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a registration number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://vehicle-parking-system.vercel.app/api/vehicles/search/${searchQuery.trim()}`);
      const data = await response.json();
      
      if (data.success && data.vehicle) {
        // Check if vehicle is already checked out
        const checkoutResponse = await fetch(`https://vehicle-parking-system.vercel.app/api/checkouts/status/${data.vehicle.id}`);
        const checkoutStatus = await checkoutResponse.json();
        
        if (checkoutStatus.isCheckedOut) {
          setError('This vehicle has already been checked out');
          setVehicleDetails(null);
          return;
        }

        const inDate = new Date(data.vehicle.in_date);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - inDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        
        const priceResponse = await fetch(`https://vehicle-parking-system.vercel.app/api/settings/prices`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const priceData = await priceResponse.json();
        const ratePerDay = priceData.price || 100;
        
        setBillingDetails({
          daysStayed: diffDays,
          ratePerDay: ratePerDay,
          totalAmount: diffDays * ratePerDay,
          checkoutDate: currentDate.toISOString().split('T')[0],
          checkoutTime: currentDate.toTimeString().split(' ')[0]
        });
        
        setVehicleDetails(data.vehicle);
      } else {
        setError('Vehicle not found');
        setVehicleDetails(null);
      }
    } catch (error) {
      setError('Error searching for vehicle');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (vehicle) => {
    try {
      const vehicleId = vehicle.vehicle_id || vehicle.id;
      const response = await fetch(`https://vehicle-parking-system.vercel.app/api/vehicles/${vehicleId}`);
      const fullVehicleData = await response.json();
  
      // Parse vehicle_details if it's a string
      const vehicleDetails = typeof vehicle.vehicle_details === 'string' 
        ? JSON.parse(vehicle.vehicle_details) 
        : vehicle.vehicle_details;
  
      const combinedData = {
        ...fullVehicleData,
        ...vehicleDetails,
        checkout_date: vehicle.checkout_date,
        checkout_time: vehicle.checkout_time,
        days_stayed: vehicle.days_stayed,
        price_per_day: vehicle.price_per_day,
        total_amount: vehicle.total_amount,
        tyres: vehicleDetails?.tyres || [],
        documents: vehicleDetails?.documents || {},
        battery_details: vehicleDetails?.battery_details || {},
        images: fullVehicleData.images || []
      };
  
      setPreviewVehicle(combinedData);
      setOpenPreviewDialog(true);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };
  

  const CheckedOutVehiclesTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 3,
          '& .MuiTable-root': {
            minWidth: isMobile ? 'unset' : 750
          },
          '& .MuiTableCell-root': {
            px: isMobile ? 1 : 2,
            py: isMobile ? 1.5 : 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white' }}>Reg No</TableCell>
              <TableCell sx={{ color: 'white' }}>Owner</TableCell>
              {!isMobile && <TableCell sx={{ color: 'white' }}>Type</TableCell>}
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkedOutVehicles.map((vehicle) => (
              <TableRow 
                key={vehicle.id}
                hover
                sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
              >
                <TableCell sx={{ fontWeight: 'medium' }}>
                  {vehicle.registration_number}
                </TableCell>
                <TableCell>{vehicle.owner_name}</TableCell>
                {!isMobile && (
                  <TableCell>
                    <Chip 
                      label={vehicle.vehicle_type}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  {new Date(vehicle.checkout_date).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 'medium' }}>
                  ₹{vehicle.total_amount}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleViewDetails(vehicle)}
                    sx={{ mr: 0.5 }}
                  >
                    <Visibility sx={{ fontSize: isMobile ? 18 : 20 }} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="secondary"
                    onClick={() => printReceipt(vehicle)}
                  >
                    <Print sx={{ fontSize: isMobile ? 18 : 20 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  
  // Preview Dialog Componentconst PreviewDialog = ({ vehicle, open, onClose }) => (
    const PreviewDialog = ({ vehicle, open, onClose }) => (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility />
            <Typography>Vehicle Details - {vehicle?.registration_number}</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Agreement No" value={vehicle?.agreement_no || ''} fullWidth disabled />
                  <TextField label="Financier Name" value={vehicle?.financier_name || ''} fullWidth disabled />
                  <TextField label="Owner Name" value={vehicle?.owner_name || ''} fullWidth disabled />
                  <TextField label="Registration Number" value={vehicle?.registration_number || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Vehicle Type" value={vehicle?.vehicle_type || ''} fullWidth disabled />
                  <TextField label="Make" value={vehicle?.make || ''} fullWidth disabled />
                  <TextField label="Model" value={vehicle?.model || ''} fullWidth disabled />
                  <TextField label="Year" value={vehicle?.year || ''} fullWidth disabled />
                </Grid>
              </Grid>
            </Grid>
    
            {/* Technical Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Technical Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField label="Engine Number" value={vehicle?.engine_no || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Chassis Number" value={vehicle?.chassis_no || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Kilometers Run" value={vehicle?.kms_run || ''} fullWidth disabled />
                </Grid>
              </Grid>
            </Grid>
    
            {/* Battery Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Battery Details</Typography>
              <Divider sx={{ mb: 2 }} />
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
            </Grid>
    
            {/* Tyre Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Tyre Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Position</TableCell>
                      <TableCell>Make</TableCell>
                      <TableCell>Number</TableCell>
                      <TableCell>Condition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicle?.tyres?.map((tyre, index) => (
                      <TableRow key={index}>
                        <TableCell>{tyre.position}</TableCell>
                        <TableCell>{tyre.make}</TableCell>
                        <TableCell>{tyre.number}</TableCell>
                        <TableCell>{tyre.condition}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
    
            {/* Documents */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Documents & Accessories</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {Object.entries(vehicle?.documents || {}).map(([doc, available]) => (
                  <Grid item xs={12} md={4} key={doc}>
                    <FormControlLabel
                      control={<Checkbox checked={available} disabled />}
                      label={doc}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
    
            {/* Payment Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField label="Days Stayed" value={vehicle?.days_stayed || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Rate per Day" value={`₹${vehicle?.price_per_day || ''}`} fullWidth disabled />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Total Amount" value={`₹${vehicle?.total_amount || ''}`} fullWidth disabled />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Checkout Date" value={new Date(vehicle?.checkout_date).toLocaleDateString()} fullWidth disabled />
                </Grid>
              </Grid>
            </Grid>
                        {/* Images */}
        {vehicle?.images?.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Vehicle Images</Typography>
            <Divider sx={{ mb: 2 }} />
            <ImageList cols={3} gap={8} sx={{ maxHeight: 400 }}>
              {vehicle.images.map((img, index) => (
                <ImageListItem key={index}>
                  <img
                    src={`https://vehicle-parking-system.vercel.app${img}`}
                    alt={`Vehicle ${index + 1}`}
                    loading="lazy"
                    style={{ 
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Grid>
        )}
      </Grid>
    </DialogContent>
    <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
      <Button onClick={onClose}>Close</Button>
      <Button 
        variant="contained"
        startIcon={<Print />}
        onClick={() => printReceipt(vehicle)}
      >
        Print Receipt
      </Button>
    </DialogActions>
  </Dialog>
);

           

    

    // When using the PreviewDialog component:
    <PreviewDialog 
      vehicle={previewVehicle}
      open={openPreviewDialog}
      onClose={() => {
        setOpenPreviewDialog(false);
        setPreviewVehicle(null);
      }}
    />  // Add these styles at the top of your file
  

  // Continue with rest of the components...
  // I'll continue with the remaining code in the next part due to length limitations
  const fetchCheckedOutVehicles = async () => {
    try {
      const response = await fetch('https://vehicle-parking-system.vercel.app/api/vehicles/checked-out');
      const data = await response.json();
      setCheckedOutVehicles(data);
      setShowCheckedOutVehicles(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    const filtered = checkedOutVehicles.filter(vehicle => 
      vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, checkedOutVehicles]);
  

  const handlePayment = async () => {
    try {
      const checkoutData = {
        vehicle_id: vehicleDetails.id,
        vehicle_details: vehicleDetails,
        billing_details: billingDetails,
        checkout_date: billingDetails.checkoutDate,
        checkout_time: billingDetails.checkoutTime,
        days_stayed: billingDetails.daysStayed,
        price_per_day: billingDetails.ratePerDay,
        total_amount: billingDetails.totalAmount
      };

      const response = await fetch('https://vehicle-parking-system.vercel.app/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        setShowPaymentDialog(false);
        setShowSuccessDialog(true);
        printReceipt(checkoutData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const printReceipt = (vehicle) => {
    const printWindow = window.open('', '_blank');
    const vehicleDetails = typeof vehicle.vehicle_details === 'string' 
      ? JSON.parse(vehicle.vehicle_details) 
      : vehicle.vehicle_details;
  
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicle Receipt - ${vehicleDetails.registration_number}</title>
          <style>
          @page { 
            size: A4; 
            margin: 0.5cm;
            scale: 0.9;
          }
          body { 
            font-family: Arial, sans-serif; 
            padding: 10px;
            font-size: 10px;
            line-height: 1.2;
          }
          .header { 
            text-align: center;
            border-bottom: 1px solid #1976d2;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #1976d2;
            margin: 0;
          }
          .section {
            margin: 8px 0;
            padding: 5px;
          }
          .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 5px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
          }
          .info-item {
            margin-bottom: 4px;
          }
          .label {
            font-weight: bold;
            color: #666;
            font-size: 9px;
          }
          .value {
            font-size: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
            font-size: 9px;
          }
          .signature-section {
            margin-top: 10px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .signature-line {
            margin: 15px 0 5px;
            border-top: 1px solid #000;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 8px;
          }
        </style>
        </head>
        <body>
          <div class="header">
            <h1 class="company-name">Vehicle Parking Management System</h1>
            <p class="receipt-no">Receipt No: ${Date.now()}</p>
          </div>
  
          <div class="section">
            <div class="section-title">Vehicle Information</div>
            <div class="grid">
              <div class="info-item">
                <div class="label">Registration Number</div>
                <div class="value">${vehicleDetails.registration_number}</div>
              </div>
              <div class="info-item">
                <div class="label">Agreement Number</div>
                <div class="value">${vehicleDetails.agreement_no || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Financier Name</div>
                <div class="value">${vehicleDetails.financier_name || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Owner Name</div>
                <div class="value">${vehicleDetails.owner_name || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Vehicle Type</div>
                <div class="value">${vehicleDetails.vehicle_type || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Make & Model</div>
                <div class="value">${vehicleDetails.make} ${vehicleDetails.model || '-'}</div>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title">Technical Details</div>
            <div class="grid">
              <div class="info-item">
                <div class="label">Engine Number</div>
                <div class="value">${vehicleDetails.engine_no || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Chassis Number</div>
                <div class="value">${vehicleDetails.chassis_no || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Year</div>
                <div class="value">${vehicleDetails.year || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Kilometers Run</div>
                <div class="value">${vehicleDetails.kms_run || '-'}</div>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title">Battery Details</div>
            <div class="grid">
              <div class="info-item">
                <div class="label">Battery Make</div>
                <div class="value">${vehicleDetails.battery_make || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Battery Number</div>
                <div class="value">${vehicleDetails.battery_number || '-'}</div>
              </div>
              <div class="info-item">
                <div class="label">Battery Condition</div>
                <div class="value">${vehicleDetails.battery_condition || '-'}</div>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title">Tyre Details</div>
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Make</th>
                  <th>Number</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                ${vehicleDetails.tyres?.map(tyre => `
                  <tr>
                    <td>${tyre.position || '-'}</td>
                    <td>${tyre.make || '-'}</td>
                    <td>${tyre.number || '-'}</td>
                    <td>${tyre.condition || '-'}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
  
          <div class="section">
            <div class="section-title">Documents & Accessories</div>
            <div class="grid">
              ${Object.entries(vehicleDetails.documents || {}).map(([doc, available]) => `
                <div class="info-item">
                  <div class="label">${doc}</div>
                  <div class="value">${available ? '✓' : '✗'}</div>
                </div>
              `).join('')}
            </div>
          </div>
  
          <div class="payment-section">
            <div class="section-title">Payment Details</div>
            <div class="grid">
              <div class="info-item">
                <div class="label">Check-in Date</div>
                <div class="value">${new Date(vehicleDetails.in_date).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="label">Check-in Time</div>
                <div class="value">${vehicleDetails.in_time}</div>
              </div>
              <div class="info-item">
                <div class="label">Checkout Date</div>
                <div class="value">${new Date(vehicle.checkout_date).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="label">Checkout Time</div>
                <div class="value">${vehicle.checkout_time}</div>
              </div>
              <div class="info-item">
                <div class="label">Days Stayed</div>
                <div class="value">${vehicle.days_stayed}</div>
              </div>
              <div class="info-item">
                <div class="label">Rate per Day</div>
                <div class="value">₹${vehicle.price_per_day}</div>
              </div>
            </div>
            <div class="total-amount">
              Total Amount Paid: ₹${vehicle.total_amount}
            </div>
          </div>
  
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Vehicle Owner / Representative</p>
              <p>Name: _______________________</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Authorized Signatory</p>
              <p>Name: _______________________</p>
              <p>Designation: ________________</p>
            </div>
          </div>
  
          <div class="footer">
            <p>This is a computer generated receipt.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
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
  

  // Continue with the UI components...
  const PaymentDialog = () => (
    <Dialog 
      open={showPaymentDialog} 
      onClose={() => setShowPaymentDialog(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <PaymentIcon />
        Payment Details
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="h4" color="primary">
                  ₹{billingDetails?.totalAmount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {billingDetails?.daysStayed} days @ ₹{billingDetails?.ratePerDay}/day
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              defaultValue="cash"
              variant="outlined"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button 
          onClick={() => setShowPaymentDialog(false)}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handlePayment}
          startIcon={<PaymentIcon />}
        >
          Process Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  const SuccessDialog = () => (
    <Dialog 
      open={showSuccessDialog} 
      onClose={() => setShowSuccessDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Box sx={{ 
          textAlign: 'center', 
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <SuccessIcon sx={{ 
            fontSize: 60, 
            color: 'success.main',
            animation: 'bounce 1s infinite'
          }} />
          <Typography variant="h5" gutterBottom>
            Payment Successful
          </Typography>
          <Typography color="textSecondary">
            Vehicle checkout completed successfully
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button 
          onClick={() => setShowSuccessDialog(false)}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<ReceiptIcon />}
          onClick={() => printReceipt(vehicleDetails)}
        >
          Print Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
  return (
    <Box sx={styles.mainContainer}>
      <Box sx={styles.headerSection}>
        <Typography variant="h4">Vehicle Checkout</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={fetchCheckedOutVehicles}
          startIcon={<ReceiptIcon />}
        >
          View Checked Out Vehicles
        </Button>
      </Box>

      {showCheckedOutVehicles ? (
  <Box>
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => setShowCheckedOutVehicles(false)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2 }}>
          Checked Out Vehicles
        </Typography>
      </Box>
      <TextField
        placeholder="Search vehicles..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ width: 300 }}
      />
    </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Registration No</TableCell>
                  <TableCell>Owner Name</TableCell>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Checkout Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              
                
              <TableBody>
  {filteredVehicles.map((vehicle) => (
    <TableRow key={vehicle.id}>
      <TableCell>{vehicle.registration_number}</TableCell>
      <TableCell>{vehicle.owner_name}</TableCell>
      <TableCell>{vehicle.vehicle_type}</TableCell>
      <TableCell>{new Date(vehicle.checkout_date).toLocaleDateString()}</TableCell>
      <TableCell>₹{vehicle.total_amount}</TableCell>
      <TableCell align="center">
        <IconButton onClick={() => handleViewDetails(vehicle)}>
          <Visibility />
        </IconButton>
        <IconButton onClick={() => printReceipt(vehicle)}>
          <Print />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
  {filteredVehicles.length === 0 && (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No vehicles found matching your search
      </TableCell>
    </TableRow>
  )}
</TableBody>
</Table>
</TableContainer>
</Box>
) : (

        // Your existing search and vehicle details sections
        <Box>
          {/* Search Section */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Enter Vehicle Registration Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  error={!!error}
                  helperText={error}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ height: '56px' }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Paper>
    
          {/* Vehicle Details Section */}
          <Collapse in={!!vehicleDetails}>
            {vehicleDetails && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">
                          Registration Number
                        </Typography>
                        <Typography variant="h6">
                          {vehicleDetails.registration_number}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Add more vehicle detail cards */}
                </Grid>
    
                {/* Billing Details */}
                {billingDetails && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Billing Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                              Days Stayed
                            </Typography>
                            <Typography variant="h6">
                              {billingDetails.daysStayed}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                              Rate per Day
                            </Typography>
                            <Typography variant="h6">
                              ₹{billingDetails.ratePerDay}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                              Total Amount
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ₹{billingDetails.totalAmount}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                      <Button
                        variant="contained"
                        onClick={() => setShowPaymentDialog(true)}
                        startIcon={<PaymentIcon />}
                        size="large"
                      >
                        Proceed to Payment
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Collapse>
        </Box>
      )}

      <PaymentDialog />
      <SuccessDialog />
      <PreviewDialog 
        vehicle={previewVehicle}
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
      />
    </Box>
  );
  // Checked Out Vehicles Table Component


// Main return statement

}
// Export the component
export default Checkout;

