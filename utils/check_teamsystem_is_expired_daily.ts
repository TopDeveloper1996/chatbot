import UserDatabase from "~/server/src/db/user_db";
import axios from "axios";
const config = useRuntimeConfig();
export const verifyAllTeamSystemCredentials = async () => {

    let db = await UserDatabase.get();

  try {
    // Fetch all customer_ids from the credentials table
    const customer_ids = await db`
    SELECT DISTINCT customer_id 
    FROM credentials
    WHERE application_id = 7`;

    if (customer_ids.length <= 0) {
        throw new Error("No customer IDs found.");
    }

    let hasErrors = false;
    let serverDown = false;

    // Function to process each customer_id
    const verifyCustomer = async ({customer_id}: {customer_id: number}) => {
      const urlLink = await db`
      SELECT teamsystem_link 
      FROM customer_settings_1 
      WHERE customer_id = ${customer_id}`;

      if (urlLink.length <= 0) {
        console.error(
          `No TeamSystem link found for customer_id: ${customer_id}`
        );
        return; // Skip to the next customer_id if no TeamSystem link is found
      }

      const res = await db`
      SELECT username, password_1 
      FROM credentials 
      WHERE application_id = 7 
      AND customer_id = ${customer_id}`;

      if (res.length <= 0) {
        console.error(
          `User credentials not found for customer_id: ${customer_id}`
        );
        return; // Skip to the next customer_id if no credentials are found
      }

      const url = urlLink[0].teamsystem_link;

      // Use Promise.all to process all credentials in parallel for each customer
      const verificationPromises = res.map(
        async ({ username, password_1: password }) => {
          const postData = {
            ts_url: url,
            ts_username: username,
            ts_password: password,
          };

          try {
            const response = await axios.post(
              config.public.ts_verify_credential_url,
              postData
            );

            const isSuccess = response.data === "success";

            // Update the database with the verification result
            await db`
                UPDATE credentials 
                SET is_expired = ${!isSuccess}
                WHERE application_id = 7 
                AND customer_id = ${customer_id}
                AND username = ${username}
            `;
          } catch (ex: any) {
            if (ex.code === "ECONNREFUSED" || ex.code === "ENOTFOUND") {
              serverDown = true;
              throw new Error("Server is down");
            }
            hasErrors = true;
            console.error(
              `Verification failed for username: ${username} of customer_id: ${customer_id}`
            );
          }
        }
      );

      // Wait for all verifications to complete
      try {
        await Promise.all(verificationPromises);
      } catch (error) {
        console.error(
          `Verification failed for customer_id: ${customer_id} due to server issues`
        );
      }
    };

    // Run verification for all customer_ids in parallel
    await Promise.all(
      customer_ids.map(({ customer_id }) => verifyCustomer(customer_id))
    );

    // Handle the final results
    return {
        hasErrors,
        serverDown,
      };

  } catch (ex: any) {
    console.error("Error verifying credentials for all customers:", ex);
    throw ex;
  }
};
