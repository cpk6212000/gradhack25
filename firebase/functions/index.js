'use strict';

const appContexts = {
login_sq: 'login_sq',
finger_print: 'finger_print',
logon: 'logon',
transferpayee: ''
};
const axios = require('axios')
const url = 'https://apisandbox.openbankproject.com'




// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  List,
  Image,
  DeepLink,
  Suggestions,
  LinkOutSuggestion,
  Button
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Fingerprint Authentication Card config
/**const fpCard = {
    title: 'Verify Your Identity ',
    subtitle: "Confirm your fingerprint so Banking Sir can verify it's you",
    image: {
      url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/fingerprint_GIF.gif',
      accessibilityText: 'Fingerprint Authentication',
    },
    buttons: new Button({
      title: 'Touch here to verify your fingerprint.',
      url: 'https://assistant.google.com/services/invoke/uid/00000016e2871140?intent=test.action&hl=en',
    display: 'WHITE',
  })
}**/
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
        url: 'https://storage.cloud.google.com/gradhack-v1.appspot.com/balance.png?authuser=1',
        alt: 'balance',
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
      description: 'Make a transfer to an account or payee',
      image: new Image({
        url: 'https://storage.cloud.google.com/gradhack-v1.appspot.com/transfer_btw_account.png?authuser=1',
        alt: 'transfer',
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
        alt: 'payee',
      }),
    },
  }
}

const ac_or_payee = {
  items: {
    // Add the first item to the list
    'My Account': {
      synonyms: [
        'To my accounts',
        'To my current account',
        'saving account',
        'Between my account',
        'Credit card',
        'My credit card'
      ],
      title: 'My Account',
      description: 'Send money among your account, including to credit card.',
      image: new Image({
        url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/money.png',
        alt: 'Current Account',
      })
    },
    // Add the second item to the list
    'My Payee': {
      synonyms: [
        'To my payee',
        'My friend',
        'To my parent',
        'A payee',
        'Alex William',
        'Donald Trump'
    ],
      title: 'My Payee',
      description: 'To your registered payee, such as friends, family and colleagues',
      image: new Image({
        url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/piggy-bank.png',
        alt: 'Saving Account',
      })
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
        conv.ask('Perfect! How could I help you today?');
        conv.ask(new List(serviceList));
        //conv.ask(new BasicCard(fpCard))
        //setTimeout(()=>{conv.ask('Perfect! How could I help you today?')}, 1500);
    	//conv.contexts.set(appContexts.finger_print,1);	
    }
  	else{
      conv.ask("Sorry! It wasn't quite right. Could you give his/her full name again?");
      conv.contexts.set(appContexts.login_sq, 1);
    	}
  	}
  else{
  	if(full_name == 'Alex William'){
      conv.ask('Perfect! How could I help you today?');
      conv.ask(new List(serviceList));}
    else{
      conv.close("Sorry! You tried many times. Plese try again later");}
  }
});
app.intent('transfer.money', (conv,{services}, option)=>{
  conv.ask('Do you want to transfer between your account or transfer to your payee?')
  conv.ask(new List(ac_or_payee))
})
app.intent('transfer.money.payee', (conv, {Transfer_Method}, option)=>{
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
  conv.ask(new Suggestions(['Yes','No']))
})
// intent for confirming the transfer request
app.intent('transfer.money.payee.amount.yes', async(conv)=>{
  conv.ask('Please confirm the transaction with you fingerprint.')
  conv.ask(new BasicCard({
    title: 'Verify Your Identity ',
    subtitle: "Confirm your fingerprint so Banking Sir can verify it's you",
    image: {
      url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/fingerprint_GIF.gif',
      accessibilityText: 'Fingerprint Authentication',
    },
    buttons: new Button({
      title: 'Touch here to verify your fingerprint.',
      url: 'https://assistant.google.com/services/invoke/uid/00000016e2871140?intent=test.action&param.money='+conv.data.amount.amount+'&param.currency='+conv.data.amount.currency+'&param.account='+conv.data.account_from+'&param.payee='+conv.data.payee,
    display: 'WHITE',
  })
}))
  // code for calling the Open Banking API
})
app.intent('transfer.money.payee.fingerprint', async(conv, {fingerprint}) => { 
  conv.data.fpCount++;
  console.log('fqCount: ',conv.data.fpCount);
  if(conv.data.fpCount <= 3){
    if (fingerprint == 'fingerprint'){
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

        conv.ask('The transaction reference number is A34525. How could I help you further ?')
        conv.ask(new List(serviceList));
      }
      else{
        conv.ask('Transaction failed.')
        console.log('Transaction fail')
      }
      
      	//conv.ask('Perfect! How could I help you today?');	
        //conv.ask(new List(serviceList));
    }
    else if(conv.data.fpCount == 3)
       conv.close("You tried many times. Please try again after 5 mins.");
  	else{
      conv.ask("Sorry! It wasn't quite right. Could you verify again?");
      conv.contexts.set(appContexts.logon, 2);
    	}
  	}
});
app.intent('test.action', (conv, {money, currency, account, payee}) =>{
  console.log('money:',money, typeof(money))
  console.log('money:',currency, typeof(currency))
  const response = `Transfered **${currency} ${money}**  from **${account}** to **${payee}**.`
  conv.ask('Verifying the fingerprint....')
  conv.ask(`Successfully transfered ${currency} ${money}  from ${account} to ${payee}.`)
  conv.ask(new BasicCard({
    title: 'Verification Success ',
    subtitle: 'Reference Number: A12345',
    text: response,
    image: {
      url: 'https://storage.googleapis.com/gradhack-v1.appspot.com/complete_534974.png',
      accessibilityText: 'Verification Success',
    }
  }))
})
// intent for transfer request with full information
app.intent('transfer.money.btwaccount.full - yes', async(conv) => {
  const response = await axios.post('https://google.com')
  const text = await response.text()
  console.log('data:', text)
  conv.ask('Hello World!')
  conv.ask(text)
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