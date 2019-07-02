const express = require('express');
var bodyParser = require('body-parser');
const publicIp = require('public-ip');
var ip2loc = require("ip2location-nodejs");
const App = express();
// Create application/json parser
App.use(bodyParser());
App.use(bodyParser.urlencoded({extended: true}));

const sgMail = require('@sendgrid/mail');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var ObjectId = require('mongodb').ObjectID;

//initialize DB
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("hisabkhata");
  //user login data
  dbo.createCollection("user", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
  });

  //transections data
  dbo.createCollection("transections", function(err, res) {
    if (err) throw err;
    console.log("Transections Collection created!");
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
            res.send({status : "new"})
          }else{
            res.send({status: "old"})
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


//Login A User
App.post('/login',(req,response)=>{

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
  
    var dbo = db.db("hisabkhata");
    dbo.collection("user").findOne({PhoneNumber : req.body.number,pin : req.body.pin}, function(err, result) {
      if (err) throw err;
      db.close();

      if(result === null){
        response.send({status : "failed",result})
      }else{
        response.send({status: "success",result})
      }
    });
    
  });
});



//Save Transections Data
App.post('/addTransections',(req,response)=>{

  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
    
      var dbo = db.db("hisabkhata");
      var transectionsDetails = {
        tansectionTitle : req.body.tansectionTitle,
        tansectionDate : req.body.tansectionDate,
        unit : req.body.unit,
        quantity : req.body.quantity,
        quantityPrice : req.body.quantityPrice,
        totalPrice : req.body.totalPrice,
        transectionsStatus : req.body.transectionsStatus,
        paidAmount : req.body.paidAmount,
        due : req.body.due,
        phoneNumber : req.body.phoneNumber,
        type : req.body.type
      }

      if(!req.body.type || !req.body.phoneNumber || req.body.phoneNumber === ""){
        response.send({status : 'failed'})
      }else{

        dbo.collection("user").findOne({PhoneNumber : req.body.phoneNumber}, function(err, result) {
          if (err) throw err;
          

          if(result === null){
            response.send({status : "notExist"})
            db.close();
          }else{
            dbo.collection("transections").insertOne(transectionsDetails, function(err, res) {
              if (err) throw err;
              
              db.close();
              response.send({status:'success',transectionsDetails})
            });
            
          }
        });
      }
    });
});




//Find Transection by keyword
App.post('/findTransections',(req,res)=>{

  let filterObject;

  if(req.body.type==="all"){
    filterObject = {
      phoneNumber : req.body.phoneNumber
    }
  }else{
    filterObject = {
      phoneNumber : req.body.phoneNumber,
      type : req.body.type
    }
  }
  var mysort = { _id: -1 };

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("hisabkhata");
    dbo.collection("transections").find(filterObject).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      db.close();

      if(result.length < 1){
        res.send({status : "No Data"})
      }else{
        res.send({status: "success",result})
      }

    });
  });



});


//update a transections
App.post('/updateTransection',(req,response)=>{

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("hisabkhata");
    var myquery = { _id: ObjectId(req.body.id) };
    var newvalues = { $set: {paidAmount: req.body.paidAmount, due: req.body.due } };
    dbo.collection("transections").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
  
      response.send({status: "success"});
    
      db.close();


    });
  });

});


//Delete a transections
App.post('/deleteTransection',(req,response)=>{

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("hisabkhata");
    var myquery = { _id: ObjectId(req.body.id) };
  dbo.collection("transections").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    
    response.send({status: "success"});
  
      db.close();


    });
  });

});


//Get Ip adress

App.get('/getIP', getClientIP);

function getClientIP(req, res, next) {
  var ip = req.ip;
  res.send(ip);
}


App.get('/getNN', getClientNN);

function getClientNN(req, res, next) {
      sgMail.setApiKey("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");
    const msg = {
      to: 'sunnysultan1640@gmail.com',
      from: 'info@adfendo.com',
      subject: 'Sending with Twilio SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail.send(msg);

    res.send("sent");
}





App.listen("3001",()=>console.log("Connected !!"));