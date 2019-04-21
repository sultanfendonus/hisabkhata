const express = require('express');
var bodyParser = require('body-parser');
const App = express();
// Create application/json parser
App.use(bodyParser());
App.use(bodyParser.urlencoded({extended: true}));

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//initialize DB
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("hisabkhata");
  dbo.createCollection("user", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});



//Check The Phone Number is that exist or not
App.post('/checkNumber',(req,res)=>{

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
      
        var dbo = db.db("hisabkhata");
        dbo.collection("user").findOne({PhoneNumber : req.body.number}, function(err, result) {
          if (err) throw err;
          db.close();

          if(result === null){
            res.send({status : "new",result})
          }else{
            res.send({status: "old",result})
          }
        });
        
      });
});


//Register A User
App.post('/registration',(req,response)=>{

  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
    
      var dbo = db.db("hisabkhata");
      var userDetails = {
        FullName : "",
        PhoneNumber : req.body.number,
        pin : req.body.pin,
        BusinessType : "",
        Token : ""
      }

      if(!req.body.number || !req.body.pin){
        response.send({status : 'failed'})
      }else{
        dbo.collection("user").insertOne(userDetails, function(err, res) {
          if (err) throw err;
          
          db.close();
          response.send({status:'success',userDetails})
        });
      }
      
      
      
    });
});












App.listen("3001",()=>console.log("Connected !!"));