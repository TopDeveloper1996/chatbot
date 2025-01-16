import axios, { AxiosError, isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
import { DittaContact } from "~/src/types/ditta_contact";

const BASE_URL = "https://ade.mentally.ai";

async function updateDittasContact(event: H3Event<EventHandlerRequest>, contactBody: DittaContact): Promise<Object> {
    let body = await readBody(event);
    const scraperApiAccess = getQuery(event).scraperApiAccess?.toString();
    let hasError = false;
    let contactId = Number.parseInt(contactBody.contact_id);
    const contactBodyUpdate = {
        first_name: contactBody.first_name,
        last_name: contactBody.last_name,
        email: contactBody.email,
        phone: contactBody.phone,
    };
    console.log(`patching edit ditta, model: ${JSON.stringify(contactBody, undefined, "  ")}`);
    try {
        let result = await axios.patch(`${BASE_URL}/api/v1/crawler/ditta-contact/${contactId}/`, contactBodyUpdate, {
            headers: { Authorization: `Bearer ${scraperApiAccess}`, "Content-Type": "application/json" },
        });
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.error(`error editing ditta: ${ex.response?.data}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "one or more error occured while editing dittas");
    }
    return success(event, 200, body);
}

async function deleteDittasContact(event: H3Event<EventHandlerRequest>, contact: DittaContact): Promise<Object> {
    const scraperApiAccess = getQuery(event).scraperApiAccess?.toString();
    let hasError = false;
    const contactId = getQuery(event).contact_id?.toString();
    console.log(`patching delete ditta contact, model: ${JSON.stringify(contactId, undefined, "  ")}`);
    try {
        let result = await axios.delete(`${BASE_URL}/api/v1/crawler/ditta-contact/${contactId}/`, {
            headers: { Authorization: `Bearer ${scraperApiAccess}`, "Content-Type": "application/json" },
        });
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.error(`error deleting ditta: ${ex.response?.data}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "one or more error occured while deleting dittas");
    }
    return success(event, 201, {});
}

async function addDittasContact(event: H3Event<EventHandlerRequest>, contactBody: any[]): Promise<Object> {
    let hasError = false;
    const scraperApiAccess = getQuery(event).scraperApiAccess?.toString();
    console.log(`posting add ditta contact, model: ${JSON.stringify(contactBody, undefined, "  ")}`);
    let createdContact = {};
    try {
        let result = await axios.post(`${BASE_URL}/api/v1/crawler/ditta-contact/`, contactBody, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${scraperApiAccess}` },
        });
        createdContact = result.data;
    } catch (ex: any) {
        console.error(`error adding ditta: ${ex}`);
        console.error(`error adding ditta: ${ex as AxiosError}`);
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "one or more error occured while adding dittas");
    }
    return success(event, 201, createdContact);
}

async function getDittasContacts(event: H3Event<EventHandlerRequest>): Promise<Object> {
    //if (dittaModels.length <= 0) return success(event, 200, {});
    //let body = await readBody(event);
    console.log(getQuery(event));
    const ditta_id = getQuery(event).ditta_id?.toString();
    const scraperApiAccess = getQuery(event).scraperApiAccess?.toString();
    let hasError = false;
    let dittasContacts: any[] = [];

    try {
        let result = await axios.get(`${BASE_URL}/api/v1/crawler/ditta-contact/?ditta_id=${ditta_id}`, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${scraperApiAccess}` },
        });
        dittasContacts = result.data;
    } catch (ex: any) {
        console.error(`error adding dittas contacts: ${ex}`);
        console.error(`error adding dittas contacts: ${ex as AxiosError}`);
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "one or more error occured while reading dittas contacts");
    }
    return success(event, 200, { dittasContacts });
}

export default defineEventHandler(async (event) => {
    const params = getQuery(event);
    try {
        if (event.method === "GET") {
            const customer = params.customer_id?.toString();
            return await getDittasContacts(event);
        } else if (event.method === "PATCH") {
            const model = await readBody(event);
            console.log(`EDIT model: ${JSON.stringify(model, undefined, "  ")}`);
            return await updateDittasContact(event, model);
        } else if (event.method === "POST") {
            const model = await readBody(event);
            console.log(`CREATE model: ${JSON.stringify(model, undefined, "  ")}`);
            return await addDittasContact(event, model);
        } else if (event.method === "DELETE") {
            const model = await readBody(event);
            return await deleteDittasContact(event, model);
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
