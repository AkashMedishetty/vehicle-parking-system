import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Box,
  Divider,
  Button,
  IconButton,
  Chip
} from '@mui/material'
import {
  Print as PrintIcon,
  DirectionsCar as CarIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Description as DescriptionIcon
} from '@mui/icons-material'

const VehicleDetailsDialog = ({ open, onClose, vehicle }) => {
  const DetailSection = ({ icon, title, children }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      {children}
    </Box>
  )

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Vehicle Details</Typography>
        <Box>
          <IconButton onClick={() => window.print()}>
            <PrintIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DetailSection icon={<CarIcon color="primary" />} title="Vehicle Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Registration Number</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.regNo}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Make & Model</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.make} {vehicle?.model}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Vehicle Type</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.vehicleType}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Engine Number</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.engineNo}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Chassis Number</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.chassisNo}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Chip 
                label={vehicle?.status}
                color={vehicle?.status === 'active' ? 'success' : 'default'}
              />
            </Grid>
          </Grid>
        </DetailSection>

        <DetailSection icon={<PersonIcon color="primary" />} title="Owner Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Owner Name</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.ownerName}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Contact Number</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.contactNo}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Address</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.address}</Typography>
            </Grid>
          </Grid>
        </DetailSection>

        <DetailSection icon={<TimerIcon color="primary" />} title="Parking Details">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Entry Date & Time</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.entryTime}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Parking Location</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.parkingSpot}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
              <Typography variant="body1" gutterBottom>{vehicle?.duration}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Rate Applied</Typography>
              <Typography variant="body1" gutterBottom>₹{vehicle?.rate}/day</Typography>
            </Grid>
          </Grid>
        </DetailSection>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button variant="contained" color="primary" startIcon={<PrintIcon />}>
            Print Details
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleDetailsDialog
