import React from 'react';
import { 
  Grid, Paper, Typography, IconButton, ImageList,
  ImageListItem, Box, TextField, useTheme,
  useMediaQuery, Button, Alert
} from '@mui/material';
import { PhotoCamera, Delete, AddAPhoto } from '@mui/icons-material';

const ImageUpload = ({ formData, updateFormData, errors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (formData.images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));

    updateFormData({
      images: [...formData.images, ...newImages]
    });
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = formData.images.filter(img => img.id !== imageId);
    updateFormData({ images: updatedImages });
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
            Vehicle Images
          </Typography>
          {errors.images && (
            <Alert 
              severity="error" 
              sx={{ mt: 1, mb: 2 }}
            >
              {errors.images}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3,
              border: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.default',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload-button"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload-button">
              <Box sx={{ textAlign: 'center' }}>
                <AddAPhoto 
                  sx={{ 
                    fontSize: isMobile ? 40 : 48,
                    color: 'primary.main',
                    mb: 1
                  }} 
                />
                <Typography variant={isMobile ? "body2" : "body1"}>
                  Click or drag images here
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                >
                  Maximum 10 images allowed
                </Typography>
              </Box>
            </label>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <ImageList 
            sx={{ 
              width: '100%',
              height: 'auto',
              maxHeight: 450
            }} 
            cols={isMobile ? 2 : 3} 
            rowHeight={164}
            gap={8}
          >
            {formData.images.map((image) => (
              <ImageListItem 
                key={image.id}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <img
                  src={image.preview || image.url}
                  alt="Vehicle"
                  loading="lazy"
                  style={{ 
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover'
                  }}
                />
                <IconButton
                  onClick={() => handleRemoveImage(image.id)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'white'
                    }
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  <Delete />
                </IconButton>
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Additional Details"
            multiline
            rows={isMobile ? 3 : 4}
            value={formData.additionalDetails}
            onChange={(e) => updateFormData({ additionalDetails: e.target.value })}
            fullWidth
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mt: 2,
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

export default ImageUpload;