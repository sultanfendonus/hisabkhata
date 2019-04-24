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

      if(!req.body.type || !req.body.phoneNumber){
        response.send({status : 'failed'})
      }else{
        dbo.collection("transections").insertOne(transectionsDetails, function(err, res) {
          if (err) throw err;
          
          db.close();
          response.send({status:'success',transectionsDetails})
        });
      }
      
      

    });
});











App.listen("3001",()=>console.log("Connected !!"));