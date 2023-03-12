// const get_employees_url = `https://api.zenoti.com/v1/centers/${center_id}/employees`;

// const followup_date = new Date();
// followup_date.setDate(followup_date.getDate());
// const opportunity_title = "Consultations for Skin";

const createOppurtunityForGuest = async (data, opportunity_endpoint_url) => {
  const create_opportunity_body = JSON.stringify({
    center_id: data.center_id,
    opportunity_title: data.opportunity_title,
    guest_id: data.guest_id,
    created_by_id: data.created_by_id,
    followup_date: data.followup_date
  });
    
  const create_opportunity_header = {
    "Content-Type": "application/json",
    "Authorization": `apikey 479afeaa6c1947be99bfa1b5915e6a13c4c51cdf9686473497ceb342eafebc85`
  }

  // const opportunity_endpoint_url = `https://api.zenoti.com/v1/opportunities`;

    // console.log("oppurtunity:", opportunity_endpoint_url);
    return fetch(opportunity_endpoint_url, {
      method: "POST",
      headers: create_opportunity_header,
      body: create_opportunity_body,
    })
      .then(create_oppurtunity_res => create_oppurtunity_res.json())
      .then((create_oppurtunity_res) => {
        // const employees = JSON.parse(body).employees;
        return { status: 'success', oppurtunity: create_oppurtunity_res };
      })
      .catch((error) => {
        console.log(error);
        return { status: 'error', error: error };
      });
};

module.exports = createOppurtunityForGuest;

// https://api.zenoti.com/v1/
// const get_centers_url = 'https://api.zenoti.com/v1/centers';


// const get_employees_url = `${get_centers_url}/${center_id}/employees`;

