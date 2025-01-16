import { defineEventHandler } from "h3";
import UserDatabase from "~/server/src/db/user_db";
import { error, success } from "~/server/src/response";
import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    // Extract customer_id from request body
    const body = await readBody(event);
    const customer_id = body.customer_id;

    if (!customer_id) {
      return error(event, 422, "Invalid request, customer_id is required");
    }

    // Fetch the username and password_1 for the given customer_id and application_id = 7
    let db = await UserDatabase.get();
    let verificationResults = [];

    const res =
      await db`SELECT username, is_expired FROM credentials WHERE application_id = 7 AND customer_id = ${customer_id}`;

    if (res.length <= 0) {
      return error(event, 404, "User credentials not found");
    }

    for (const r of res) {
      const { username, is_expired } = r;
      verificationResults.push({
        username,
        is_expired,
      });
    }

    return success(event, 200, {
      message: "All verifications successful",
      results: verificationResults,
    });

  } catch (ex: any) {
    if (ex.code === 'ECONNREFUSED' || ex.code === 'ENOTFOUND') {
      return error(event, 503, "Service Unavailable. The server is currently unable to handle the request.");
    }
    console.log(ex);
    return error(event, 500, "Internal server error");
  }
});
