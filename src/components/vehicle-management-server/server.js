const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./config/database');
const fs = require('fs');
const crypto = require('crypto');

const hashPassword = (password) => {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
};



const app = express();
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
     console.log(`API endpoint: https://${process.env.RENDER_EXTERNAL_URL || 'localhost:' + port}/api/vehicles`);
  });

// Middleware setup
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

// Request logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Uploads configuration
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Export for Vercel
module.exports = app;

app.use('/uploads', express.static('uploads'));

// Main GET endpoint for vehicles
app.get('/api/vehicles', async(req, res) => {
    try {
        const connection = await db.getConnection();
        const [vehicles] = await connection.query(`
            SELECT 
                v.*,
                GROUP_CONCAT(DISTINCT vi.image_url) as images,
                GROUP_CONCAT(DISTINCT td.position, ':', td.make, ':', td.number, ':', td.condition_status) as tyres,
                GROUP_CONCAT(DISTINCT d.doc_type, ':', d.is_available) as documents,
                bd.make as battery_make,
                bd.number as battery_number,
                bd.condition_status as battery_condition
            FROM vehicles v
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
            LEFT JOIN tyre_details td ON v.id = td.vehicle_id
            LEFT JOIN documents d ON v.id = d.vehicle_id
            LEFT JOIN battery_details bd ON v.id = bd.vehicle_id
            WHERE v.id NOT IN (SELECT vehicle_id FROM checkouts)
            GROUP BY v.id
            ORDER BY v.created_at DESC
        `);

        const formattedVehicles = vehicles.map(vehicle => ({
            ...vehicle,
            images: vehicle.images ? vehicle.images.split(',') : [],
            tyres: vehicle.tyres ? vehicle.tyres.split(',').map(tyre => {
                const [position, make, number, condition] = tyre.split(':');
                return { position, make, number, condition };
            }) : [],
            documents: vehicle.documents ? Object.fromEntries(
                vehicle.documents.split(',').map(doc => {
                    const [type, available] = doc.split(':');
                    return [type, available === '1'];
                })
            ) : {}
        }));

        connection.release();
        res.json(formattedVehicles);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

// Add new endpoint for checked out vehicles
app.get('/api/vehicles/checked-out', async(req, res) => {
    try {
        const connection = await db.getConnection();
        const [checkedOutVehicles] = await connection.query(`
            SELECT c.*, v.registration_number, v.owner_name, v.vehicle_type,
        v.in_place
            FROM checkouts c
            JOIN vehicles v ON c.vehicle_id = v.id
            ORDER BY c.checkout_date DESC, c.checkout_time DESC
        `);

        connection.release();
        res.json(checkedOutVehicles);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Failed to fetch checked out vehicles' });
    }
});

// Vehicle Types endpoints
app.get('/api/settings/vehicle-types', async(req, res) => {
    try {
        const [types] = await db.query('SELECT * FROM vehicle_types ORDER BY name');
        res.json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/settings/vehicle-types', async(req, res) => {
    try {
        const { name } = req.body;
        const [result] = await db.query('INSERT INTO vehicle_types (name) VALUES (?)', [name]);
        res.status(201).json({
            success: true,
            message: 'Vehicle type added successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/settings/vehicle-types/:id', async(req, res) => {
    const connection = await db.getConnection();
    const typeId = req.params.id;

    try {
        await connection.beginTransaction();

        // Get vehicle type details
        const [type] = await connection.query('SELECT name FROM vehicle_types WHERE id = ?', [typeId]);
        const typeName = type[0].name;

        // Delete all related data in sequence
        // 1. Delete pricing data
        await connection.query('DELETE FROM location_vehicle_prices WHERE vehicle_type_id = ?', [typeId]);

        // 2. Delete vehicle images
        const [vehicles] = await connection.query('SELECT id FROM vehicles WHERE vehicle_type = ?', [typeName]);
        const vehicleIds = vehicles.map(v => v.id);

        if (vehicleIds.length > 0) {
            await connection.query('DELETE FROM vehicle_images WHERE vehicle_id IN (?)', [vehicleIds]);
            await connection.query('DELETE FROM tyre_details WHERE vehicle_id IN (?)', [vehicleIds]);
            await connection.query('DELETE FROM battery_details WHERE vehicle_id IN (?)', [vehicleIds]);
            await connection.query('DELETE FROM documents WHERE vehicle_id IN (?)', [vehicleIds]);
        }

        // 3. Delete vehicles of this type
        await connection.query('DELETE FROM vehicles WHERE vehicle_type = ?', [typeName]);

        // 4. Finally delete the vehicle type
        await connection.query('DELETE FROM vehicle_types WHERE id = ?', [typeId]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Vehicle type and all related data deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete operation failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle type and related data',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Locations endpoints
app.get('/api/settings/locations', async(req, res) => {
    try {
        const connection = await db.getConnection();
        const [locations] = await connection.query(`
            SELECT 
                l.*,
                COUNT(v.id) as current_vehicles,
                ROUND((COUNT(v.id) / l.capacity) * 100) as occupancy
            FROM locations l
            LEFT JOIN vehicles v ON v.in_place = l.name AND v.status = 'active'
            GROUP BY l.id
        `);

        connection.release();
        res.json({ success: true, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add this endpoint to handle location stats
app.get('/api/locations/:id/stats', async(req, res) => {
    try {
        const connection = await db.getConnection();
        const locationId = req.params.id;
        const showCheckedOut = req.query.showCheckedOut === 'true';

        // Get location details
        const [location] = await connection.query(
            'SELECT name FROM locations WHERE id = ?', [locationId]
        );

        if (!location.length) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const locationName = location[0].name;
        const statusCondition = showCheckedOut ? "status = 'checked_out'" : "status = 'active'";

        // Get vehicles with dues calculation
        const [vehicles] = await connection.query(`
            SELECT 
                v.*,
                DATEDIFF(CURRENT_DATE, v.in_date) as duration,
                CASE 
                    WHEN v.status = 'active' THEN
                        DATEDIFF(CURRENT_DATE, v.in_date) * 
                        COALESCE((
                            SELECT price 
                            FROM location_vehicle_prices lvp
                            JOIN vehicle_types vt ON vt.id = lvp.vehicle_type_id
                            WHERE lvp.location_id = ? 
                            AND vt.name = v.vehicle_type
                        ), 0)
                    ELSE 0
                END as dues
            FROM vehicles v
            WHERE v.in_place = ?
            AND ${statusCondition}
        `, [locationId, locationName]);

        // Calculate stats
        const stats = {
            activeVehicles: vehicles.filter(v => v.status === 'active').length,
            todayRevenue: await calculateTodayRevenue(connection, locationName),
            totalDues: vehicles.reduce((sum, v) => sum + Number(v.dues || 0), 0),
            occupancyRate: calculateOccupancyRate(vehicles.length, location[0].capacity),
            vehicles: vehicles.map(formatVehicleData)
        };

        connection.release();
        res.json(stats);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching location statistics' });
    }
});

// Helper functions
const calculateTodayRevenue = async(connection, locationName) => {
    const today = new Date().toISOString().split('T')[0];
    const [revenue] = await connection.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM checkouts c
        JOIN vehicles v ON c.vehicle_id = v.id
        WHERE DATE(checkout_date) = ?
        AND v.in_place = ?
    `, [today, locationName]);
    return revenue[0].total;
};

const calculateOccupancyRate = (activeCount, capacity) => {
    return Math.round((activeCount / capacity) * 100);
};

const formatVehicleData = (vehicle) => ({
    id: vehicle.id,
    registrationNumber: vehicle.registration_number,
    type: vehicle.vehicle_type,
    ownerName: vehicle.owner_name,
    entryDate: new Date(vehicle.in_date).toLocaleDateString(),
    duration: `${vehicle.duration} days`,
    status: vehicle.status,
    dues: vehicle.dues || 0
});
app.post('/api/settings/locations', async(req, res) => {
    const connection = await db.getConnection();
    console.log('Received location data:', req.body); // Log incoming data for debugging

    try {
        const { name, address, capacity } = req.body;

        // Ensure all required fields are present
        if (!name || !address || !capacity) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const [result] = await connection.query(
            'INSERT INTO locations (name, address, capacity) VALUES (?, ?, ?)', [name, address, capacity]
        );

        const newLocation = {
            id: result.insertId,
            name,
            address,
            capacity
        };

        connection.release();
        res.status(201).json({
            success: true,
            data: newLocation,
            message: 'Location added successfully'
        });
    } catch (error) {
        connection.release();
        console.error('Location creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create location',
            error: error.message
        });
    }
});
app.delete('/api/settings/locations/:id', async(req, res) => {
    const connection = await db.getConnection();
    const locationId = req.params.id;

    try {
        await connection.beginTransaction();

        // Get location name
        const [location] = await connection.query('SELECT name FROM locations WHERE id = ?', [locationId]);
        const locationName = location[0].name;

        // Delete pricing data
        await connection.query('DELETE FROM location_vehicle_prices WHERE location_id = ?', [locationId]);

        // Delete vehicles at this location
        await connection.query('DELETE FROM vehicles WHERE in_place = ?', [locationName]);

        // Delete the location
        await connection.query('DELETE FROM locations WHERE id = ?', [locationId]);

        await connection.commit();
        res.json({
            success: true,
            message: 'Location and all associated data deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// Database connection test
db.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API endpoint: http://localhost:${port}/api/vehicles`);
});
app.post('/api/settings/prices', async(req, res) => {
    console.log('Request body:', req.body);
    try {
        const { prices } = req.body;

        // Validate incoming prices data
        if (!prices || !Array.isArray(prices)) {
            return res.status(400).json({ success: false, message: 'Invalid prices data' });
        }

        // Log the incoming prices data for debugging
        console.log('Received prices data:', prices);

        // Delete existing prices (if necessary) and insert new prices
        await db.query('DELETE FROM location_vehicle_prices');

        const values = prices.map(p => [p.locationId, p.vehicleTypeId, p.price]);
        await db.query(
            'INSERT INTO location_vehicle_prices (location_id, vehicle_type_id, price) VALUES ?', [values]
        );

        res.json({ success: true, message: 'Prices updated successfully' });
    } catch (error) {
        console.error('Error updating prices:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
app.put('/api/settings/locations/:id', async(req, res) => {
    const connection = await db.getConnection();
    try {
        const { name, address, capacity } = req.body;
        const locationId = req.params.id;

        // Update location details
        await connection.query(
            'UPDATE locations SET name = ?, address = ?, capacity = ? WHERE id = ?', [name, address, capacity, locationId]
        );

        // Get updated location
        const [updatedLocation] = await connection.query(
            'SELECT * FROM locations WHERE id = ?', [locationId]
        );

        connection.release();
        res.json({
            success: true,
            message: 'Location updated successfully',
            data: updatedLocation[0]
        });
    } catch (error) {
        connection.release();
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update location',
            error: error.message
        });
    }
});

app.get('/api/settings/prices', async(req, res) => {

    try {
        const [prices] = await db.query('SELECT * FROM location_vehicle_prices');
        res.json({ success: true, data: prices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
app.get('/api/checkouts/status/:id', async(req, res) => {
    try {
        const [result] = await db.query(
            'SELECT * FROM checkouts WHERE vehicle_id = ?', [req.params.id]
        );
        res.json({
            isCheckedOut: result.length > 0,
            checkoutDetails: result[0] || null
        });
    } catch (error) {
        res.json({ isCheckedOut: false });
    }
});


app.get('/api/vehicles/:id', async(req, res) => {
    try {
        const connection = await db.getConnection();
        const [vehicle] = await connection.query(`
            SELECT 
                v.*,
                GROUP_CONCAT(DISTINCT vi.image_url) as images,
                GROUP_CONCAT(DISTINCT td.position, ':', td.make, ':', td.number, ':', td.condition_status) as tyres,
                GROUP_CONCAT(DISTINCT d.doc_type, ':', d.is_available) as documents,
                bd.make as battery_make,
                bd.number as battery_number,
                bd.condition_status as battery_condition
            FROM vehicles v
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
            LEFT JOIN tyre_details td ON v.id = td.vehicle_id
            LEFT JOIN documents d ON v.id = d.vehicle_id
            LEFT JOIN battery_details bd ON v.id = bd.vehicle_id
            WHERE v.id = ?
            GROUP BY v.id, vi.image_url
        `, [req.params.id]);

        if (!vehicle[0]) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Get images separately to avoid GROUP_CONCAT limitations
        const [images] = await connection.query(
            'SELECT image_url FROM vehicle_images WHERE vehicle_id = ?', [req.params.id]
        );

        const formattedVehicle = {
            ...vehicle[0],
            images: images.map(img => img.image_url),
            tyres: vehicle[0].tyres ? vehicle[0].tyres.split(',').map(tyre => {
                const [position, make, number, condition] = tyre.split(':');
                return { position, make, number, condition };
            }) : [],
            documents: vehicle[0].documents ? Object.fromEntries(
                vehicle[0].documents.split(',').map(doc => {
                    const [type, available] = doc.split(':');
                    return [type, available === '1'];
                })
            ) : {}
        };

        connection.release();
        res.json(formattedVehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ message: 'Error fetching vehicle details' });
    }
});

app.post('/api/vehicles', async(req, res) => {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const [vehicleResult] = await connection.query(
                'INSERT INTO vehicles SET ?', {
                    agreement_no: req.body.agreementNo,
                    financier_name: req.body.financierName,
                    owner_name: req.body.ownerName,
                    address: req.body.address,
                    registration_number: req.body.registrationNumber,
                    vehicle_type: req.body.vehicleType,
                    make: req.body.make,
                    model: req.body.model,
                    year: req.body.year,
                    engine_no: req.body.engineNo,
                    chassis_no: req.body.chassisNo,
                    kms_run: req.body.kmsRun,
                    in_date: req.body.inDate,
                    in_time: req.body.inTime,
                    in_place: req.body.inPlace,
                    additional_details: req.body.additionalDetails
                }
            );

            const vehicleId = vehicleResult.insertId;

            const documentEntries = Object.entries(req.body.documents).map(([key, value]) => [
                vehicleId,
                key,
                value
            ]);

            await connection.query(
                'INSERT INTO documents (vehicle_id, doc_type, is_available) VALUES ?', [documentEntries]
            );

            await connection.query(
                'INSERT INTO battery_details SET ?', {
                    vehicle_id: vehicleId,
                    make: req.body.batteryMake,
                    number: req.body.batteryNumber,
                    condition_status: req.body.batteryCondition
                }
            );

            const tyreEntries = req.body.tyres.map(tyre => [
                vehicleId,
                tyre.position,
                tyre.make,
                tyre.number,
                tyre.condition
            ]);

            await connection.query(
                'INSERT INTO tyre_details (vehicle_id, position, make, number, condition_status) VALUES ?', [tyreEntries]
            );

            await connection.commit();
            connection.release();

            res.status(201).json({
                success: true,
                message: 'Vehicle entry created successfully',
                vehicleId
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error creating vehicle entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating vehicle entry',
            error: error.message
        });
    }
});
// Delete endpoint
app.delete('/api/vehicles/:id', async(req, res) => {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query('DELETE FROM documents WHERE vehicle_id = ?', [req.params.id]);
            await connection.query('DELETE FROM battery_details WHERE vehicle_id = ?', [req.params.id]);
            await connection.query('DELETE FROM tyre_details WHERE vehicle_id = ?', [req.params.id]);
            await connection.query('DELETE FROM vehicle_images WHERE vehicle_id = ?', [req.params.id]);
            await connection.query('DELETE FROM vehicles WHERE id = ?', [req.params.id]);

            await connection.commit();
            connection.release();
            res.json({ success: true, message: 'Vehicle deleted successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


app.put('/api/vehicles/:id', async(req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        const vehicleId = req.params.id;

        // Update vehicles table
        const vehicleQuery = 'UPDATE vehicles SET ? WHERE id = ?';
        const { battery_details, tyres, documents, ...vehicleData } = req.body;
        await connection.query(vehicleQuery, [vehicleData, vehicleId]);

        // Update battery details
        const batteryQuery = 'UPDATE battery_details SET ? WHERE vehicle_id = ?';
        await connection.query(batteryQuery, [battery_details, vehicleId]);

        // Update tyre details
        if (tyres && tyres.length) {
            await connection.query('DELETE FROM tyre_details WHERE vehicle_id = ?', [vehicleId]);
            const tyreValues = tyres.map(t => [
                vehicleId,
                t.position,
                t.make,
                t.number,
                t.condition
            ]);
            await connection.query(
                'INSERT INTO tyre_details (vehicle_id, position, make, number, condition_status) VALUES ?', [tyreValues]
            );
        }

        // Update documents
        if (documents && documents.length) {
            await connection.query('DELETE FROM documents WHERE vehicle_id = ?', [vehicleId]);
            const documentValues = documents.map(d => [
                vehicleId,
                d.doc_type,
                d.is_available
            ]);
            await connection.query(
                'INSERT INTO documents (vehicle_id, doc_type, is_available) VALUES ?', [documentValues]
            );
        }

        await connection.commit();
        res.json({ success: true });

    } catch (error) {
        await connection.rollback();
        console.error('Update error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// Add these new endpoints to your server.js

// Search vehicle by registration number
app.get('/api/vehicles/search/:regNo', async(req, res) => {
    const connection = await db.getConnection();

    try {
        const [vehicles] = await connection.query(`
        SELECT * FROM vehicles 
        WHERE registration_number = ?
      `, [req.params.regNo]);

        if (vehicles.length === 0) {
            res.json({ success: true, vehicle: null });
            return;
        }

        const vehicle = vehicles[0];
        const vehicleId = vehicle.id;

        // Get battery details
        const [batteryDetails] = await connection.query(
            'SELECT * FROM battery_details WHERE vehicle_id = ?', [vehicleId]
        );

        // Get tyre details
        const [tyreDetails] = await connection.query(
            'SELECT * FROM tyre_details WHERE vehicle_id = ?', [vehicleId]
        );

        // Get document details
        const [documents] = await connection.query(
            'SELECT * FROM documents WHERE vehicle_id = ?', [vehicleId]
        );

        const formattedVehicle = {
            ...vehicle,
            battery_details: batteryDetails[0] || null,
            tyres: tyreDetails,
            documents: documents.reduce((acc, doc) => {
                acc[doc.doc_type] = doc.is_available === 1;
                return acc;
            }, {})
        };

        res.json({ success: true, vehicle: formattedVehicle });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// Create checkouts table

// Process checkout
app.post('/api/checkouts', async(req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Store complete vehicle and billing details
        await connection.query('INSERT INTO checkouts SET ?', {
            vehicle_id: req.body.vehicle_id,
            vehicle_details: JSON.stringify(req.body.vehicle_details),
            billing_details: JSON.stringify(req.body.billing_details),
            checkout_date: req.body.checkout_date,
            checkout_time: req.body.checkout_time,
            days_stayed: req.body.days_stayed,
            price_per_day: req.body.price_per_day,
            total_amount: req.body.total_amount
        });

        // Update vehicle status using the correct column name
        await connection.query(
            'UPDATE vehicles SET status = "checked_out" WHERE id = ?', [req.body.vehicle_id]
        );

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/settings/prices/:vehicleType/:location', async(req, res) => {
    const connection = await db.getConnection();


    try {
        const [prices] = await connection.query(`
      SELECT lvp.price 
      FROM location_vehicle_prices lvp
      JOIN vehicle_types vt ON lvp.vehicle_type_id = vt.id
      JOIN locations l ON lvp.location_id = l.id
      WHERE vt.name = ? AND l.name = ?
    `, [req.params.vehicleType, req.params.location]);

        if (prices.length > 0) {
            res.json({ price: prices[0].price });
        } else {
            res.json({ price: 0 });
        }
    } catch (error) {
        console.error('Price fetch error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// Image upload endpoint
app.post('/api/vehicles/:id/images', upload.array('images', 10), async(req, res) => {
    try {
        const vehicleId = req.params.id;
        const files = req.files;

        const imageEntries = files.map(file => [
            vehicleId,
            `/uploads/${file.filename}`,
            file.originalname
        ]);

        await db.query(
            'INSERT INTO vehicle_images (vehicle_id, image_url, image_name) VALUES ?', [imageEntries]
        );

        res.status(201).json({
            success: true,
            message: 'Images uploaded successfully',
            files: files.map(f => f.filename)
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
});


app.get('/api/settings/users', async(req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, role FROM users'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST new user
app.post('/api/settings/users', async(req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = hashPassword(password);

        const [result] = await db.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]
        );

        res.json({
            success: true,
            message: 'User created successfully',
            data: {
                id: result.insertId,
                username,
                role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE user
app.delete('/api/settings/users/:id', async(req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


app.post('/api/auth/login', async(req, res) => {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);

    try {
        const [users] = await db.query(
            'SELECT id, username, role FROM users WHERE username = ? AND password = ?', [username, hashedPassword]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        res.json({
            success: true,
            user,
            token: 'session-token' // You can implement proper JWT tokens here
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


app.get('/api/locations/vehicle-counts', async(req, res) => {
    try {
        const [locations] = await db.query('SELECT * FROM locations');
        const [vehicles] = await db.query('SELECT in_place FROM vehicles WHERE status = "parked"');

        const locationCounts = locations.map(location => {
            const currentVehicles = vehicles.filter(v => v.in_place === location.name).length;
            return {
                ...location,
                current_vehicles: currentVehicles
            };
        });

        res.json({ success: true, data: locationCounts });
    } catch (error) {
        console.error('Error getting vehicle counts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
