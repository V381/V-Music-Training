const admin = require('../config/firebase-config');

const createUser = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const user = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    await admin.firestore().collection('users').doc(user.uid).set({
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'User created successfully', userId: user.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const updates = req.body;

    await admin.firestore().collection('users').doc(userId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile
};