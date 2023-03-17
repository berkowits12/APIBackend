const createOpportunityNote = async (data, opportunity_endpoint_notes_url) => {
    const opportunity_notes_body = JSON.stringify({
      notes: data.notes,
      updated_by_id: data.updated_by_id,

    });
      
    const opportunity_notes_header = {
      "Content-Type": "application/json",
      "Authorization": `apikey ${process.env.JDAPIKEY}`
    }
  
    // const opportunity_endpoint_url = `https://api.zenoti.com/v1/opportunities`;
  
      // console.log("opportunity:", opportunity_endpoint_url);
      return fetch(opportunity_endpoint_notes_url, {
        method: "POST",
        headers: opportunity_notes_header,
        body: opportunity_notes_body,
      })
        .then(opportunity_note_res => opportunity_note_res.json())
        .then((opportunity_note_res) => {
          // const employees = JSON.parse(body).employees;
          return { status: 'success', opportunity_note: opportunity_note_res };
        })
        .catch((error) => {
          console.log(error);
          return { status: 'error', error: error };
        });
  };
  
module.exports = createOpportunityNote;