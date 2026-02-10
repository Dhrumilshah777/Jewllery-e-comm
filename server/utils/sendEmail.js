const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  // Use environment variables for configuration
  // For Gmail, you might need an App Password if 2FA is enabled
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: options.email, // List of receivers
    subject: options.subject, // Subject line
    text: options.message, // Plain text body
    html: options.html, // HTML body
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
