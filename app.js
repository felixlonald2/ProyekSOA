const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      port = process.env.port || 3000,
    //   PORT = 3000,
      fetch = require('node-fetch'),
      db = require('./database');
const request= require('request');
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use("/api/users",require("./routes/users"))
app.use("/api/news",require("./routes/news"))
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,"./public/uploads");
    },
    filename : function(req,file,callback){
        const filename = file.originalname.split(".");
        const extension = filename[1];
        callback(null,Date.now()+"."+extension);
    }
});
const uploads = multer({
    storage: storage
});


app.get('/', async (req, res) => {
    console.log("CHECK USER....")
    let query= await db.executeQuery(`
        select * from users
    `);
    console.log("MENAMPILKAN USER....")
    return res.status(200).json({
        status: 200,
        user: query.rows
    });
});

//felix
app.get('/api/getNews', async (req, res) => {
    let query= await db.executeQuery(`
        select * from berita
    `);
    var berita = query.rows;
    var tampung = [];

    for (let i = 0; i < berita.length; i++) {
        const beritabaru = {
            Judul_berita : berita[i].judul,
            Deskripsi_berita : berita[i].deskripsi,
            Publish : berita[i].tanggal
        }
        tampung.push(beritabaru);
    }

    res.status(200).send(tampung)
});


app.listen(process.env.PORT,function(){
    console.log("Listening to port "+process.env.PORT);
});