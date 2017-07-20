require('dotenv').config();
const bodyParser = require('body-parser');
const qRoutes = require('express').Router();

qRoutes.use(bodyParser.json());
qRoutes.use(bodyParser.urlencoded({
  extended: true
}));
const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

qRoutes.post("/new", (req,res)=>{
  knex("questions").select("admin","question", "responses").insert(req.body).then(list=>{
    //now we need to actually send the question to the related people.  So we need a function to grab the users from an array
    res.send(list);
  })
})

module.exports=qRoutes;