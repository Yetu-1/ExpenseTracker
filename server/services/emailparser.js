import { google } from "googleapis"
import * as cheerio from 'cheerio';
import env from "dotenv"

// Loads .env file contents into process.env so we can have access to the variables
env.config();

function getTransactions(rawHtml) {
  // console.log(rawHtml);
  let transactionInfo = {};
  // convert raw html into jquery object
  const $ = cheerio.load(rawHtml);
  
  // select all the tables in the html
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
  // console.log(transactionInfo);
  return transactionInfo;
}

async function getLatestMsgs(refreshToken) {
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
      q: "is:unread from:gens@gtbank.com", // filter messages by unread and from gtbank email (TODO: updated for other banks)
    });
    // convert all unread messages to an array of transaction objects
    const messages = response.data.messages;
    if(messages){
      const transactions = await msgs_to_tranObjs(gmail, messages);
      console.log(transactions);
      return transactions;
    }else {
      console.log("No new transactions!");
      return [];
    }

  }catch(err) {
    console.log("Error fetching messages!", err);
  }
}

async function msgs_to_tranObjs(gmail, messages) {
    let transactions = [];
    let transaction= {};
    /*
     * Parse and convert each message to a transaction object
     * Add in reverse order so that the latest message is at the bottom
     * This results in the oldest message being saved first in the database
    */
    for(let i = (messages.length-1); i >= 0; i--) {
      try{
        const messageContent = await gmail.users.messages.get({
          userId: "me",
          id: messages[i].id,
          format: "full",
        });
        // parse message from raw form into  object format
        transaction = constructTransactionObj(messageContent);
      }catch(err){
        console.log("Error getting message by id!", err);
      }
      //push message onto transactions array
      transactions.push(transaction);
    }
    //await modifyMsgAsRead(gmail, messages); // remove unread tag from each messages
    return transactions;
}

async function modifyMsgAsRead(gmail, messages) {
  // remove "unread" labels from messages
  for(let i = 0; i < messages.length; i++) {
    try{
      await gmail.users.messages.modify({
        userId: "me",
        id: messages[i].id,
        "removeLabelIds": [
          'UNREAD'
        ]
      });
    }catch(err){
      console.log("Error removing unread label", err);
    }
  }
}

function getTransactionType(messageContent) {
  const snippet = messageContent.data.snippet;
  // Checks if the snippet contains specified transaction type and return it
  if (snippet.search('Debit') != -1) {
    return 'Debit';
  }else if( snippet.search('Credit') != -1) {
    return 'Credit';
  }else {
    return '';
  }
}

function constructTransactionObj(messageContent) {
  // get transaction type credit/debit
  const tran_type = getTransactionType(messageContent);
  
  const body = JSON.stringify(messageContent.data.payload.body.data);
  // convert from base64 format to string
  const mailBody = new Buffer.from(body, 'base64').toString();

  const transaction =  getTransactions(mailBody);

  let transactionObj = {
    account: '', type: '', amount: '', time: '', day: '',month: '',
    year: '', description: '', balance: '', remarks: '',
  };
  // parse the input date original form = "13-05-2024 11:26"
  const date = dateParser(transaction['Time of Transaction']);

  transactionObj.account = transaction['Account Number'];
  transactionObj.amount = transaction['Amount'];
  transactionObj.type = tran_type;
  transactionObj.time = date.time;
  transactionObj.day = date.day;
  transactionObj.month = date.month;
  transactionObj.year = date.year;
  transactionObj.balance = transaction['Current Balance'];
  transactionObj.description = transaction['Description'];
  transactionObj.remarks = transaction['Remarks'];

  return transactionObj;
}

// parse the input date and return a date object
function dateParser(input) {
  let date = {
      day: '',
      month: '',
      year: '',
      time: '',
  };
  
  date.day = input.substr(0, 2);
  date.month = input.substr(3, 2);
  date.year = input.substr(6, 4);
  date.time = input.substr(11, 5);
  return date;
}

export { getLatestMsgs }
  
