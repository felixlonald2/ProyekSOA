const express = require('express'),
      app = express(),
      port = process.env.port || 3000,
      bodyParser = require('body-parser'),
      fetch = require('node-fetch'),
      db = require('./database');

const request= require('request');
const jwt = require('jsonwebtoken');
// app.set("view engine","ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
//     next();
//   });

app.get('/', async (req, res) => {
    let query= await db.executeQuery(`
        select * from users
    `);

    return res.status(200).json({
        status: 200,
        user: query.rows
    });
});
app.get('/tab',async function(req, res){
    let query= await db.executeQuery(`
        select * from delaytopup
    `);

    return res.status(200).json({
        status: 200,
        user: query.rows
    });
});
app.post('/api/del',async function(req, res){
    let query= await db.executeQuery(`
        delete from delaytopup where kodetopup like '%T%'`
    );
    console.log("BERHASIL")
});
app.post('/api/topup',async function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var nominal = req.body.nominal;
    let query= await db.executeQuery(`
        select count(*) from users where username='${username}' and password='${password}'`
    );
    var jumlah = query.rows[0].count;
    if(jumlah > 0){
        let q1= await db.executeQuery(`
            select count(*) from delaytopup
        `);
        var kode = "";
        var jumcode=q1.rows[0].count;
        jumcode++;
        if(jumcode >= 0 && jumcode < 10){
            kode = "TU00"+jumcode;
            console.log(kode);
        }else if(jumcode >= 10 && jumcode < 100){
            kode = "TU0"+jumcode;
            console.log(kode);
        }else{
            kode = "TU"+jumcode;
            console.log(kode);
        }
        let q2= await db.executeQuery(`
                insert into delaytopup values ('${kode}','${nominal}')
        `);
        return res.status(200).json({
            status: 200,
            username : username,
            kode_top_up : kode,
            nominal_top_up  : nominal
        });
         
    }
});
app.post('/api/pembayaran',async function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var kode = req.body.kodetopup;
    let datauser= await db.executeQuery(`
        select count(*) from users where username='${username}' and password='${password}'
    `);
    var adauser = datauser.rows[0].count;
    if(adauser<=0){
        console.log("TIDAK DITEMUKAN USER");
        return res.status(200).send("USER TIDAK DITEMUKAN")
    }else if (adauser > 0 ){
        console.log("USER DITEMUKAN MEMULAI PROSES CEK KODE")
        let datatopup= await db.executeQuery(`
            select count(*) from delaytopup where kodetopup='${kode}'
        `);
        var adatagihan = datatopup.rows[0].count;
        if(adatagihan<=0){
            console.log("TIDAK DITEMUKAN TAGIHAN");
            return res.status(200).send("TAGIHAN TIDAK DITEMUKAN")
        }else{
            console.log("KODE DITEMUKAN MEMULAI PROSES PEMBAYARAN")
            let datasaldo= await db.executeQuery(`
                select * from users where username='${username}' and password='${password}'
            `);
            var saldo = datasaldo.rows[0].saldo;
            let datanominal= await db.executeQuery(`
                select * from delaytopup where kodetopup='${kode}'
            `);
            var nominal = datanominal.rows[0].nominal;
            console.log(nominal);
            saldo+=nominal;    
            let qq= await db.executeQuery(`
                update users set saldo='${saldo}' where username='${username}' and password='${password}'
            `);
            let dataupdate= await db.executeQuery(`
                select * from users where username='${username}' and password='${password}'
            `);
            console.log("SALDO TELAH TERISI SEBANYAK "+nominal);
            console.log("SALDO ANDA SEKARANG "+saldo);
            let query= await db.executeQuery(`
                delete from delaytopup where kodetopup='${kode}'`
            );
            return res.status(200).json({
                status: 200,
                user: dataupdate.rows
            }); 
            
        }
    }
    
});
app.post('/api/registerUser', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var nama = req.body.nama;

    let query= await db.executeQuery(`select * from users where username= '${username}'`);
    if(query.length <= 0){
        if(username != "" && password != "" && nama != ""){
            let query= await db.executeQuery(`insert into users values('${username}','${password}','${nama}','0','0','50')`);
            return res.status(200).json({
                status: 200,
                message: 'Berhasil Register User'
            });
        }
        else{
            return res.status(400).json({
                status: 400,
                message: 'Field Tidak Boleh ada yang kosong'
            });
        }
    }
    else{
        return res.status(400).json({
            status: 400,
            message: 'Username sudah terpakai!'
        });
    }
});

app.post('/api/loginUser', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var status;

    let query= await db.executeQuery(`select * from users where username = '${username}' and password='${password}'`);
    if(query.length > 0){
        status = query[0].status;
        const token = jwt.sign({    
            "username":username,
            "status":status
        }   ,"217116592",{ expiresIn: 86400});
        return res.status(200).json({
            status: 200,
            message: query[0].password
        });
    }
    else{
        return res.status(400).json({
            status: 400,
            message: 'Username/Password tidak sesuai!'
        });
    }
});

app.get('/api/getHeadlines/:country',async (req,res)=>{
    var country = req.params.country;
    var options ={
      'method' : 'GET',
      'url' : 'https://newsapi.org/v2/top-headlines?country='+country+'&apiKey=dc49dba7bedd4a40afdad7b3638dc843'
    };
    request(options, function(error,response){
      if(error) throw new Error(error);
      var tmp = JSON.parse(response.body);
      console.log(tmp.articles);
      res.status(200).send(tmp.articles);
    });
});

app.get('/api/getHeadlines/:country/:category',async (req,res)=>{
    var country = req.params.country;
    var category = req.params.category;
    var options ={
      'method' : 'GET',
      'url' : 'https://newsapi.org/v2/top-headlines?country='+country+'&category='+ category +'&apiKey=dc49dba7bedd4a40afdad7b3638dc843'
    };
    request(options, function(error,response){
      if(error) throw new Error(error);
      var tmp = JSON.parse(response.body);
      console.log(tmp.articles);
      res.status(200).send(tmp.articles);
    });
});

// app.get('/api/portal/:kode',async function(req, res){
//     const result = await fetch(`
//     http://newsapi.org/v2/top-headlines?country=${req.params.kode}&apiKey=d6fb52f26bd34ab48dc3416445d12a1a
//     `);

//     const data= await result.json();
//     const dataFilter = data.articles;

//     res.render("home/index",{data:dataFilter,kode:req.params.kode});
// });

// app.get('/api/filter/:filter',async function(req, res){
//     const result = await fetch(`
//     http://newsapi.org/v2/top-headlines?category=${req.params.filter}&apiKey=d6fb52f26bd34ab48dc3416445d12a1a
//     `);

//     const data= await result.json();
//     const dataFilter = data.articles;

//     res.render("home/index",{data:dataFilter});
// }); 

// app.post('/api/search',async function(req, res){

//     var key = req.body.key;
//     var sort = req.body.sort;

//     const result = await fetch(`
//     https://newsapi.org/v2/everything?q=${key}&apiKey=d6fb52f26bd34ab48dc3416445d12a1a&sortBy=${sort}
//     `);

//     const data= await result.json();
//     const dataFilter = data.articles;

//     res.render("home/index",{data:dataFilter});
// }); 

// app.post('/api/detail',async function(req, res){
    
// }); 

app.listen(3000||process.env.PORT);
console.log("Listening port 3000....")

