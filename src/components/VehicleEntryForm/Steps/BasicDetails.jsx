import React from 'react';
import { Grid, Paper, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';

const BasicDetails = ({ formData, updateFormData, errors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (field) => (event) => {
    updateFormData({ [field]: event.target.value });
  };

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
            Basic Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Agreement Number"
            value={formData.agreementNo}
            onChange={handleChange('agreementNo')}
            error={!!errors.agreementNo}
            helperText={errors.agreementNo}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Financier Name"
            value={formData.financierName}
            onChange={handleChange('financierName')}
            error={!!errors.financierName}
            helperText={errors.financierName}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Owner Name"
            value={formData.ownerName}
            onChange={handleChange('ownerName')}
            error={!!errors.ownerName}
            helperText={errors.ownerName}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            multiline
            rows={isMobile ? 3 : 4}
            label="Address"
            value={formData.address}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BasicDetails;