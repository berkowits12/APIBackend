const express = require("express");
const app = express();
const ZENOTI_CONSTANTS = require("./utils/constants.js");
const fetchCenters = require("./utils/zenotiUtils.js");
const Joi = require("Joi");
const dotenv = require("dotenv");
// const validateData = require('./validator');
dotenv.config({ path: "./.env" });

const mainRouter = require("./routes/post.js");
const { BASE_URL } = require("./utils/constants.js");
app.use(express.json());

app.use(express.json());

const postSampleSchema = Joi.object({
  leadid: Joi.string().required(),
  leadtype: Joi.string().required(),
  prefix: Joi.string().optional(),
  phone: Joi.string().optional(),
  name: Joi.string().required(),
  mobile: Joi.number().required(),
  email: Joi.string().email().required(),
  date: Joi.date().required(),
  dncmobile: Joi.number().optional(),
  dncphone: Joi.number().optional(),
  category: Joi.string().required(),
  area: Joi.string().required(),
  city: Joi.string().required(),
  brancharea: Joi.string(),
  company: Joi.string().equal("Berkowits Hair and Skin Clinic"),
  pincode: Joi.string().optional(),
  time: Joi.string(),
  branchpin: Joi.string().required(),
  parentid: Joi.string().optional(),
});

app.get("/getData", (req, resp) => {
  console.log("data here", req.query);
  // request(options, function(error, response){
  //     if(error) throw new Error(error);
  //     resp.send(response.body);
  //     console.log(response.body);
  // })
  //   console.log(req.quer.branchpin);
  resp.send("RECEIVED");
});

app.post("/postSample", async (req, res) => {
  const { error, value } = postSampleSchema.validate(req.body, {
    abortEarly: false,
  });
  // const {error, value} = validateData(req.body);
  if (error) {
    console.log(error);
    // return res.send("Invalid Request");
    return res.send(error.details);
  }
  console.log("data send", req.body);

  const centersResponse = await fetchCenters();
  const filteredCenters = centersResponse.centers.filter(function (ele) {
    return ele.address_info.zip_code === req.body.branchpin;
  });
  const centerID = filteredCenters[0].id;
  console.log("Center_ID: ", centerID);

  const center_id = filteredCenters[0].id;
  const api_url = "api.zenoti.com";

    // Search or create guest
    const guest_email = req.body.email;
    const guest_endpoint_url = `https://${api_url}/v1/guests`;
    const guest_search_url = `${guest_endpoint_url}/search?center_id=${center_id}&email=${guest_email}`;

    axios.get(guest_search_url, {
      headers: auth_header
    })
    .then(response => {
      const guest_search_response = response.data;
      if (guest_search_response.page_info.total > 0) {
        const guest_list = guest_search_response.guests;
        if (guest_list.length > 1) {
          console.log('List of guests');
          guest_list.forEach((guest, j) => {
            console.log(`${j + 1}. ${guest.personal_info.user_name} - ${guest.personal_info.first_name} ${guest.personal_info.last_name}`);
          });
          const guest_input = parseInt(prompt("\nMultiple guests found. Select guest number: "));
          const guest_id = guest_list[guest_input - 1].id;
        } else {
          const guest_id = guest_list[0].id;
          console.log("Guest found.\n");
        }
      } else {
        console.log("Guest not found.\n\nEnter details to create the guest.");

        const createGuest = (error) => {
            if (error) {
              console.log("\nThere was an error in guest object. Please retry.\n");
            }
          
            const createGuestBody = JSON.stringify({
              center_id: center_id,
              personal_info: {
                mobile_phone: {
                  phone_code: prompt("Enter country code: "),
                  number: prompt("Enter phone number: "),
                },
                first_name: prompt("Enter first name: "),
                last_name: prompt("Enter last name: "),
                email: guest_email,
                gender: prompt("Male - 1, Female - 0, and Other - 3. Enter Gender number: "),
              },
            });
          
            const createGuestHeader = {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${access_token}`,
            };
          
            fetch(guest_endpoint_url, {
              method: "POST",
              headers: createGuestHeader,
              body: createGuestBody,
            })
              .then((response) => {
                if (response.ok) {
                  console.log("Guest created successfully!\n");
                  return response.json().id;
                } else {
                  createGuest(true);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          };
          
          const guest_id = createGuest(false);          
    }

  res.send({ centerId: filteredCenters[0].id, status: "SUCCESS" });
});

const PORT = process.env.PORT | 4500;
// const zenotiAPIURL = `https://${BASE_URL}/v1/centers`;

app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});
