const express = require("express");
const app = express();
const fetchCenters = require("./utils/zenotiUtils.js");
const joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({path: "./.env"});
const {BASE_URL} = require("./utils/constants.js");
const createGuest = require("./utils/createGuest.js");
const createOpportunityForGuest = require("./utils/createOpportunityForGuest.js");
const createOpportunityNote = require("./utils/createOpportunityNote.js");
const searchGuest = require("./utils/searchGuest.js");
const verifyApiKey = require("./utils/verifyAPIKey.js");
app.use(express.json());

const postSampleSchema = joi.object({
    leadid: joi.string().required(),
    leadtype: joi.string().required(),
    prefix: joi.string().allow(null, ''),
    name: joi.string().required(),
    mobile: joi.string().length(10).pattern(/^[0-9]+$/).required(),
    email: joi.string().allow(null, ''),
    date: joi.date().required(),
    category: joi.string().required(),
    area: joi.string().required(),
    city: joi.string().required(),
    brancharea: joi.string(),
    company: joi.string().optional(),
    pincode: joi.string().optional(),
    time: joi.string(),
    branchpin: joi.string().required(),
    parentid: joi.string().optional(),
    gender: joi.number().optional(),
    phone: joi.string().allow(null, ''),
    dncmobile: joi.number().empty("").allow(null),
    dncphone: joi.number().empty("").allow(null),

});


app.get("/getData", (req, resp) => {
    const apiKeyValidated = verifyApiKey(req.get('Authorization'));
    if (!apiKeyValidated) {
        return resp.status(401).send('UNAUTHORIZED');
    }
    console.log("data here", req.query);
    return resp.status(200).send("RECEIVED");
});

app.post("/postMiddleware", async (req, res) => {
    const apiKeyValidated = verifyApiKey(req.get('Authorization'));
    if (!apiKeyValidated) {
        return res.status(401).send('UNAUTHORIZED');
    }
    const {error, value} = postSampleSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        return res.send(error.details);
    }

    const guest_email = req.body.email;
    const guest_phone = req.body.mobile;
    const headOfficeCenterId = "960501b6-78e3-462f-9ae6-73b1cff22c8f";
    const guest_endpoint_url = `https://${BASE_URL}/v1/guests`;
    const guest_name = req.body.name;
    const guest_gender = req.body.gender;
    const get_employees_url = `https://api.zenoti.com/v1/centers/${headOfficeCenterId}/employees`;
    const followup_date = req.body.date;
    const notes = req.body.city + " " + req.body.category;
    const mainEmployeeId = "912a8fd8-35fc-47ce-b517-d8221ff74803";
    const opportunity_title = "Just Dial";
    const opportunity_description = req.body.category + " " + req.body.area + "" + req.body.city;
    const opportunity_endpoint_url = `https://api.zenoti.com/v1/opportunities`;
    
    try {
        // search guest in all the existing centers
        const centersResponseData = await fetchCenters();
        const centers = centersResponseData.centers;

        let guestData;

        for (let i = 0; i < centers.length; i++) {
            const searchResult = await searchGuest(centers[i].id, guest_phone);
            if (searchResult.page_Info.total > 0) {
                guestData = searchResult.guests[0];
                break;
            }
        }
        ;

        if (guestData) {
            const guestId = guestData.id;
            console.log("Guest found and", "guest_id is :", guestId);
            const createOpportunity = await createOpportunityForGuest(
                {
                    center_id: headOfficeCenterId,
                    opportunity_title,
                    opportunity_description,
                    followup_date: new Date().toISOString().substring(0, 10),
                    guest_id: guestId,
                    created_by_id: mainEmployeeId,
                },
                opportunity_endpoint_url
            );
            // Add notes on created opportunity
            if (createOpportunity.status === "success") {
                const opportunity_endpoint_notes_url = `https://api.zenoti.com/v1/opportunities/${createOpportunity.opportunity.opportunity_id}/notes`
                const opportunity_create_notes_res = await createOpportunityNote(
                    {notes, mainEmployeeId},
                    opportunity_endpoint_notes_url
                );
                if (opportunity_create_notes_res.status === "success") {
                    console.log("Opportunity created and also notes updated");
                } else {
                    console.log("Opportunity created but notes not posted");
                }
            }
        } else {
            // Guest not Found, create guest then create opportunity
            let guestFirstName = guest_name.split(" ").slice(0, -1).join(' ');
            let guestLastName = guest_name.split(" ").slice(-1).join(' ');
            if(guestFirstName == ""){
                guestFirstName = guestLastName;
            }
            const createGuestResponse = await createGuest(
                {
                    center_id: headOfficeCenterId,
                    guest_email,
                    guest_phone,
                    guestFirstName,
                    guestLastName,
                    guest_gender,
                },
                guest_endpoint_url
            );

            const guestId = createGuestResponse.guestData.id;
            console.log("Guest id is:", guestId);
            const createOpportunity = await createOpportunityForGuest(
                {
                    center_id: headOfficeCenterId,
                    opportunity_title,
                    opportunity_description,
                    followup_date: new Date().toISOString().substring(0, 10),
                    guest_id: guestId,
                    created_by_id: mainEmployeeId,
                },
                opportunity_endpoint_url
            );
            // Add notes on created opportunity
            if (createOpportunity.status === "success") {
                const opportunity_endpoint_notes_url = `https://api.zenoti.com/v1/opportunities/${createOpportunity.opportunity.opportunity_id}/notes`
                const opportunity_create_notes_res = await createOpportunityNote(
                    {notes, mainEmployeeId},
                    opportunity_endpoint_notes_url
                );
                if (opportunity_create_notes_res.status === "success") {
                    console.log("Opportunity created and also notes updated");
                } else {
                    console.log("Opportunity created but notes not posted");
                }
            }
        }
    } catch (error) {
        return res.send({ "res": "FAILURE", "cause": JSON.stringify(error), "message": error.message });
    }
    res.send("SUCCESS");
});

const PORT = process.env.PORT || 4500;

app.listen(PORT, () => {
    console.log("Listening on port:", PORT);
});
