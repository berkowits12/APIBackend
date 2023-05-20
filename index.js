const express = require("express");
const app = express();
const fetchCenters = require("./utils/zenotiUtils.js");
const compression = require("compression");
const joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const { BASE_URL } = require("./utils/constants.js");
const createGuest = require("./utils/createGuest.js");
const createOpportunityForGuest = require("./utils/createOpportunityForGuest.js");
const createOpportunityNote = require("./utils/createOpportunityNote.js");
const searchGuest = require("./utils/searchGuest.js");
const verifyApiKey = require("./utils/verifyAPIKey.js");
app.use(express.json());

app.use(
  compression({
    level: 6,
    threshold: 10 * 1000,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

var cacheService = require("express-api-cache");
var cache = cacheService.cache;

const postSampleSchema = joi.object({
  leadid: joi.string().allow(null, ""),
  leadtype: joi.string().allow(null, ""),
  prefix: joi.string().allow(null, ""),
  name: joi.string().required(),
  mobile: joi.string().length(10).pattern(/^[0-9]+$/).required(),
  email: joi.string().allow(null, ""),
  date: joi.date().allow(null, ""),
  category: joi.string().allow(null, ""),
  area: joi.string().allow(null, ""),
  city: joi.string().allow(null, ""),
  brancharea: joi.string().allow(null, ""),
  company: joi.string().allow(null, ""),
  pincode: joi.string().allow(null, ""),
  time: joi.string().allow(null, ""),
  branchpin: joi.string().required(),
  parentid: joi.string().allow(null, ""),
  gender: joi.number().allow(null, ""),
  phone: joi.string().allow(null, ""),
  dncmobile: joi.number().empty("").allow(null),
  dncphone: joi.number().empty("").allow(null),
});

app.post("/postMiddleware", cache("10 minutes"), async (req, res) => {
  const apiKeyValidated = verifyApiKey(req.get("Authorization"));
  if (!apiKeyValidated) {
    return res.status(401).send("UNAUTHORIZED");
  }
  const { error, value } = postSampleSchema.validate(req.body, {
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
  const opportunity_description =
    req.body.category + " " + req.body.area + "" + req.body.city;
  const opportunity_endpoint_url = `https://api.zenoti.com/v1/opportunities`;

  try {
    // Fetch all centers
    const centersResponseData = await fetchCenters();
    const centers = centersResponseData.centers;

    // Batch processing of centers
    const batchSize = 21; // Batch size
    const centerBatches = [];
    for (let i = 0; i < centers.length; i += batchSize) {
      const batch = centers.slice(i, i + batchSize);
      centerBatches.push(batch);
    }

    let guestData;

    // Process center batches concurrently
    for (const batch of centerBatches) {
      const searchPromises = batch.map((center) =>
        searchGuest(center.id, guest_phone)
      );
      const searchResults = await Promise.all(searchPromises);

      for (const searchResult of searchResults) {
        if (searchResult.page_Info.total > 0) {
          guestData = searchResult.guests[0];
          break;
        }
      }

      if (guestData) {
        break;
      }
    }

    if (guestData) {
      const guestId = guestData.id;
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
        const opportunity_endpoint_notes_url = `https://api.zenoti.com/v1/opportunities/${createOpportunity.opportunity.opportunity_id}/notes`;
        const opportunity_create_notes_res = await createOpportunityNote(
          { notes, mainEmployeeId },
          opportunity_endpoint_notes_url
        );
        if (opportunity_create_notes_res.status === "success") {
          // console.log("Opportunity created and also notes updated");
        } else {
          // console.log("Opportunity created but notes not posted");
        }
      }
    } else {
      // Guest not Found, create guest then create opportunity
      let guestFirstName = guest_name.split(" ").slice(0, -1).join(" ");
      let guestLastName = guest_name.split(" ").slice(-1).join(" ");
      if (guestFirstName == "") {
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
        const opportunity_endpoint_notes_url = `https://api.zenoti.com/v1/opportunities/${createOpportunity.opportunity.opportunity_id}/notes`;
        const opportunity_create_notes_res = await createOpportunityNote(
          { notes, mainEmployeeId },
          opportunity_endpoint_notes_url
        );
        if (opportunity_create_notes_res.status === "success") {
          // console.log("Opportunity created and also notes updated");
        } else {
          // console.log("Opportunity created but notes not posted");
        }
      }
    }

    res.send("SUCCESS");
  } catch (error) {
    return res.send({
      res: "FAILURE",
      cause: JSON.stringify(error),
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 4500;

app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});
