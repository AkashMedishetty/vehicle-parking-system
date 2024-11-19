import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import {
  Typography,
  TextField,
  Grid,
  Paper,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ImageList,
  ImageListItem
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const steps = ['Basic Information', 'Vehicle Details', 'Documents & Accessories', 'Tyre & Battery Details', 'Vehicle Images'];

const TyreConditionInput = ({ position, formData, setFormData }) => {
  const handleConditionChange = (value) => {
    const updatedTyres = formData.tyres.map(tyre =>
      tyre.position === position ? { ...tyre, condition: value } : tyre
    );
    setFormData({ ...formData, tyres: updatedTyres });
  };

  const handleMakeChange = (event) => {
    const updatedTyres = formData.tyres.map(tyre =>
      tyre.position === position ? { ...tyre, make: event.target.value } : tyre
    );
    setFormData({ ...formData, tyres: updatedTyres });
  };

  const handleNumberChange = (event) => {
    const updatedTyres = formData.tyres.map(tyre =>
      tyre.position === position ? { ...tyre, number: event.target.value } : tyre
    );
    setFormData({ ...formData, tyres: updatedTyres });
  };

  const tyre = formData.tyres.find(t => t.position === position);

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12}>
        <Typography variant="subtitle1">{position}</Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Make"
          value={tyre.make}
          onChange={handleMakeChange}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Number"
          value={tyre.number}
          onChange={handleNumberChange}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <RadioGroup
          row
          value={tyre.condition}
          onChange={(e) => handleConditionChange(e.target.value)}
        >
          <FormControlLabel value="good" control={<Radio />} label="Good" />
          <FormControlLabel value="average" control={<Radio />} label="Average" />
          <FormControlLabel value="bad" control={<Radio />} label="Bad" />
        </RadioGroup>
      </Grid>
    </Grid>
  );
};

const VehicleEntryForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    agreementNo: '',
    financierName: '',
    ownerName: '',
    address: '',
    registrationNumber: '',
    vehicleType: '',
    make: '',
    model: '',
    year: '',
    engineNo: '',
    chassisNo: '',
    kmsRun: '',
    inDate: '',
    inTime: '',
    inPlace: '',
    documents: {
      registrationCardBook: false,
      tcBook: false,
      insuranceCertificate: false,
      tyreReport: false,
      tarpaulin: false,
      toolKit: false,
      radioStereo: false,
      ropeRaasi: false
    },
    batteryMake: '',
    batteryNumber: '',
    batteryCondition: 'good',
    tyres: [
      { position: 'Front Left', make: '', number: '', condition: 'good' },
      { position: 'Front Right', make: '', number: '', condition: 'good' },
      { position: 'Rear Left', make: '', number: '', condition: 'good' },
      { position: 'Rear Right', make: '', number: '', condition: 'good' },
      { position: 'Stepney', make: '', number: '', condition: 'good' }
    ],
    images: []
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: event.target.value
    }));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        // Basic Details validation
        const basicFields = ['agreementNo', 'financierName', 'ownerName', 'address'];
        const missingBasicFields = basicFields.filter(field => !formData[field] || formData[field].trim() === '');
        if (missingBasicFields.length > 0) {
          alert('Please fill all basic details');
          return false;
        }
        return true;

      case 1:
        // Vehicle Details validation
        const vehicleFields = ['registrationNumber', 'vehicleType', 'make', 'model', 'year', 'engineNo', 'chassisNo', 'kmsRun'];
        const missingVehicleFields = vehicleFields.filter(field => !formData[field] || formData[field].trim() === '');
        if (missingVehicleFields.length > 0) {
          alert('Please fill all vehicle details');
          return false;
        }
        return true;

      case 2:
        // Documents validation
        const hasDocuments = Object.values(formData.documents).some(value => value === true);
        if (!hasDocuments) {
          alert('Please select at least one document');
          return false;
        }
        return true;

      case 3:
        // Battery and Tyre validation
        if (!formData.batteryMake || !formData.batteryNumber) {
          alert('Please fill battery details');
          return false;
        }
        const invalidTyres = formData.tyres.filter(tyre => !tyre.make || !tyre.number);
        if (invalidTyres.length > 0) {
          alert('Please fill all tyre details');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            id: Date.now() + Math.random(),
            url: reader.result,
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const BasicDetails = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Agreement Number"
            value={formData.agreementNo}
            onChange={handleInputChange('agreementNo')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Financier Name"
            value={formData.financierName}
            onChange={handleInputChange('financierName')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Owner Name"
            value={formData.ownerName}
            onChange={handleInputChange('ownerName')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Address"
            value={formData.address}
            onChange={handleInputChange('address')}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const VehicleDetails = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Vehicle Details</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Registration Number"
            value={formData.registrationNumber}
            onChange={handleInputChange('registrationNumber')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Vehicle Type"
            value={formData.vehicleType}
            onChange={handleInputChange('vehicleType')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Make"
            value={formData.make}
            onChange={handleInputChange('make')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Model"
            value={formData.model}
            onChange={handleInputChange('model')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Year"
            value={formData.year}
            onChange={handleInputChange('year')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Engine Number"
            value={formData.engineNo}
            onChange={handleInputChange('engineNo')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Chassis Number"
            value={formData.chassisNo}
            onChange={handleInputChange('chassisNo')}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Kilometers Run"
            value={formData.kmsRun}
            onChange={handleInputChange('kmsRun')}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const DocumentDetails = () => (
    <Grid container spacing={2}>
      {Object.entries(formData.documents).map(([key, value]) => (
        <Grid item xs={12} md={6} key={key}>
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onChange={(e) => setFormData({
                  ...formData,
                  documents: {
                    ...formData.documents,
                    [key]: e.target.checked
                  }
                })}
              />
            }
            label={key.replace(/([A-Z])/g, ' $1').trim()}
          />
        </Grid>
      ))}
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BasicDetails />;
      case 1:
        return <VehicleDetails />;
      default:
        return 'Unknown step';
    }
  };
  const BatteryTyreDetails = () => (
    <Grid container spacing={2}>
      {/* Battery Details */}
      <Grid item xs={12}>
        <Typography variant="h6">Battery Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Battery Make"
              value={formData.batteryMake}
              onChange={handleInputChange('batteryMake')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Battery Number"
              value={formData.batteryNumber}
              onChange={handleInputChange('batteryNumber')}
            />
          </Grid>
        </Grid>
      </Grid>
      {/* Tyre Details */}
      <Grid item xs={12}>
        <Typography variant="h6">Tyre Details</Typography>
        {formData.tyres.map((tyre) => (
          <TyreConditionInput
            key={tyre.position}
            position={tyre.position}
            formData={formData}
            setFormData={setFormData}
          />
        ))}
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Basic Information</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agreement Number"
                  value={formData.agreementNo}
                  onChange={(e) => setFormData(prev => ({...prev, agreementNo: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Financier Name"
                  value={formData.financierName}
                  onChange={(e) => setFormData(prev => ({...prev, financierName: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({...prev, ownerName: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        );
      case 1:
        return (
          <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Vehicle Details</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({...prev, registrationNumber: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vehicle Type"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData(prev => ({...prev, vehicleType: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({...prev, make: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        );
      default:
        return 'Unknown step';
    }
  };
  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      
        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VehicleEntryForm;

const handleSubmit = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success && formData.images.length > 0) {
      const imageFormData = new FormData();
      formData.images.forEach(image => {
        if (image.file) {
          imageFormData.append('images', image.file);
        }
      });

      const imageResponse = await fetch(`http://localhost:5000/api/vehicles/${data.vehicleId}/images`, {
        method: 'POST',
        body: imageFormData
      });

      const imageData = await imageResponse.json();
      console.log('Images uploaded:', imageData);
    }

    alert('Vehicle entry created successfully!');
    setActiveStep(0);
    // Reset form data
    setFormData({/* Initial form state */});
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Error creating vehicle entry');
  }
};