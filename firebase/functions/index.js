'use strict';

const SQ_INTENT = 'security_question';
const FP_INTENT = 'finger_print';
const appContexts = {
login_sq: 'login_sq',
finger_print: 'finger_print',
logon: 'logon',
transferpayee: ''
};
const fetch = require('node-fetch')
const axios = require('axios')
const url = 'https://apisandbox.openbankproject.com'




// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  List,
  Image,
  DeepLink,
  HtmlResponse
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Fingerprint Authentication Card config
const fpCard = {
    title: 'Verify Your Identity ',
    subtitle: "Confirm your fingerprint so Banking Sir can verify it's you",
    text: 'Touch on the sensor',
    image: {
      url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/fingerprint_GIF.gif',
      accessibilityText: 'Fingerprint Authentication',
    },
    display: 'WHITE',
  }
// Account From List config
const afList = {
  title: 'Account From',
  items: {
    // Add the first item to the list
    'Advance Current': {
      synonyms: [
        'Current',
        'Current Account',
        'From my current account'
      ],
      title: 'Advance Current',
      description: '480-123456-789',
      image: new Image({
        url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/money.png',
        alt: 'Current Account',
      }),
    },
    // Add the second item to the list
    'Advance Saving': {
      synonyms: [
        'Saving',
        'Saving Account',
        'From my saving account'
    ],
      title: 'Advance Saving',
      description: '480-987654-321',
      image: new Image({
        url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/piggy-bank.png',
        alt: 'Saving Account',
      }),
    },
  }
}
// Payee list config
const payeeList = {
  title: 'Existing Payee',
  items: {
    // Add the first item to the list
    'Donald Trump': {
      synonyms: [
        'Trump',
        'Donald',
      ],
      title: 'Donald Trump',
      description: '123-123456-789',
      image: new Image({
        url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/donald_trump.jpeg',
        alt: 'Donald Trump',
        height: 300,
        width: 300
      }),
    },
    // Add the second item to the list
    'Xin Jin Ping': {
      synonyms: [
        'Xin',
        'Ping',
        'Jin',
        'Jin Ping'
    ],
      title: 'Xin Jin Ping',
      description: '333-987654-321',
      image: new Image({
        url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/download.jpeg',
        alt: 'Xin Jin Ping',
        height: 300,
        width: 300
      }),
    },
  }
}

const serviceList = {
  title: 'Services',
  items: {
    // Add the first item to the list
    'Check Balance': {
      synonyms: [
        'Check my balance',
        'check my account',
        'how much money I have',
      ],
      title: 'Check Balance',
      description: 'Information about your current balance.',
      image: new Image({
        url: 'https://thumbor.forbes.com/thumbor/960x0/https%3A%2F%2Fblogs-images.forbes.com%2Ftimmaurer%2Ffiles%2F2014%2F10%2Fmoneyandlife-e1414715276448.jpg',
        alt: 'Image alternate text',
      }),
    },
    // Add the second item to the list
    'Transfer Money ': {
      synonyms: [
        'Transfer money',
        'send money',
        'give money',
        'make a transfer'
    ],
      title: 'Transfer Money',
      description: 'Make a transfer.' +
        'the Google Assistant.',
      image: new Image({
        url: 'http://musicpress.gr-wp-uploads.s3-eu-central-1.amazonaws.com/wp-content/uploads/2019/05/29123555/transfer-arrows.jpg',
        alt: 'Google Home',
      }),
    },
    // Add the third item to the list
    'Add Payee': {
      synonyms: [
        'add a new payee',
        'add a people',
        'Payee',
      ],
      title: 'Add new payee',
      description: 'Add new payee to your contact list.',
      image: new Image({
        url: 'https://png.pngtree.com/svg/20160922/payee_1019638.png',
        alt: 'Add a new payee',
      }),
    },
  }
}

const acctmap = {
  'Advance Current': 'ACC005',
  'Advance Saving': 'ACC006'

}
const payeemap = {
  'Donald Trump' :  'ACC003', 
  'Xin Jin Ping' : 'ACC006'
}

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('test.openbankingapi', async(conv)=>{
  const response = await axios({
    method: 'post',
    url: url+'/my/logins/direct',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'DirectLogin username=abc_user1,password=Qwerty@123,consumer_key=2swyvyynfzzbwkg0xjxiwfgiw4lyvmq4t5m5b3yi',
      }
  });
  const token = response.data.token
  conv.ask('Hello World!')
  const response1 = await axios({
    method: 'get',
    url: url + '/obp/v3.1.0/banks/obp-bank-x-g/accounts/account_ids/private',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'DirectLogin token=' + token,
      }
  })
  console.log(response1.data)
})

app.intent('start', (conv) => {
	conv.ask("Could you share more about yourself to me? Please tell me your best friend's full name");
	conv.data.sqCount = 0; 
  conv.data.fpCount = 0;
  conv.data.account_from = '';
  conv.data.payee = '';
  conv.data.amount = 0;
});
app.intent('security_question', (conv, {full_name}) => { 
  conv.data.sqCount++;
  console.log('sqCount: ', conv.data.sqCount);
  if(conv.data.sqCount < 3){
    if (full_name == 'Alex William'){
        conv.ask('Perfect! One more check, please verify your fingerprint using the scanner');
        conv.ask(new BasicCard(fpCard))
        setTimeout(()=>{conv.ask('Perfect! How could I help you today?')}, 1500);
    	conv.contexts.set(appContexts.finger_print,1);	
    }
  	else{
      conv.ask("Sorry! It wasn't quite right. Could you give his/her full name again?");
      conv.contexts.set(appContexts.login_sq, 1);
    	}
  	}
  else{
  	if(full_name == 'Alex William'){
      conv.ask('Perfect! One more che ck, please verify your fingerprint using the scanner');
      conv.ask(new BasicCard(fpCard))
      setTimeout(()=>{conv.ask('Perfect! How could I help you today?')}, 1500);
      conv.contexts.set(appContexts.finger_print,1);}
    else{
      conv.close("Sorry! You tried many times. Plese try again later");}
  }
});

app.intent('security_question - fingerprint', (conv, {fingerprint}) => { 
  conv.data.fpCount++;
  console.log('fqCount: ',conv.data.fpCount);
  if(conv.data.fpCount <= 3){
    if (fingerprint == 'fingerprint'){
      	conv.ask('Perfect! How could I help you today?');	
        conv.ask(new List(serviceList));
    }
    else if(conv.data.fpCount == 3)
       conv.close("You tried many times. Please try again after 5 mins.");
  	else{
      conv.ask("Sorry! It wasn't quite right. Could you verify again?");
      conv.contexts.set(appContexts.logon, 2);
    	}
  	}
});
app.intent('transfer.money', (conv, {service}, option)=>{
  conv.ask('Do you want to transfer between your account or transfer to your payee?')
})
app.intent('transfer.money.payee', (conv)=>{
    conv.ask("Sure. Transfer from which account?")
    conv.ask(new List(afList))
  })
app.intent('transfer.money.btwaccount', (conv)=>{
    conv.ask("Sure. Transfer from which account?")
    conv.ask(new List(afList))
  })
app.intent('transfer.money.payee.acfrom', (conv, {account_from}, option)=>{
  console.log('option:', option, typeof(option))
  console.log('account from:', account_from, typeof(account_from))
  conv.data.account_from = option
  conv.ask("Who do you want to transfer to")
  conv.ask(new List(payeeList))
})
app.intent('transfer.money.payee.payeeto', (conv,{payee}, option)=>{
  console.log('option:', option, typeof(option))
  //console.log('account from:', account_from, typeof(account_from))
  conv.data.payee = option
  conv.ask("How much do you want to transfer?")
})
// intent for listening the amount the user want to transfer
app.intent('transfer.money.payee.amount', (conv, {amount})=>{
  console.log('amount:', amount, typeof(amount))
  conv.data.amount = amount
  conv.ask(`We are now transferring ${conv.data.amount.currency} ${conv.data.amount.amount} from ${conv.data.account_from} to ${conv.data.payee}. Do you confirm?`)
})
// intent for confirming the transfer request
app.intent('transfer.money.payee.amount.yes', async(conv)=>{
  //make an API request to transfer money
  // account from ID
  // account to ID
  // currency 
  // amount
  conv.ask('Hello API')
  const key = '2swyvyynfzzbwkg0xjxiwfgiw4lyvmq4t5m5b3yi'
  var username = 'jin_ping'
  var password = 'Qwerty@123'
  const response = await axios({
    method: 'post',
    url: url+'/my/logins/direct',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'DirectLogin username='+username+',password='+password+',consumer_key='+key
      }
  });
  const token = response.data.token
  console.log('token:',token )
  console.log('accpmap', acctmap[conv.data.account_from])
  console.log('payeemap', payeemap[conv.data.payee])
  console.log('amount', conv.data.amount.amount)
  const response1 = await axios({
    method: 'post',
    url: url+'/obp/v3.1.0/banks/obp-bank-x-g/accounts/'+acctmap[conv.data.account_from]+'/owner/transaction-request-types/SANDBOX_TAN/transaction-requests',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'DirectLogin token=' + token,
    },
    data: {
      "to":{    "bank_id":"obp-bank-x-g",    "account_id":payeemap[conv.data.payee]  },
      "value":{    "currency":"EUR",    "amount":conv.data.amount.amount  },  
      "description":"initial credit"
    }
  })
  console.log('data:',response.data)
  if(response1.data.status == 'COMPLETED'){
    console.log('Success:')
  }
  else{
    console.log('Transaction fail')
  }
})
app.intent('test.deeplink', (conv) => {
  conv.ask("Hello, we are testing deep link")
  conv.ask(new DeepLink({
    destination: 'Google',
    url: 'https://google.com',
    package: 'google.com',
    reason: 'handle this for you'}))
});
// intent for transfer request with full information
app.intent('transfer.money.btwaccount.full - yes', async(conv) => {
  const response = await axios.post('https://google.com')
  const text = await response.text()
  console.log('data:', text)
  conv.ask('Hello World!')
  conv.ask(text)
});
// intent for loading web app
app.intent('actions.intent.PLAY_GAME', (conv) =>{
  conv.ask('Hello Game')
  conv.ask(new HtmlResponse({
  url: 'https://google.com',
}))
});
// fallback for sequrity question
app.intent('security_question_fallback',(conv) => {
 // intent contains the name of the intent
 // you defined in the Intents area of Dialogflow
     conv.data.sqCount++;
  if(conv.data.spCount < 3){
    conv.ask("Sorry, I could not get that. Please provide me your best friend's full name again.");
    conv.contexts.set(appContexts.login_sq, 1)
  }
  else
    conv.close("You tried many times. Please try again after 5 mins.")
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);