const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: "Email or phoneNumber is required" });
    }

    try {
        // 1. Find all initial matches
        const [matches] = await pool.query(
            'SELECT * FROM Contact WHERE (email = ? AND email IS NOT NULL) OR (phoneNumber = ? AND phoneNumber IS NOT NULL)',
            [email || null, phoneNumber || null]
        );

        if (matches.length === 0) {
            // Rule A: Create new primary contact
            const [result] = await pool.query(
                'INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, ?)',
                [email || null, phoneNumber || null, null, 'primary']
            );

            return res.json({
                contact: {
                    primaryContactId: result.insertId,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: []
                }
            });
        }

        // 2. Identify all primary IDs from matches
        const primaryContactIdsSet = new Set();
        matches.forEach(c => {
            primaryContactIdsSet.add(c.linkPrecedence === 'primary' ? c.id : c.linkedId);
        });

        // Sort to find the absolute oldest root primary
        const primaryContactIds = Array.from(primaryContactIdsSet);
        const [allPotentialPrimaries] = await pool.query(
            'SELECT * FROM Contact WHERE id IN (?) ORDER BY createdAt ASC',
            [primaryContactIds]
        );

        const rootPrimary = allPotentialPrimaries[0];
        const otherPrimaries = allPotentialPrimaries.slice(1);

        // 3. Rule C: Merge clusters if needed
        for (const p of otherPrimaries) {
            await pool.query(
                'UPDATE Contact SET linkedId = ?, linkPrecedence = ? WHERE id = ? OR linkedId = ?',
                [rootPrimary.id, 'secondary', p.id, p.id]
            );
        }

        // 4. Rule B: Check if incoming info is new to the cluster
        // Fetch cluster members to check for existence
        const [existingCluster] = await pool.query(
            'SELECT * FROM Contact WHERE id = ? OR linkedId = ?',
            [rootPrimary.id, rootPrimary.id]
        );

        const emailInCluster = existingCluster.some(c => c.email === email);
        const phoneInCluster = existingCluster.some(c => c.phoneNumber === phoneNumber);

        if ((email && !emailInCluster) || (phoneNumber && !phoneInCluster)) {
            // Create a new secondary contact
            await pool.query(
                'INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, ?)',
                [email || null, phoneNumber || null, rootPrimary.id, 'secondary']
            );
        }

        // 5. Final Fetch: Get the latest full cluster for response
        const [finalCluster] = await pool.query(
            'SELECT * FROM Contact WHERE id = ? OR linkedId = ? ORDER BY createdAt ASC',
            [rootPrimary.id, rootPrimary.id]
        );

        const primaryContact = finalCluster.find(c => c.linkPrecedence === 'primary');

        // De-duplicate emails, primary first
        const emails = [...new Set([
            primaryContact.email,
            ...finalCluster.map(c => c.email)
        ])].filter(Boolean);

        // De-duplicate phone numbers, primary first
        const phoneNumbers = [...new Set([
            primaryContact.phoneNumber,
            ...finalCluster.map(c => c.phoneNumber)
        ])].filter(Boolean);

        const secondaryContactIds = finalCluster
            .filter(c => c.linkPrecedence === 'secondary')
            .map(c => c.id);

        res.json({
            contact: {
                primaryContactId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
