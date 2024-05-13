import { google } from "googleapis"
import * as cheerio from 'cheerio';
import env from "dotenv"

// Loads .env file contents into process.env so we can have access to the variables
env.config();

let mailBody ='';


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
      q: "is:unread from:gens@gtbank.com ", // filter messages by unread and from gtbank email (TODO: updated for other banks)
    });
    console.log(response.data.messages);
    // TODO: Add all the new transactions to the database
    let latestMessageId = response.data.messages[1].id;
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

export { getLatestMessage, testRefreshToken}
  