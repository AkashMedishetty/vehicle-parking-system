import React from 'react';
import {
  Grid, Paper, TextField, Typography, RadioGroup,
  FormControlLabel, Radio, useTheme, useMediaQuery,
  Box, Divider
} from '@mui/material';

const TyreInput = ({ position, tyre, onChange, isMobile }) => (
  <Box
    sx={{
      p: isMobile ? 2 : 3,
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      mb: 2,
      bgcolor: 'background.default'
    }}
  >
    <Typography 
      variant={isMobile ? "subtitle2" : "subtitle1"} 
      sx={{ 
        mb: 2,
        fontWeight: 500,
        color: 'primary.main'
      }}
    >
      {position}
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Make"
          value={tyre.make}
          onChange={(e) => onChange(position, 'make', e.target.value)}
          size={isMobile ? "small" : "medium"}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Number"
          value={tyre.number}
          onChange={(e) => onChange(position, 'number', e.target.value)}
          size={isMobile ? "small" : "medium"}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />
      </Grid>
      <Grid item xs={12}>
        <RadioGroup
          row
          value={tyre.condition}
          onChange={(e) => onChange(position, 'condition', e.target.value)}
        >
          {['Good', 'Average', 'Bad'].map((condition) => (
            <FormControlLabel
              key={condition}
              value={condition.toLowerCase()}
              control={
                <Radio 
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    '&.Mui-checked': {
                      color: condition === 'Good' ? 'success.main' :
                             condition === 'Average' ? 'warning.main' :
                             'error.main'
                    }
                  }}
                />
              }
              label={
                <Typography variant={isMobile ? "body2" : "body1"}>
                  {condition}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </Grid>
    </Grid>
  </Box>
);

const BatteryTyreDetails = ({ formData, updateFormData, errors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBatteryChange = (field) => (event) => {
    updateFormData({ [field]: event.target.value });
  };

  const handleTyreChange = (position, field, value) => {
    const updatedTyres = formData.tyres.map(tyre =>
      tyre.position === position ? { ...tyre, [field]: value } : tyre
    );
    updateFormData({ tyres: updatedTyres });
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
        {/* Battery Details Section */}
        <Grid item xs={12}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            Battery Details
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: isMobile ? 2 : 3,
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              mb: 3,
              bgcolor: 'background.default'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Battery Make"
                  value={formData.batteryMake}
                  onChange={handleBatteryChange('batteryMake')}
                  error={!!errors.batteryMake}
                  helperText={errors.batteryMake}
                  size={isMobile ? "small" : "medium"}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Battery Number"
                  value={formData.batteryNumber}
                  onChange={handleBatteryChange('batteryNumber')}
                  error={!!errors.batteryNumber}
                  helperText={errors.batteryNumber}
                  size={isMobile ? "small" : "medium"}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RadioGroup
                  row
                  value={formData.batteryCondition}
                  onChange={handleBatteryChange('batteryCondition')}
                >
                  {['Good', 'Average', 'Bad'].map((condition) => (
                    <FormControlLabel
                      key={condition}
                      value={condition.toLowerCase()}
                      control={
                        <Radio 
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            '&.Mui-checked': {
                              color: condition === 'Good' ? 'success.main' :
                                     condition === 'Average' ? 'warning.main' :
                                     'error.main'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant={isMobile ? "body2" : "body1"}>
                          {condition}
                        </Typography>
                      }
                    />
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Tyre Details Section */}
        <Grid item xs={12}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ 
              mt: 2,
              mb: 3,
              fontWeight: 500
            }}
          >
            Tyre Details
          </Typography>
        </Grid>

        <Grid item xs={12}>
          {formData.tyres.map((tyre) => (
            <TyreInput
              key={tyre.position}
              position={tyre.position}
              tyre={tyre}
              onChange={handleTyreChange}
              isMobile={isMobile}
            />
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BatteryTyreDetails;