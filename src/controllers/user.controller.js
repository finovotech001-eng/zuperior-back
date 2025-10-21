import { getUserByEmail } from '../services/db.service.js';

export const getUser = async (req, res) => {
  try {
    const { request, email, access_token } = req.body;

    console.log('GetUser request:', { request, email, hasToken: !!access_token });

    if (request !== 'GetUserDetailsByEmail') {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid request type'
      });
    }

    if (!email || !access_token) {
      return res.status(400).json({
        status: 'Error',
        message: 'Email and access token are required'
      });
    }

    // Get user from database
    const userData = await getUserByEmail(email);

    if (!userData) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    // Return in the format expected by frontend
    return res.status(200).json({
      status: 'Success',
      data: [userData]
    });

  } catch (error) {
    console.error('Error in getUser:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};