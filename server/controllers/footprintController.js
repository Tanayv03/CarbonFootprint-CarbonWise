import { db } from '../config/firebase.js';

// Save a new footprint entry
export const saveFootprint = async (req, res) => {
  try {
    const { userId, inputs, scores } = req.body;

    if (!userId || !inputs || !scores) {
      return res.status(400).json({ error: 'userId, inputs, and scores are required.' });
    }

    if (!db) {
      return res.status(503).json({ error: 'Firestore is not configured.' });
    }

    const timestamp = new Date().toISOString();
    const month = new Date().toLocaleString('default', { month: 'short' });
    const year = new Date().getFullYear();

    const record = {
      inputs,
      scores,
      timestamp,
      month,
      year
    };

    // Store under the user's specific sub-collection
    await db.collection('users').doc(userId).collection('footprints').add(record);

    res.status(201).json({ message: 'Footprint saved successfully.', record });
  } catch (error) {
    console.error("Error saving footprint:", error);
    res.status(500).json({ error: 'Failed to save footprint data.' });
  }
};

// Fetch historical footprint data
export const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    if (!db) {
      return res.status(503).json({ error: 'Firestore is not configured.' });
    }

    // Fetch the 12 most recent footprint records for this user
    const snapshot = await db.collection('users').doc(userId).collection('footprints')
      .orderBy('timestamp', 'desc')
      .limit(12)
      .get();

    if (snapshot.empty) {
      return res.json({ history: [] });
    }

    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Return in chronological order
    res.json({ history: history.reverse() });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: 'Failed to fetch historical data.' });
  }
};
