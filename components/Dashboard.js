import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    IconButton
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Timeline as TimelineIcon,
    AttachMoney as MoneyIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const stats = {
        totalVehicles: 45,
        activeParking: 28,
        todayRevenue: 2500,
        monthlyRevenue: 45000
    };

    const StatCard = ({ title, value, icon }) => ( <
        Card sx = {
            { height: '100%' } } >
        <
        CardContent >
        <
        Box sx = {
            { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } } >
        <
        div >
        <
        Typography color = "textSecondary"
        gutterBottom > { title } <
        /Typography> <
        Typography variant = "h4" > { value } <
        /Typography> <
        /div> <
        IconButton color = "primary"
        sx = {
            { backgroundColor: 'rgba(25, 118, 210, 0.1)' } } > { icon } <
        /IconButton> <
        /Box> <
        /CardContent> <
        /Card>
    );

    return ( <
        Box sx = {
            { p: 3 } } >
        <
        Box sx = {
            { display: 'flex', justifyContent: 'space-between', mb: 3 } } >
        <
        Typography variant = "h4" >
        Dashboard <
        /Typography> <
        Button variant = "contained"
        startIcon = { < AddIcon / > }
        onClick = {
            () => navigate('/entry') } >
        New Vehicle Entry <
        /Button> <
        /Box>

        <
        Grid container spacing = { 3 } >
        <
        Grid item xs = { 12 }
        sm = { 6 }
        md = { 3 } >
        <
        StatCard title = "Total Vehicles"
        value = { stats.totalVehicles }
        icon = { < CarIcon / > }
        /> <
        /Grid> <
        Grid item xs = { 12 }
        sm = { 6 }
        md = { 3 } >
        <
        StatCard title = "Active Parking"
        value = { stats.activeParking }
        icon = { < TimelineIcon / > }
        /> <
        /Grid> <
        Grid item xs = { 12 }
        sm = { 6 }
        md = { 3 } >
        <
        StatCard title = "Today's Revenue"
        value = { `₹${stats.todayRevenue}` }
        icon = { < MoneyIcon / > }
        /> <
        /Grid> <
        Grid item xs = { 12 }
        sm = { 6 }
        md = { 3 } >
        <
        StatCard title = "Monthly Revenue"
        value = { `₹${stats.monthlyRevenue}` }
        icon = { < MoneyIcon / > }
        /> <
        /Grid>

        { /* Recent Entries Table */ } <
        Grid item xs = { 12 } >
        <
        Paper sx = {
            { p: 2 } } >
        <
        Typography variant = "h6"
        gutterBottom >
        Recent Entries <
        /Typography> { /* Add table component here */ } <
        /Paper> <
        /Grid> <
        /Grid> <
        /Box>
    );
};

export default Dashboard;