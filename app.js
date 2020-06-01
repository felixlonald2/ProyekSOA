const express = require('express'),
      app = express(),
      port = process.env.port || 3000,
      bodyParser = require('body-parser'),
      fetch = require('node-fetch'),
      db = require('./database');
const request= require('request');
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

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

app.post('/api/topup',async function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var nominal = req.body.nominal;
    var apihit;
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }else{
        if(username==""||password==""||nominal==""){
            return res.status(400).send("FIELD TIDAK BOLEH KOSONG")
        }else{
            let query= await db.executeQuery(`
                select count(*) from users where username='${username}' and password='${password}'`
            );
            var jumlah = query.rows[0].count;
            if(jumlah > 0){
                let cekapihit= await db.executeQuery(`
                    select * from users where username='${username}' and password='${password}'`
                );
                apihit = cekapihit.rows[0].api_hit;
                if(apihit > 0){
                    apihit--;
                    let qq= await db.executeQuery(`
                        update users set api_hit='${apihit}' where username='${username}' and password='${password}'
                    `);
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
                        api_hit : apihit,
                        kode_top_up : kode,
                        nominal_top_up  : nominal
                    });
                }else{
                    res.status(400).send("API HIT TIDAK CUKUP");
                }
                
            }else{
                res.status(400).send("USER TIDAK DITEMUKAN")
            }        
        }
    }
    
});

app.post('/api/pembayaran',async function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var kode = req.body.kodetopup;
    var apihit;
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }else{
        if(username==""||password==""||nominal==""){
            return res.status(400).send("FIELD TIDAK BOLEH KOSONG")
        }else{
            let datauser= await db.executeQuery(`
                select count(*) from users where username='${username}' and password='${password}'
            `);
            var adauser = datauser.rows[0].count;
            if(adauser<=0){
                console.log("TIDAK DITEMUKAN USER");
                return res.status(400).send("USER TIDAK DITEMUKAN")
            }else if (adauser > 0 ){
                console.log("USER DITEMUKAN MEMULAI PROSES CEK KODE")
                let cekapihit= await db.executeQuery(`
                    select * from users where username='${username}' and password='${password}'`
                );
                apihit = cekapihit.rows[0].api_hit;
                if(apihit<=0){
                    return res.status(400).send("API HIT TIDAK CUKUP")
                }else{
                    apihit--;
                    let datatopup= await db.executeQuery(`
                        select count(*) from delaytopup where kodetopup='${kode}'
                    `);
                    var adatagihan = datatopup.rows[0].count;
                    if(adatagihan<=0){
                        console.log("TIDAK DITEMUKAN TAGIHAN");
                        return res.status(400).send("TAGIHAN TIDAK DITEMUKAN")
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
                            update users set saldo='${saldo}',api_hit='${apihit}' where username='${username}' and password='${password}'
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
            }
        }
    } 
});

app.post('/api/registerUser', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var nama = req.body.nama;

    let query= await db.executeQuery(`select * from users where username= '${username}'`);
    if(query.rows.length <= 0){
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
    let query= await db.executeQuery(`select count(*) from users where username = '${username}' and password='${password}'`);
    if(query.rows[0].count > 0){
        let query1= await db.executeQuery(`select * from users where username = '${username}' and password='${password}'`);
        status = query1.rows[0].status;
        console.log(status)
        const token = jwt.sign({    
            "username":username,
            "status":status
        }   ,"proyeksoa",{ expiresIn: 86400});
        return res.status(200).send(token);
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
    const token = req.header("x-auth-token");
    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }else{
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
    }
});

app.get('/api/getHeadlines/:country/:category',async (req,res)=>{
    var country = req.params.country;
    var category = req.params.category;
    const token = req.header("x-auth-token");
    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }else{
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
    }
});

app.post('/api/addApiHit', async (req, res) => {
    var apihit = parseInt(req.body.apihit);
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }
    else{
        if(!parseInt(apihit)){
            return res.status(400).json({
                status: 400,
                message: 'Apihit tidak boleh kosong!'
            });
        }
        else{
            let username = user.username;
            let total = apihit*500;

            let query= await db.executeQuery(`
                select saldo from users where username = '${username}'
            `);

            let saldosekarang = query.rows[0].saldo-total;

            if(query.rows[0].saldo-total>=0){
                let query= await db.executeQuery(`
                    select api_hit from users where username = '${username}'
                `);

                let apihittotal = query.rows[0].api_hit+apihit;
                
                let query2= await db.executeQuery(`
                    update users set saldo='${saldosekarang}', api_hit = '${apihittotal}' where username = '${username}'
                `);

                return res.status(200).json({
                    status: 200,
                    message: 'Api Hit berhasil ditambahkan sebesar '+apihit+', Saldo anda terpotong sebesar Rp.'+total
                });
            }
            else{
                return res.status(400).json({
                    status: 400,
                    message: 'Saldo anda tidak cukup, Saldo anda : Rp.'+query.rows[0].saldo+', Harga ApiHit yang harus dibayar adalah Rp.'+total
                });
            }
        }
    }
});

app.post('/api/subscription', async (req, res) => {
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }
    if(user.status==1){ 
        return res.status(400).send("Anda sudah menjadi author, tidak bisa subscribe lagi!")
    }
    else{
        let username = user.username;
        let query= await db.executeQuery(`
            select * from users where username = '${username}'
        `);

        if(query.rows[0].status==1){
            return res.status(400).send("Anda sudah menjadi author, tidak bisa subscribe lagi!")
        }
        else{
            let query= await db.executeQuery(`
                select saldo from users where username = '${username}'
            `);
    
            let saldosekarang = query.rows[0].saldo-150000;
    
            if(query.rows[0].saldo-150000>=0){
                let query= await db.executeQuery(`
                    update users set status=1, saldo=${saldosekarang} where username = '${username}'
                `);
    
                return res.status(200).json({
                    status: 200,
                    message: 'Anda berhasil subscribe dan menjadi author, anda dapat membuat berita baru!'
                });
            }
            else{
                return res.status(400).json({
                    status: 400,
                    message: 'Saldo anda tidak cukup, Saldo anda : Rp.'+query.rows[0].saldo+', Untuk subscribe anda harus membayar Rp.200000'
                });
            }
        }
    }
});

app.get('/api/getcomment', async (req, res) => {
    var title = req.body.title;
    const token = req.header("x-auth-token");
    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }else{
        if(title==""){
            return res.status(400).send("FIELD TIDAK BOLEH KOSONG")
        }else{
            let query= await db.executeQuery(`
                select count(*) from comment where title_berita='${title}'`
            );
            var jumlah = query.rows[0].count;
            console.log("CHECKING TITLE....")
            if(jumlah <= 0){
                console.log("TITLE TIDAK DITEMUKAN")
                res.status(400).send("TITLE BERITA TIDAK DITEMUKAN")
            }else{
                console.log("TITLE DITEMUKAN")
                console.log("MENAMPILKAN COMMENT....")
                let qq= await db.executeQuery(`
                    select * from comment where title_berita='${title}'`
                );
                res.status(200).json({
                    status: 200,
                    Title : title,
                    comment  : qq.rows
                });
                console.log("COMMENT TELAH DITAMPILKAN DI POSTMAN")
            }
            
        }   
    }
});

app.post('/api/comment', async (req, res) => {
    var title = req.body.title;
    var isi = req.body.isiberita;
    const token = req.header("x-auth-token");
    var apihit;
    let user = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }else{
        var username = user.username;
        if(isi==""||title==""){
            return res.status(400).send("FIELD TIDAK BOLEH KOSONG")
        }else{
            let query= await db.executeQuery(`
                select count(*) from comment where title_berita='${title}'`
            );
            var jumlah = query.rows[0].count;
            if(jumlah <= 0){
                res.status(400).send("TITLE BERITA TIDAK DITEMUKAN")
            }else{
                try{
                    let qq= await db.executeQuery(`
                        insert into comment values('${title}','${isi}','${username}')
                    `);               
                    let cekapihit= await db.executeQuery(`
                        select * from users where username='${username}'`
                    );
                    apihit = cekapihit.rows[0].api_hit;
                    if(apihit<=0){
                        return res.status(400).send("API HIT TIDAK CUKUP")
                    }else{
                        apihit--;
                        let qapi= await db.executeQuery(`
                                update users set api_hit='${apihit}' where username='${username}'
                        `);
                        return res.status(200).json({
                            status: 200,
                            username: username,
                            api_hit_sisa: apihit,
                            title_berita : title,
                            isi_berita : isi,
                            message : "COMMENT BERHASIL"
                        }); 
                    }
                    
                }catch(err){
                    res.status(401).send("COMMENT GAGAL");
                }             
            }
            
        }   
    }
});

app.listen(3000,function(){
    console.log("Listening port 3000....")
});