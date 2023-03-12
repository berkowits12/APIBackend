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
const createGuest = require("./utils/createGuest.js");
const getListOfEmployee = require("./utils/createOppurtunityForGuest.js");
const fetchListofEmplyees = require("./utils/fetchListofEmployees.js");
const createOppurtunityForGuest = require("./utils/createOppurtunityForGuest.js");
const createOppurtunityNote = require("./utils/createOppurtunityNote.js");
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
  gender: Joi.number().optional(),
});

app.get("/getData", (req, resp) => {
  console.log("data here", req.query);
  resp.send("RECEIVED");
});

app.post("/postSample", async (req, res) => {
  const { error, value } = postSampleSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    console.log(error);
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
  const get_employees_url = `https://api.zenoti.com/v1/centers/${center_id}/employees`
  // console.log(get_employees_url);
const followup_date = new Date();
followup_date.setDate(followup_date.getDate());
const notes = "Added Note";
const updated_by_id = 'FA875E55-2D4E-4737-9E7F-991EE03814A1';
const oppurtunity_id = 'ba41032a-2ca1-4902-84a8-131f883ee48f';
const opportunity_title = "Consultations for Skin";
const opportunity_endpoint_url = `https://api.zenoti.com/v1/opportunities`;
const opportunity_endpoint_notes_url = `https://api.zenoti.com/v1/opportunities/${oppurtunity_id}/notes`;
 
  // let fullUrl = `https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${center_id}&email=${guest_email}`;


  const fetchGuestData = async () => {
    try {
      const response = await fetch(`https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${center_id}&phone=${guest_phone}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `apikey ${process.env.JDAPIKEY}`
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
          const guest_input = parseInt(prompt("Multiple guests found. Select guest number: "));
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
  // const createGuestResponse = await createGuest({ center_id, guest_email, guest_phone , guestFirstName, guestLastName, guest_gender, phone_code}, guest_endpoint_url);
  // console.log("guest_id", createGuestResponse);
  // const guest_id = createGuestResponse.guestData.id;
  const guest_id = 'FA875E55-2D4E-4737-9E7F-991EE03814A1';

  // getListOFEmployee

  const employees = await fetchListofEmplyees(center_id);
  // JSON.parse(emplbody).employees;
  console.log(employees.employees[0].id);

  // create oppurtunity for the existing guest
  const created_by_id = "FA875E55-2D4E-4737-9E7F-991EE03814A1";
  const createOppurtunity = await createOppurtunityForGuest({center_id, opportunity_title,followup_date, guest_id, created_by_id }, opportunity_endpoint_url);
  console.log(createOppurtunity);

  const oppurtunity_create_notes_res = await createOppurtunityNote({notes, updated_by_id}, opportunity_endpoint_notes_url);
  // console.log(oppurtunity_create_notes_res);

  if(createOppurtunity.status === 'success' && oppurtunity_create_notes_res.status === 'success'){
    console.log("Oppurtunity created and also notes updated");
  }else{
    console.log("Oppurtunity created but notes not posted");
  }

  // res.send({ centerId: filteredCenters[0].id, status: "SUCCESS", guest: guest_id });
  res.send({ centerId: filteredCenters[0].id, guestId: guest_id, status: "SUCCESS", oppurtunity: createOppurtunity, notes:oppurtunity_create_notes_res });
  
})

const PORT = process.env.PORT || 4500;
// const zenotiAPIURL = `https://${BASE_URL}/v1/centers`;

app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});
