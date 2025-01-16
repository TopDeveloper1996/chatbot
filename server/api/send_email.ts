import axios from 'axios';
const config = useRuntimeConfig();


export default defineEventHandler(async (event) => {
    const body = await readBody(event); // Read the request body (contains HTML content and recipient data)
  
    const { receiver, subject, htmlMessage, plainMessage } = body; // Destructure the request body
  
    try {
      const response = await axios.post(
        `https://api.eu.mailgun.net/v3/robot.mentally.ai/messages`,
        new URLSearchParams({
          from: 'Ade Mentally | Scraper Notification <robot@mentally.ai>',
          to: receiver,  // Convert receiver array to a comma-separated string
          cc: 'support@innodemia.com',
          subject: subject,
          text: plainMessage || htmlMessage,  // Fallback to HTML if no plain text provided
          html: htmlMessage,
        }),
        {
          auth: {
            username: 'api',
            password: config.MAILGUN_AUTH, // Store your Mailgun API key in an environment variable
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw createError({ statusCode: 500, statusMessage: 'Email sending failed' });
    }
  });