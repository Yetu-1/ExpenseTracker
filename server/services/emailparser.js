import { google } from "googleapis"
import * as cheerio from 'cheerio';
import env from "dotenv"
import pg from "pg"

// Loads .env file contents into process.env so we can have access to the variables
env.config();

// create a new postgres database client
const dbs = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// connect to the postgres database
function connectToDB() {
    dbs.connect();
}

let mailBody ='';

async function listOfLabels(refreshToken) {

    try{ 
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:4000/auth/google/home", // Redirect URL
      );
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      // get access token using refresh token
      const result = await oauth2Client.getAccessToken();
      const accessToken = result.token;
      // console.log(accessToken);
  
      oauth2Client.setCredentials({ access_token: accessToken });
  
      const gmail = google.gmail({version: 'v1', auth: oauth2Client});
    
      const response = await gmail.users.labels.list({
        userId: "me",
      });
    
      const labels = response.data.labels;
      console.log(labels);
      // if(!labels || labels.length == 0){
      //   console.log("No labels were found!");
      // }else {
      //   console.log("Labels: ");
      //   labels.forEach((label) => {
      //     console.log(`- ${label.name}`); 
      //   });
      // }
  
    }catch(err) {
      console.log("Error fetching labels", err);
    }
  }
  
  async function getLatestMessage(accessToken){
    try{ 
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
  
      const gmail = google.gmail({version: 'v1', auth: oauth2Client});
    
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 1,
      });
    
      let latestMessageId = response.data.messages[0].id;
      console.log("[MSG ID]: ", latestMessageId);
  
      try{
        const messageContent = await gmail.users.messages.get({
          userId: "me",
          id: latestMessageId,
          format: "full",
        });
        const body = JSON.stringify(messageContent.data.payload.body.data);
        // console.log("[MSG BASE64]", body);
        mailBody = new Buffer.from(body, 'base64').toString();
        // console.log("[MSG]: ", mailBody);
        getTransactions(mailBody);   
      }catch(err){
        console.log("Error getting message by id!", err);
      }
  
    }catch(err) {
      console.log("Error fetching messages!", err);
    }
  }
  
  function getTransactions(rawHtml) {
    // console.log(rawHtml);
    let transactionInfo = {};
    // convert raw html into jquery object
    const $ = cheerio.load(rawHtml);
    // const rawHtml = $('td'); // select Element
  
    $('table').each((index, element) => {
      // if it is the second table: ( which contains all the transaction informantion)
      if(index === 1) {
        // for each row in the table, 
        $(element).find('tr').each((index, element) => {
          let key = "";
          let value = "";
          const length = $(element).find('td').length;
          // if there are 3 data cells (i.e it has a valid key value pair of the form  'x' ':' 'y')
          if(length === 3) {
            // extract the first and third data cells as the key value pair (second element is this ':' char )
            $(element).find('td').each((index, element) => {
              if(index === 0) {
                key = $(element).text().trim(); // use trim() function to Remove the whitespace from the beginning and end of a string( the raw string had alot of white spaces)
              }else if(index === 2){
                value = $(element).text().trim();
              }
            });
            // add key value pair to transactionInfo object
            transactionInfo[key] = value;
          }
        });
      }
    });
  
    console.log(transactionInfo);
    return transactionInfo;
  }

async function testRefreshToken(refreshToken) {
  try{ 
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:4000/auth/google/home", // Redirect URL
    );
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    // get access token using refresh token
    const result = await oauth2Client.getAccessToken();
    const accessToken = result.token;
    // console.log(accessToken);

    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
    });
  
    let latestMessageId = response.data.messages[0].id;
    console.log("[MSG ID]: ", latestMessageId);

    try{
      const messageContent = await gmail.users.messages.get({
        userId: "me",
        id: latestMessageId,
        format: "full",
      });
      const body = JSON.stringify(messageContent.data.payload.body.data);
      // console.log("[MSG BASE64]", body);
      mailBody = new Buffer.from(body, 'base64').toString();
      // console.log("[MSG]: ", mailBody);
      return getTransactions(mailBody);   
    }catch(err){
      console.log("Error getting message by id!", err);
    }

  }catch(err) {
    console.log("Error fetching messages!", err);
  }
}

async function getMessagesByLabel(refreshToken) {
  try{ 
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:4000/auth/google/home", // Redirect URL
    );
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    // get access token using refresh token
    const result = await oauth2Client.getAccessToken();
    const accessToken = result.token;
    // console.log(accessToken);

    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
    });
  
    let latestMessageId = response.data.messages[0].id;
    console.log("[MSG ID]: ", latestMessageId);

  
  }catch(err) {
    console.log("Error fetching messages!", err);
  }
}

export { getLatestMessage, listOfLabels, testRefreshToken}


// sample transaction object
// const transaction = {
  //   'Account Number': '0717996873',
  //   'Transaction Location': 'OYIN JOLAYEMI ST V/I LAGOS',
  //   Description: 'NIBSS Instant Payment Outward',
  //   Amount: 'NGN 500.00',
  //   'Value Date': '30-04-2024 11:50',
  //   Remarks: '000013240430114750000033950037  TO ECO/David Yetu Salihu                                                                                                     REF:4150055771071799687350000202404301147',
  //   'Time of Transaction': '30-04-2024 11:48',
  //   'Document Number': '0',
  //   'Current Balance': 'NGN  68,724.35',
  //   'Available Balance': 'NGN   68,724.35'
  // };
  
  // console.log(transaction["Description"]);
  