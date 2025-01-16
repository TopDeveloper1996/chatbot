import axios, { isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
import UserDatabase from "../../src/db/user_db";

async function addContact(
  event: H3Event<EventHandlerRequest>,
  contactModels: any[]
): Promise<Object> {
  let addedContacts = [];
  if (contactModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const contact of contactModels) {
    console.log(
      `posting add contact, model: ${JSON.stringify(contact, undefined, "  ")}`
    );
    try {
      let result = await axios.post(
        "https://ade.mentally.ai/api/v1/crawler/notification-contacts/",
        contact,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${scraperApiToken}`,
          },
        }
      );
      addedContacts.push(result.data);
    } catch (ex: any) {
      console.error(`error adding contact: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while adding ");
  }

  return success(event, 201, { contacts: addedContacts });
}

async function updateContact(
  event: H3Event<EventHandlerRequest>,
  contactModels: any[]
): Promise<Object> {
  if (contactModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const contact of contactModels) {
    const user_id = contact._user_id;
    delete contact._user_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/notification-contacts/${user_id}/`;

    console.log(
      `update contact, model: ${JSON.stringify(contact, undefined, "  ")}`
    );
    try {
      await axios.patch(ur, contact, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`error updating contact: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while updating ");
  }
  return success(event, 201, body);
}

async function deleteContact(
  event: H3Event<EventHandlerRequest>,
  _user_id: string
): Promise<Object> {
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;

  try {
    await axios.delete(
      `https://ade.mentally.ai/api/v1/crawler/notification-contacts/${_user_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      }
    );
  } catch (ex: any) {
    console.error(`error deleting contact: ${ex}`);
    hasError = true;
  }

  if (hasError) {
    return error(event, 400, "one or more error occured while deleting ");
  }
  return success(event, 201, body);
}

async function addEntratelProfile(
  event: H3Event<EventHandlerRequest>,
  entratelModels: any[]
): Promise<Object> {
  let addedEntratelProfiles = [];

  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const entratel of entratelModels) {
    console.log(
      `posting add Entratel Profile, model: ${JSON.stringify(
        entratel,
        undefined,
        "  "
      )}`
    );
    try {
      let result = await axios.post(
        "https://ade.mentally.ai/api/v1/crawler/profile-entratel/",
        entratel,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${scraperApiToken}`,
          },
        }
      );
      addedEntratelProfiles.push(result.data);
    } catch (ex: any) {
      console.error(`error adding Entratel Profile: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while adding ");
  }

  return success(event, 201, { entratelprofile: addedEntratelProfiles });
}

async function updateEntratelProfile(
  event: H3Event<EventHandlerRequest>,
  entratelModels: any[]
): Promise<Object> {
  if (entratelModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const entratel of entratelModels) {
    const profile_id = entratel._profile_id;
    delete entratel._profile_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/profile-entratel/${profile_id}/`;

    console.log(
      `UPDATING Entratel Profile Info, model: ${JSON.stringify(
        entratel,
        undefined,
        "  "
      )}`
    );
    try {
      await axios.patch(ur, entratel, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`Error Occured While Updating Entratel Profile: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while updating ");
  }
  return success(event, 201, body);
}

async function deleteEntratelProfile(
  event: H3Event<EventHandlerRequest>,
  _profile_id: string
): Promise<Object> {
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  // const customer = getQuery(event).customer_id?.toString();
  try {
    await axios.delete(
      `https://ade.mentally.ai/api/v1/crawler/profile-entratel/${_profile_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      }
    );
  } catch (ex: any) {
    console.error(
      `Error Occured While Deleting Entratel Profile Information: ${ex}`
    );
    hasError = true;
  }

  if (hasError) {
    return error(event, 400, "one or more error occured while deleting ");
  }
  return success(event, 201, body);
}

async function updateAutoPassword(
  event: H3Event<EventHandlerRequest>,
  autoPasswordModels: any[]
): Promise<Object> {
  if (autoPasswordModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const auto_password of autoPasswordModels) {
    const setting_id = auto_password._settings_id;
    delete auto_password._settings_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/auto-password-change/${setting_id}/`;

    console.log(
      `UPDATING Auto Password Info, model: ${JSON.stringify(
        auto_password,
        undefined,
        "  "
      )}`
    );
    try {
      await axios.patch(ur, auto_password, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`ERROR: UPDATING Auto Password Info: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(
      event,
      400,
      "One or More ERROR Occured While UPDATING Auto Password Info "
    );
  }
  return success(event, 201, body);
}

async function updateTeamsystem(
  event: H3Event<EventHandlerRequest>,
  teamsystemModels: any[]
): Promise<Object> {
  console.log(teamsystemModels);

  if (teamsystemModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const teamsystem of teamsystemModels) {
    const credentials_id = teamsystem._credentials_id;
    delete teamsystem._credentials_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/team-system/${credentials_id}/`;

    console.log(
      `update Teamsystem Credential, model: ${JSON.stringify(
        teamsystem,
        undefined,
        "  "
      )}`
    );
    try {
        let result = await axios.patch(ur, teamsystem, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`error updating Teamsystem Credential: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while updating ");
  }
  return success(event, 201, body);
}

async function addTeamsystem(
  event: H3Event<EventHandlerRequest>,
  teamsystemModels: any[]
): Promise<Object> {
  let addedTeamsystems = [];
  if (teamsystemModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  console.log("========>addTeamsystem_event.body:",body)
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const teamsystem of teamsystemModels) {
    console.log(
      `posting add Teamsystem, model: ${JSON.stringify(
        teamsystem,
        undefined,
        "  "
      )}`
    );
    const endpoint =
      teamsystem.application_id == 8 ? "team-system-digital" : "team-system";

    try {
      let result = await axios.post(
        `https://ade.mentally.ai/api/v1/crawler/${endpoint}/`,
        teamsystem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${scraperApiToken}`,
          },
        }
      );
     addedTeamsystems.push(result.data);
     console.log(result.data);
    } catch (ex: any) {
      console.error(`error adding Teamsystem: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while adding ");
  }

  return success(event, 201, { teamsystem: addedTeamsystems });
}

async function deleteTeamsystem(
  event: H3Event<EventHandlerRequest>,
  _credentials_id: string
): Promise<Object> {
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;

  try {
    await axios.delete(
      `https://ade.mentally.ai/api/v1/crawler/team-system/${_credentials_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      }
    );
  } catch (ex: any) {
    console.error(`error deleting Teamsystem credential information: ${ex}`);
    hasError = true;
  }

  if (hasError) {
    return error(event, 400, "one or more error occured while deleting ");
  }
  return success(event, 201, body);
}

async function updateTeamsystemDigital(
  event: H3Event<EventHandlerRequest>,
  teamsystemDigitalModels: any[]
): Promise<Object> {
  if (teamsystemDigitalModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const teamsystem_digital of teamsystemDigitalModels) {
    const credentials_id = teamsystem_digital._credentials_id;
    delete teamsystem_digital._credentials_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/team-system-digital/${credentials_id}/`;

    console.log(
      `update Teamsystem Digital Credential, model: ${JSON.stringify(
        teamsystem_digital,
        undefined,
        "  "
      )}`
    );
    try {
      await axios.patch(ur, teamsystem_digital, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`error updating Teamsystem Digital Credentials: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while updating ");
  }
  return success(event, 201, body);
}

async function deleteTeamsystemDigital(
  event: H3Event<EventHandlerRequest>,
  _credentials_id: string
): Promise<Object> {
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;

  try {
    await axios.delete(
      `https://ade.mentally.ai/api/v1/crawler/team-system-digital/${_credentials_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      }
    );
  } catch (ex: any) {
    console.error(`error deleting Teamsystem Digital Credentials: ${ex}`);
    hasError = true;
  }

  if (hasError) {
    return error(event, 400, "one or more error occured while deleting ");
  }
  return success(event, 201, body);
}

async function updateTeamsystemWebsite(
  event: H3Event<EventHandlerRequest>,
  teamsystemWebsiteModels: any[]
): Promise<Object> {
  if (teamsystemWebsiteModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const teamsystem_website of teamsystemWebsiteModels) {
    const settings_id = teamsystem_website._settings_id;
    delete teamsystem_website._settings_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/team-system-links/${settings_id}/`;

    console.log(
      `update Teamsystem Digital Credential, model: ${JSON.stringify(
        teamsystem_website,
        undefined,
        "  "
      )}`
    );
    try {
      await axios.patch(ur, teamsystem_website, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`error updating Teamsystem Digital Credentials: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while updating ");
  }
  return success(event, 201, body);
}

async function updateTeamsystemDigitalWebsite(
  event: H3Event<EventHandlerRequest>,
  teamsystemDigitalWebsiteModels: any[]
): Promise<Object> {
  if (teamsystemDigitalWebsiteModels.length <= 0)
    return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const teamsystem_digital_website of teamsystemDigitalWebsiteModels) {
    const settings_id = teamsystem_digital_website._settings_id;
    delete teamsystem_digital_website._settings_id;
    const ur = `https://ade.mentally.ai/api/v1/crawler/team-system-links/${settings_id}/`;

    console.log(
      `update Teamsystem Digital Credential, model: ${JSON.stringify(
        teamsystem_digital_website,
        undefined,
        "  "
      )}`
    );
    try {
      await axios.patch(ur, teamsystem_digital_website, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`error updating Teamsystem Digital Credentials: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while updating ");
  }
  return success(event, 201, body);
}

async function addAnalyticsContact(
  event: H3Event<EventHandlerRequest>,
  analyticsContactModels: any[]
): Promise<Object> {
  const addedAnalyticsContacts: string[] = [];
  let hasError = false;
  let analytics_contacts;
  for (const analytics_contact of analyticsContactModels) {
    analytics_contacts = analytics_contact;

    try {
      const sql = await UserDatabase.get();

      // Retrieve the current value of gmail_looker_board for the specified customer_id
      const currentSettings = await sql`
                SELECT gmail_looker_board 
                FROM customer_settings_1 
                WHERE customer_id = ${analytics_contacts.customer_id}
                `;

      let newValue = analytics_contacts.gmail_looker_board;

      if (currentSettings.length > 0) {
        const currentValue = currentSettings[0].gmail_looker_board;
        if (currentValue) {
          // Concatenate the new value with a semicolon if the current value exists
          newValue = `${currentValue};${analytics_contacts.gmail_looker_board}`;
        }
      }

      // Update the gmail_looker_board column with the new value
      const result = await sql`
                UPDATE customer_settings_1
                SET gmail_looker_board = ${newValue}
                WHERE customer_id = ${analytics_contacts.customer_id}
                RETURNING *; 
                `;

      if (result.count > 0) {
        let contact_analytic = result[0].gmail_looker_board.split(";");
        let lastContact = contact_analytic[contact_analytic.length - 1];
        addedAnalyticsContacts.push(lastContact);
      } else {
        hasError = true;
      }
    } catch (err) {
      hasError = true;
      console.error("Error updating customer setting:", err);
    }
  }

  if (hasError) {
    return error(
      event,
      400,
      "One or More ERROR Occured While Adding Analytics Contact"
    );
  }

  return success(event, 201, { analytics_contact: addedAnalyticsContacts });
}

async function updateAnalyticsContact(
  event: H3Event<EventHandlerRequest>,
  analyticsContactModels: any[]
): Promise<Object> {
  if (analyticsContactModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const analytics_contact of analyticsContactModels) {
    const settings_id = analytics_contact._settings_id;

    delete analytics_contact._settings_id;
    const ur = `http://ade.mentally.ai/api/v1/crawler/cpa-settings/${settings_id}/`;

    console.log(
      `UPDATING Analytics Contact Info, model: ${JSON.stringify(
        analytics_contact,
        undefined,
        "  "
      )}`
    );
    try {
      await axios.patch(ur, analytics_contact, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      });
    } catch (ex: any) {
      console.error(`ERROR Occured While Updating Analytics Contact: ${ex}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(
      event,
      400,
      "One or More ERROR Occured While Updating Analytics Contact"
    );
  }
  return success(event, 201, body);
}

async function deleteAnalyticsContact(
  event: H3Event<EventHandlerRequest>,
  _settings_id: string
): Promise<Object> {
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;

  try {
    await axios.delete(
      `https://ade.mentally.ai/api/v1/crawler/notification-contacts/${_settings_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scraperApiToken}`,
        },
      }
    );
  } catch (ex: any) {
    console.error(`error deleting contact: ${ex}`);
    hasError = true;
  }

  if (hasError) {
    return error(event, 400, "one or more error occured while deleting ");
  }
  return success(event, 201, body);
}

// Helper function to fetch updated data
async function fetchUpdatedData(event: H3Event<EventHandlerRequest>) {
  const customer = getQuery(event).customer_id?.toString();

  const sql = await UserDatabase.get();

  let result: any = { accesses: <any>{} };
  result.customer_id = customer;

  const users =
    await sql`SELECT * FROM customer_user WHERE customer_id = ${customer!}`;
  result.contacts = users;
  const entratels =
    await sql`SELECT * FROM credentials JOIN enabled_profiles ON credentials.enabled_profile_id = enabled_profiles._profile_id WHERE credentials.customer_id = ${customer!} AND credentials.application_id = 5`;
  const appointingsubjects =
    await sql`SELECT e._profile_id, e.customer_id, e.codice_entratel, e.enabled_profile_type, ap.id as appointing_subject_id, ap.enabled_profile_id, ap.fiscal_code FROM enabled_profiles e JOIN appointing_subjects ap ON e._profile_id = ap.enabled_profile_id WHERE e.is_deleted = false AND ap.is_deleted = false AND e.customer_id = ${customer!}`;
  const setting_stat =
    await sql`SELECT * FROM setting_am WHERE is_deleted = false`;
  result.appointingsubject = appointingsubjects;
  result.entratel = entratels;
  result.entrateladdstatus = true;
  result.entrateleditstatus = false;
  result.entrateldeletestatus = false;

  const contact_notification_setting_status = setting_stat.filter(
    (a) => a.setting_number == 1
  );
  const profile_entratel_setting_status = setting_stat.filter(
    (a) => a.setting_number == 2
  );
  const intermediary_setting_status = setting_stat.filter(
    (a) => a.setting_number == 3
  );
  const profile_client_setting_status = setting_stat.filter(
    (a) => a.setting_number == 4
  );
  const auto_password_setting_status = setting_stat.filter(
    (a) => a.setting_number == 5
  );
  const teamsystem_setting_status = setting_stat.filter(
    (a) => a.setting_number == 6
  );
  const teamsystem_digital_setting_status = setting_stat.filter(
    (a) => a.setting_number == 7
  );
  const teamsystem_websites_setting_status = setting_stat.filter(
    (a) => a.setting_number == 8
  );
  const analytics_notification_setting_status = setting_stat.filter(
    (a) => a.setting_number == 9
  );
  // const add_activated = "add_activated";
  result.profile_entranet_add_activated =
    profile_entratel_setting_status[0].add_activated;
  result.profile_entranet_edit_activated =
    profile_entratel_setting_status[0].edit_activated;
  result.profile_entranet_delete_activated =
    profile_entratel_setting_status[0].delete_activated;

  result.teamsystem_add_activated = teamsystem_setting_status[0].add_activated;
  result.teamsystem_edit_activated =
    teamsystem_setting_status[0].edit_activated;
  result.teamsystem_delete_activated =
    teamsystem_setting_status[0].delete_activated;

  result.teamsystem_digital_add_activated =
    teamsystem_digital_setting_status[0].add_activated;
  result.teamsystem_digital_edit_activated =
    teamsystem_digital_setting_status[0].edit_activated;
  result.teamsystem_digital_delete_activated =
    teamsystem_digital_setting_status[0].delete_activated;

  result.teamsystem_websites_add_activated =
    teamsystem_websites_setting_status[0].add_activated;
  result.teamsystem_websites_edit_activated =
    teamsystem_websites_setting_status[0].edit_activated;
  result.teamsystem_websites_delete_activated =
    teamsystem_websites_setting_status[0].delete_activated;

  result.contact_notification_add_activated =
    contact_notification_setting_status[0].add_activated;
  result.contact_notification_edit_activated =
    contact_notification_setting_status[0].edit_activated;
  result.contact_notification_delete_activated =
    contact_notification_setting_status[0].delete_activated;

  result.analytics_add_activated =
    analytics_notification_setting_status[0].add_activated;
  result.analytics_edit_activated =
    analytics_notification_setting_status[0].edit_activated;
  result.analytics_delete_activated =
    analytics_notification_setting_status[0].delete_activated;

  const accesses = await sql`SELECT * FROM credentials WHERE customer_id = ${customer!} AND application_id IN (7, 8)`;
  const web =
    await sql`SELECT * FROM customer_settings_1 WHERE customer_id = ${customer!}`;
  result.auto_password = web[0].is_auto_password_change_enabled_for_tax_agency;
  result.accesses.teamsystem = accesses.filter((a) => a.application_id == "7");
result.accesses.teamsystem_digital = accesses.filter((a) => a.application_id == "8");
  result.accesses.teamsystem_websites = web;
  // const contact_analytic = web[0].gmail_looker_board.split(";");
  let contact_analytic;
  let setting_id;
  let contact_analytic_all;
  if (web[0] && web[0].gmail_looker_board) {
    contact_analytic = web[0].gmail_looker_board.split(";");
    setting_id = web[0]._settings_id;
    contact_analytic_all = web[0].gmail_looker_board;
  } else {
    contact_analytic = []; // or any default value you want to use
    setting_id = "-";
    contact_analytic_all = "";
  }
  result.contact_analytics = contact_analytic;
  result.contact_analytics_settings_id = setting_id;
  result.contact_analytics_all = contact_analytic_all;

  return result;
}

export default defineEventHandler(async (event) => {
  let sql = await UserDatabase.get();
  const params = getQuery(event);
  const customer = params.customer_id?.toString();
  try {
    if (event.method === "GET") {
      const updatedData = await fetchUpdatedData(event);
      return success(event, 200, updatedData);
    } else if (event.method === "POST") {
      const model = await readBody(event);

      const operation = model.operation;
      switch (operation) {
        case "add_contact":
          return await addContact(event, model.contact);
        case "update_contact":
          return await updateContact(event, model.contact);
        case "delete_contact":
          return await deleteContact(event, model.contact._user_id);
        case "add_entratel_profile":
          return await addEntratelProfile(event, model.entratel);
        case "update_entratel_profile":
          return await updateEntratelProfile(event, model.entratel);
        case "delete_entratel_profile":
          return await deleteEntratelProfile(event, model.entratel._profile_id);
        case "update_auto_password":
          return await updateAutoPassword(event, model.auto_password);
        case "create_teamsystem":
          return await addTeamsystem(event, model.teamsystem);
        case "update_teamsystem":
          return await updateTeamsystem(event, model.teamsystem);
        case "delete_teamsystem":
          return await deleteTeamsystem(
            event,
            model.teamsystem._credentials_id
          );
        case "update_teamsystem_digital":
          return await updateTeamsystemDigital(event, model.teamsystem_digital);
        case "delete_teamsystem_digital":
          return await deleteTeamsystemDigital(
            event,
            model.teamsystem_digital._credentials_id
          );
        case "update_teamsystem_website":
          return await updateTeamsystemWebsite(event, model.teamsystem_website);
        case "update_teamsystem_digital_website":
          return await updateTeamsystemDigitalWebsite(
            event,
            model.teamsystem_digital_website
          );
        case "add_analytics_contact":
          return await addAnalyticsContact(event, model.analytics_contact);
        case "update_analytics_contact":
          return await updateAnalyticsContact(event, model.analytics_contact);
        case "delete_analytics_contact":
          return await deleteAnalyticsContact(
            event,
            model.analytics_contact._settings_id
          );
        default:
          return error(
            event,
            404,
            `CRUD operation [${operation}] not supported`
          );
      }
    }
  } catch (ex: any) {
    console.error(ex);
    throw createError({
      statusCode: 422,
      message: ex.toString(),
    });
  }
});
