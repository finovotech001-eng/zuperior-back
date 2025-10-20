// zuperior-dashboard/server/src/controllers/auth.controller.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

/**
 * Handles the registration (signup) of a new user.
 */
export const register = async (req, res) => {
    const { name, email, password, country } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all required fields: name, email, and password.' });
    }

    try {
        // 2. Check if user already exists
        const existingUser = await prisma.User.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save the new user to the database
        const newUser = await prisma.User.create({
            data: {
                name,
                email,
                password: hashedPassword,
                country,
                // clientId is often set by the database or a custom service
                // For simplicity here, let the database default handle it or assume it's auto-incremented.
            },
            // Select fields to return
            select: { id: true, clientId: true, name: true, email: true },
        });

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: newUser.id, clientId: newUser.clientId },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 6. Send success response
        res.status(201).json({
            token,
            clientId: newUser.clientId,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

/**
 * Handles the login (sign in) of an existing user.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // 2. Find the user by email
        const user = await prisma.User.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: user.id, clientId: user.clientId },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. Send success response
        res.status(200).json({
            token,
            clientId: user.clientId,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};