const conf = require("../config");

let Twilio = require("twilio")
let client = new Twilio(conf.TWILIO_SID, conf.TWILIO_AUTH);
const mRoutes = require('express').Router();
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
const Auth = require("../functions/auth");
const fetchAdminQuestions = require('../functions/fetchAdminQuestions');
const fetchUserWithPhonenumber = require('../functions/fetchUser');
const MessageReducer = require("../functions/messageReducer");

mRoutes.use(bodyParser.json());
mRoutes.use(bodyParser.urlencoded({
  extended: true
}));
mRoutes.use("/post",MessageReducer);
//mRoutes.use("/send",Auth);
// mRoutes.use(Auth);
const knex = require('../functions/knex')()

mRoutes.get('/:id', (req, res) => {
  return fetchAdminQuestions(req.params.id).then(j => res.status(200).json(j))
  .catch(err => {
    console.error(err);
    res.status(200).send('No questions found for this admin');
  });
});

mRoutes.post("/send",(req,res,next)=>{
  let arr = JSON.parse(req.body.phone);
  let phone = parseInt(arr[0]);

  //console.log(phone);
  client.messages.create({
    to:req.body.phone,
    body: req.body.message,
    from: conf.TWILIO_PHONE,
    statusCallback: `${conf.URL}/api/messages`
  }).then(msgID => {
    //console.log('inside knex write', msgID);
    knex('questions')
      .insert({admin: 1, question: req.body.message, responses: ['hello'], users:req.body.id, msgsid: msgID.sid})
      .catch(err => console.error(err));
    return msgID;
  }).then((msgID)=>{
    // console.log(msgID)
    res.status(200).json({
      message: 'Sent the message "' + req.body.message + '", good job!',
      messageID: msgID.sid
    });
  }).catch((err,msg)=>{
    console.log(err);
  })
});

mRoutes.post('/post', (req, res) => {
  console.log("req.body.MessageSid-------------->");
  console.log(req.body);
  client.messages(req.body.MessageSid).fetch().then(sms =>{
    console.log("sms is.....................")
    console.log(sms);
    return fetchUserWithPhonenumber(sms.from.substring(1)).then(data => {
      knex('questions').where('users', data.id).update({responses: sms.body});
    }).then (()=> res.status(200).send('ok'));
  //   knex('questions').where('id', 1).update({responses: sms.body});
  // }).then(()=> res.status(200).json({message: 'ok'}))
  }).catch(err => console.error(err));

});

mRoutes.get("/get/:messageID", (req,res,next)=>{
  client.messages(req.params.messageID).fetch().then(msg=>{
    console.log(msg.body)
    res.status(200).json({message:msg.body});
  })
})

module.exports = mRoutes;
