'use strict';

const SQ_INTENT = 'security_question';
const FP_INTENT = 'finger_print';
const appContexts = {
login_sq: 'login_sq',
finger_print: 'finger_print',
logon: 'logon'
};
const fetch = require('node-fetch')
// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  List,
  Image,
  DeepLink
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
// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
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
    	conv.contexts.set(appContexts.logon,2);	
    }
    else if(conv.data.fpCount == 3)
       conv.close("You tried many times. Please try again after 5 mins.");
  	else{
      conv.ask("Sorry! It wasn't quite right. Could you verify again?");
      conv.contexts.set(appContexts.logon, 2);
    	}
  	}
});
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
app.intent('transfer.money.payee.payeeto', (conv, option)=>{
  console.log('option:', option, typeof(option))
  //console.log('account from:', account_from, typeof(account_from))
  conv.data.payee = option
  conv.ask("How much do you want to transfer?")
})
app.intent('transfer.money.btwaccount.full - yes', async(conv) => {
  const response = await fetch('https://google.com')
  const text = await response.text()
  console.log('data:', text)
  conv.ask('Hello World!')
  conv.ask(text)
});
app.intent('test.deeplink', (conv) => {
  conv.ask("Hello, we are testing deep link")
  conv.ask(new DeepLink({
    destination: 'Google',
    url: 'https://google.com',
    package: 'google.com',
    reason: 'handle this for you'}))
});


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