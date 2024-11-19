import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Backdrop,
  useTheme,
  useMediaQuery,
  Paper,
  MobileStepper,
  Alert
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

import BasicDetails from './Steps/BasicDetails';
import VehicleDetails from './Steps/VehicleDetails';
import DocumentDetails from './Steps/DocumentDetails';
import BatteryTyreDetails from './Steps/BatteryTyreDetails';
import ImageUpload from './Steps/ImageUpload';

const STEPS = [
  'Basic Info',
  'Vehicle Details',
  'Documents',
  'Battery & Tyres',
  'Images'
];

const INITIAL_FORM_STATE = {
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
  images: [],
  additionalDetails: ''
};

const VehicleEntryForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const updateFormData = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 0:
        ['agreementNo', 'financierName', 'ownerName', 'address'].forEach(field => {
          if (!formData[field]?.trim()) {
            stepErrors[field] = 'Required';
            isValid = false;
          }
        });
        break;
      case 1:
        ['registrationNumber', 'vehicleType', 'make', 'model', 'year', 'engineNo', 'chassisNo', 'kmsRun'].forEach(field => {
          if (!formData[field]?.trim()) {
            stepErrors[field] = 'Required';
            isValid = false;
          }
        });
        break;
      case 2:
        if (!Object.values(formData.documents).some(value => value)) {
          stepErrors.documents = 'Please select at least one document';
          isValid = false;
        }
        break;
      case 3:
        if (!formData.batteryMake?.trim() || !formData.batteryNumber?.trim()) {
          stepErrors.batteryMake = !formData.batteryMake?.trim() ? 'Required' : '';
          stepErrors.batteryNumber = !formData.batteryNumber?.trim() ? 'Required' : '';
          isValid = false;
        }
        formData.tyres.forEach((tyre, index) => {
          if (!tyre.make?.trim() || !tyre.number?.trim()) {
            stepErrors[`tyre${index}`] = 'All tyre details are required';
            isValid = false;
          }
        });
        break;
      case 4:
        if (formData.images.length === 0) {
          stepErrors.images = 'Please upload at least one image';
          isValid = false;
        }
        break;
      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const submitVehicleData = async () => {
    const vehicleData = {
      ...formData,
      inDate: formData.inDate || new Date().toISOString().split('T')[0],
      inTime: formData.inTime || new Date().toTimeString().split(' ')[0],
    };

    const response = await fetch('http://localhost:5000/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData)
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  };

  const uploadImages = async (vehicleId) => {
    const imageFormData = new FormData();
    formData.images.forEach(image => {
      if (image.file) imageFormData.append('images', image.file);
    });

    const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/images`, {
      method: 'POST',
      body: imageFormData
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  };

  const handleSubmitSuccess = () => {
    setFormData(INITIAL_FORM_STATE);
    setActiveStep(0);
    setErrors({});
    alert('Vehicle entry created successfully!');
  };

  const handleSubmitError = (error) => {
    setSubmitError(error.message);
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      handleSubmit(true);
    } else {
      alert(`Error creating vehicle entry: ${error.message}`);
    }
  };

  const handleSubmit = async (isRetry = false) => {
    if (!validateStep(activeStep)) return;

    if (isRetry) {
      setRetryCount(prev => prev + 1);
    } else {
      setRetryCount(0);
    }

    setIsSubmitting(true);
    setSubmitProgress(0);
    setSubmitError(null);

    try {
      setSubmitProgress(20);
      const vehicleResponse = await submitVehicleData();
      
      setSubmitProgress(50);
      if (formData.images.length > 0) {
        await uploadImages(vehicleResponse.vehicleId);
      }
      
      setSubmitProgress(100);
      handleSubmitSuccess();
    } catch (error) {
      handleSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    const props = { formData, updateFormData, errors };
    
    switch (step) {
      case 0: return <BasicDetails {...props} />;
      case 1: return <VehicleDetails {...props} />;
      case 2: return <DocumentDetails {...props} />;
      case 3: return <BatteryTyreDetails {...props} />;
      case 4: return <ImageUpload {...props} />;
      default: return null;
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1200, 
      margin: '0 auto', 
      p: isMobile ? 2 : 3 
    }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        {isMobile ? (
          <MobileStepper
            variant="dots"
            steps={STEPS.length}
            position="static"
            activeStep={activeStep}
            sx={{ flexGrow: 1, mb: 2 }}
            nextButton={
              <Button 
                size="small" 
                onClick={handleNext}
                disabled={activeStep === STEPS.length - 1}
              >
                Next
                <KeyboardArrowRight />
              </Button>
            }
            backButton={
              <Button 
                size="small" 
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
                Back
              </Button>
            }
          />
        ) : (
          <Stepper 
            activeStep={activeStep} 
            sx={{ mb: 4 }}
            alternativeLabel
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            {STEPS[activeStep]}
          </Typography>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === STEPS.length - 1 ? handleSubmit : handleNext}
            size={isMobile ? "small" : "medium"}
          >
            {activeStep === STEPS.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>

        <Backdrop 
          open={isSubmitting} 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress 
            variant="determinate" 
            value={submitProgress} 
            size={60} 
            color="inherit"
          />
          <Typography variant="h6">
            {`${Math.round(submitProgress)}%`}
          </Typography>
        </Backdrop>
      </Paper>
    </Box>
  );
};

export default VehicleEntryForm;
