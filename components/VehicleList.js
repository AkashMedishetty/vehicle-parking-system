import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Typography,
    TextField,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch vehicles data
        fetchVehicles();
    }, []);

    const fetchVehicles = () => {
        // API call to get vehicles
        // Placeholder data
        const dummyData = [{
                id: 1,
                registrationNo: 'ABC123',
                ownerName: 'John Doe',
                vehicleType: 'Car',
                entryDate: '2024-11-06',
                status: 'Parked'
            },
            // Add more dummy data as needed
        ];
        setVehicles(dummyData);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return ( <
        Box sx = {
            { p: 3 } } >
        <
        Typography variant = "h4"
        gutterBottom >
        Vehicle List <
        /Typography>

        <
        Box sx = {
            { mb: 3, display: 'flex', alignItems: 'center' } } >
        <
        TextField label = "Search Vehicles"
        variant = "outlined"
        value = { searchTerm }
        onChange = { handleSearch }
        sx = {
            { mr: 2 } }
        /> <
        IconButton color = "primary" >
        <
        SearchIcon / >
        <
        /IconButton> <
        /Box>

        <
        TableContainer component = { Paper } >
        <
        Table >
        <
        TableHead >
        <
        TableRow >
        <
        TableCell > Registration No < /TableCell> <
        TableCell > Owner Name < /TableCell> <
        TableCell > Vehicle Type < /TableCell> <
        TableCell > Entry Date < /TableCell> <
        TableCell > Status < /TableCell> <
        TableCell > Actions < /TableCell> <
        /TableRow> <
        /TableHead> <
        TableBody > {
            filteredVehicles.map((vehicle) => ( <
                TableRow key = { vehicle.id } >
                <
                TableCell > { vehicle.registrationNo } < /TableCell> <
                TableCell > { vehicle.ownerName } < /TableCell> <
                TableCell > { vehicle.vehicleType } < /TableCell> <
                TableCell > { vehicle.entryDate } < /TableCell> <
                TableCell > { vehicle.status } < /TableCell> <
                TableCell >
                <
                IconButton color = "primary" >
                <
                EditIcon / >
                <
                /IconButton> <
                IconButton color = "error" >
                <
                DeleteIcon / >
                <
                /IconButton> <
                /TableCell> <
                /TableRow>
            ))
        } <
        /TableBody> <
        /Table> <
        /TableContainer> <
        /Box>
    );
};

export default VehicleList;