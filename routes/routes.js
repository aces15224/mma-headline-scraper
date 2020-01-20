const axios = require('axios');
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("../models");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://user:password1@ds151612.mlab.com:51612/heroku_4d6dqwsk";
<<<<<<< HEAD
=======

mongoose.connect(MONGODB_URI,{  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

module.exports = function (app) {
  app.get('/', function (req, res) {
    db.Article.find({saved: false}, function(err, data){
      res.render('home', { home: true, article : data });
    })
  });

  app.get('/saved', function (req, res) {
    db.Article.find({saved: true}, function(err, data){
      res.render('saved', { home: false, article : data });
    })
  });

  app.get("/api/headlines", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
    res.json(dbArticle);
    })
    .catch(function(err) {
    res.json(err);
    });
  });

  app.put("/api/headlines/:id", function(req, res){
    var saved = req.body.saved == 'true'
    if(saved){
      db.Article.updateOne({_id: req.body._id},{$set: {saved:true}}, function(err, result){
      if (err) {
        console.log(err)
      } else {
        return res.send(true)
      }
    });
    }
  });

  app.delete("/api/headlines/:id", function(req, res){
    db.Article.deleteOne({_id: req.params.id}, function(err, result){
      if (err) {
        console.log(err)
      } else {
        return res.send(true)
      }
    });
  });

  app.get("/api/fetch", function(req, res) {
    axios.get("https://mmamania.com").then(function(response) {

      var $ = cheerio.load(response.data);
    
      $(".c-entry-box--compact").each(function(i, element) {
        var result = {};
        result.headline = $(element).find("h2").text();
        result.url = $(element).find("a").attr("href");
        result.summary = $(element).find("p").text();
    

    if (result.headline !== '' && result.summary !== ''){
			db.Article.findOne({headline: result.headline}, function(err, data) {
        if(err){
          console.log(err)
        } else {
          if (data === null) {
					db.Article.create(result)
           .then(function(dbArticle) {
             console.log(dbArticle)
          })
          .catch(function(err) {
          console.log(err)
          });
				}
        console.log(data)
        }
			});
    }

  });

    res.send("Scrape completed!");
  });
  });

  app.get("/api/notes/:id", function(req, res){
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
      console.log(dbArticle.note)
      res.json(dbArticle.note)
    })
    .catch(function(err){
      res.json(err)
    })
  });

  app.post("/api/notes", function(req, res){
    db.Note.create({ noteText: req.body.noteText })
    .then(function(dbNote){
      return db.Article.findOneAndUpdate({ _id:req.body._headlineId}, 
      { $push: {note: dbNote._id} }, 
      {new: true})
    })
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err);
    })
  });

  app.delete("/api/notes/:id", function(req, res){
    console.log('reqbody:' + JSON.stringify(req.params.id))
    db.Note.deleteOne({_id: req.params.id}, function(err, result){
      if (err) {
        console.log(err)
      } else {
        return res.send(true)
      }
    });
  });

  app.get("/api/clear", function(req, res){
    db.Article.deleteMany({}, function(err, result){
      if (err) {
        console.log(err)
      } else {
        console.log(result)
        res.send(true)
      }
    })
  });
}
