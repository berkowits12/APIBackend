const axios = require('axios');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for input
readline.question('Opportunity Title: ', (opportunity_title) => {
  readline.question('Enter followup date in format yyyy-mm-dd: ', (followup_date) => {
    console.log('List of employees');
    employees.forEach((employee, index) => {
      console.log(`${index+1}. ${employee.personal_info.name}`);
    });
    readline.question("\nSelect employee's number to assign the opportunity: ", (employees_input) => {
      const employee_id = employees[parseInt(employees_input)-1].id;
      const create_opportunity_body = JSON.stringify({
        center_id: center_id,
        opportunity_title: opportunity_title,
        guest_id: guest_id,
        created_by_id: employee_id,
        followup_date: followup_date
      });
      const create_opportunity_header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
      };
      const opportunity_endpoint_url = `https://${api_url}/v1/opportunities`;

      axios.post(opportunity_endpoint_url, create_opportunity_body, { headers: create_opportunity_header })
        .then((opportunity_create_response) => {
          console.log(opportunity_create_response.data);
          readline.close();
        })
        .catch((error) => {
          console.error(error);
          readline.close();
        });
    });
  });
});
