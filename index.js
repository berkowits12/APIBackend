const express = require("express");
const app = express();
const ZENOTI_CONSTANTS = require("./utils/constants.js");
const fetchCenters = require("./utils/zenotiUtils.js");
const Joi = require("Joi");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const mainRouter = require("./routes/post.js");
const { BASE_URL } = require("./utils/constants.js");
const fectchGuest = require("./utils/fetchGuest.js");
const createGuest = require("./createGuest.js");
app.use(express.json());

// middleware
// app.use((req, res, next) => {
//   console.log(req.method, req.url, new Date.toTimeString());
//   if(req.body.name == "Indra"){
//     next();
//   }else{
//     res.send("Not Allowed");
//   }
// })

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
  gender: Joi.number().optional(),
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

  // const center_id = filteredCenters[0].id;
  // console.log("Center_ID: ", center_id);
  // console.log(centersResponse);

  // res.status(200).send(req.body);
  //=======================================fetchGuest========================================

  // const center_id = 'd858f57f-08fc-42ce-8e91-7550476acdb3';
  const guest_email = req.body.email;
  const guest_phone = req.body.phone;
  const center_id = "960501b6-78e3-462f-9ae6-73b1cff22c8f";
  const guest_endpoint_url = `https://${BASE_URL}/v1/guests`;
  const guest_name = req.body.name;
  const guest_gender = req.body.gender;
  const phone_code = req.body.phone;
  const last_name = req.body.name;
 
  // let fullUrl = `https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${center_id}&email=${guest_email}`;


  const fetchGuestData = async () => {
    try {
      const response = await fetch(`https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${center_id}&phone=${guest_phone}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `apikey 479afeaa6c1947be99bfa1b5915e6a13c4c51cdf9686473497ceb342eafebc85`
        }
      });
      const jsonData = await response.json();
      // console.log(jsonData);
  
      const guest_search_response = jsonData;
      console.log(guest_search_response);
      if (guest_search_response.page_Info.total > 0) {
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
          console.log("Guest found.\n","guest_id",guest_id);
        }
      } else {
        console.log("Guest not found.\n\nEnter details to create the guest.");
      }
      
    } catch (error) {
      console.log(error);
    }
  }
  
  await fetchGuestData();
  // create guest
  const [guestFirstName, guestLastName] = guest_name.split(' ');
  const guest = await createGuest({ center_id, guest_email, guest_phone , guestFirstName, guestLastName, guest_gender, phone_code}, guest_endpoint_url);
  console.log(guest);

  res.send({ centerId: filteredCenters[0].id, status: "SUCCESS", guest: guest });
});

const PORT = process.env.PORT | 4500;
// const zenotiAPIURL = `https://${BASE_URL}/v1/centers`;

app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});
