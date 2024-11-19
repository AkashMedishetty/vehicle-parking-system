import React from 'react';
import {
  Grid, Paper, FormControlLabel, Checkbox, Typography,
  useTheme, useMediaQuery, Box, Divider
} from '@mui/material';

const DocumentDetails = ({ formData, updateFormData, errors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDocumentChange = (documentKey) => (event) => {
    updateFormData({
      documents: {
        ...formData.documents,
        [documentKey]: event.target.checked
      }
    });
  };

  const documentSections = {
    documents: {
      title: 'Documents',
      items: {
        registrationCardBook: 'Registration Card/Book',
        tcBook: 'TC Book',
        insuranceCertificate: 'Insurance Certificate'
      }
    },
    reports: {
      title: 'Reports',
      items: {
        tyreReport: 'Tyre Report'
      }
    },
    accessories: {
      title: 'Accessories',
      items: {
        tarpaulin: 'Tarpaulin',
        toolKit: 'Tool Kit',
        radioStereo: 'Radio/Stereo',
        ropeRaasi: 'Rope/Raasi'
      }
    }
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
            Documents & Accessories
          </Typography>
          {errors.documents && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ mt: 1, mb: 2 }}
            >
              {errors.documents}
            </Typography>
          )}
        </Grid>

        {Object.entries(documentSections).map(([sectionKey, section], index) => (
          <Grid item xs={12} key={sectionKey}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}
            >
              {section.title}
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(section.items).map(([key, label]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: formData.documents[key] ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.documents[key]}
                          onChange={handleDocumentChange(key)}
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={
                        <Typography 
                          variant={isMobile ? "body2" : "body1"}
                          sx={{ fontWeight: formData.documents[key] ? 500 : 400 }}
                        >
                          {label}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default DocumentDetails;