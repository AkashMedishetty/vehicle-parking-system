app.post('/api/settings/users', async(req, res) => {
    try {
        const { username, password, role } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
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