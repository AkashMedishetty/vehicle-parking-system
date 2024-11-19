import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    FormControlLabel,
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper
} from '@mui/material';

const VehicleEntryForm = () => {
    const [formData, setFormData] = useState({
        agreementNo: '',
        financierName: '',
        ownerName: '',
        address: '',
        registrationNo: '',
        vehicleType: '',
        make: '',
        model: '',
        year: '',
        engineNo: '',
        chassisNo: '',
        kmsRun: '',
        entryDate: '',
        entryTime: '',
        entryPlace: '',
        documents: {
            registrationBook: false,
            tcBook: false,
            insurance: false,
            tyreReport: false,
            tarpaulin: false,
            toolKit: false,
            stereo: false,
            rope: false
        },
        batteryDetails: {
            make: '',
            number: ''
        },
        tyres: {
            frontLeft: { make: '', condition: 'good' },
            frontRight: { make: '', condition: 'good' },
            rearLeft: { make: '', condition: 'good' },
            rearRight: { make: '', condition: 'good' }
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        // API call to save data
    };

    return ( <
        Box sx = {
            { p: 3 } } >
        <
        Paper elevation = { 3 }
        sx = {
            { p: 3 } } >
        <
        Typography variant = "h4"
        gutterBottom >
        Vehicle Entry Form <
        /Typography>

        <
        form onSubmit = { handleSubmit } >
        <
        Grid container spacing = { 3 } > { /* Basic Information */ } <
        Grid item xs = { 12 }
        md = { 4 } >
        <
        TextField fullWidth label = "Agreement No"
        value = { formData.agreementNo }
        onChange = {
            (e) => setFormData({...formData, agreementNo: e.target.value }) }
        /> <
        /Grid> <
        Grid item xs = { 12 }
        md = { 4 } >
        <
        TextField fullWidth label = "Financier Name"
        value = { formData.financierName }
        onChange = {
            (e) => setFormData({...formData, financierName: e.target.value }) }
        /> <
        /Grid> <
        Grid item xs = { 12 }
        md = { 4 } >
        <
        TextField fullWidth label = "Owner Name"
        value = { formData.ownerName }
        onChange = {
            (e) => setFormData({...formData, ownerName: e.target.value }) }
        /> <
        /Grid>

        { /* Vehicle Details */ } <
        Grid item xs = { 12 } >
        <
        Typography variant = "h6"
        gutterBottom >
        Vehicle Details <
        /Typography> <
        /Grid>

        <
        Grid item xs = { 12 }
        md = { 6 } >
        <
        TextField fullWidth label = "Registration No"
        value = { formData.registrationNo }
        onChange = {
            (e) => setFormData({...formData, registrationNo: e.target.value }) }
        /> <
        /Grid>

        <
        Grid item xs = { 12 }
        md = { 6 } >
        <
        FormControl fullWidth >
        <
        InputLabel > Vehicle Type < /InputLabel> <
        Select value = { formData.vehicleType }
        onChange = {
            (e) => setFormData({...formData, vehicleType: e.target.value }) } >
        <
        MenuItem value = "car" > Car < /MenuItem> <
        MenuItem value = "truck" > Truck < /MenuItem> <
        MenuItem value = "bike" > Bike < /MenuItem> <
        /Select> <
        /FormControl> <
        /Grid>

        { /* Documents Section */ } <
        Grid item xs = { 12 } >
        <
        Typography variant = "h6"
        gutterBottom >
        Documents <
        /Typography> <
        /Grid>

        <
        Grid item xs = { 12 }
        md = { 4 } >
        <
        FormControlLabel control = { <
            Checkbox
            checked = { formData.documents.registrationBook }
            onChange = {
                (e) => setFormData({
                    ...formData,
                    documents: {
                        ...formData.documents,
                        registrationBook: e.target.checked
                    }
                })
            }
            />
        }
        label = "Registration Book" /
        >
        <
        /Grid>

        { /* Submit Button */ } <
        Grid item xs = { 12 } >
        <
        Button type = "submit"
        variant = "contained"
        color = "primary"
        size = "large" >
        Submit Entry <
        /Button> <
        /Grid> <
        /Grid> <
        /form> <
        /Paper> <
        /Box>
    );
};

export default VehicleEntryForm;