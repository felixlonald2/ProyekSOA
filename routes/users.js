const express = require('express'),
      router = express.Router(),
      bodyParser = require('body-parser'),
      port = process.env.port || 3000,
    //   PORT = 3000,
      fetch = require('node-fetch'),
      db = require('../database');
const request= require('request');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51GuFJmKXe5VFGA8ZdHbRBGZZiVUlrDnoR0KtdIghwqet0v0M0ZtY9aoWx92nJuAaM7YOhgNMmpcNAguxWOEDvFG9004xuhVpZb')
const multer = require("multer");
const { default: Stripe } = require('stripe');

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

//Farrell - 217116593
router.post('/loginUser', async (req, res) => {
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
        res.send(token)
    }
    else{
        return res.status(400).json({
            status: 400,
            message: 'Username/Password tidak sesuai!'
        });
    }
});

//Farrell 217116593
router.post('/registerUser', async (req, res) => {
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

//Andika 217116574
router.post('/topup',async function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var nominal = req.body.nominal;
    var apihit;
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        return res.status(404).json({
            status: 404,
            message: "TOKEN NOT FOUND"
        });
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        return res.status(401).json({
            status: 401,
            message: "TOKEN INVALID"
        }); 
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).json({
            status: 400,
            message: "TOKEN EXPIRED"
        }); 
    }else{
        if(username==""||password==""||nominal==""){
            return res.status(400).json({
                status: 400,
                message: "FIELD TIDAK BOLEH KOSONG"
            }); 
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
                    return res.status(400).json({
                        status: 400,
                        message: "API HIT TIDAK CUKUP"
                    }); 
                }
                
            }else{
                return res.status(404).json({
                    status: 404,
                    message: "USER TIDAK DITEMUKAN"
                }); 
            }        
        }
    }
});

//Andika 217116574
router.post('/pembayaran',async function(req, res){
    var kode = req.body.kodetopup;
    const token = req.body.xauthtoken;
    
    let user = {};
    if(!token){
        res.status(404).json({
            status: 404,
            message: "Token not found"
        }); 
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        res.status(401).json({
            status: 401,
            message: "Token Invalid"
        });
    }
    var username=user.username;
    if((new Date().getTime()/1000)-user.iat>3*86400){
        res.status(400).json({
            status: 400,
            message: "Token EXPIRED"
        });
    }else{
        if(!kode||token==""){
            res.status(400).json({
                status: 400,
                message: 'FIELD tidak boleh kosong!'
            });
        }else{
            let datauser= await db.executeQuery(`
                select count(*) from users where username='${username}'
            `);
            var adauser = datauser.rows[0].count;
            if(adauser<=0){
                console.log("USER TIDAK DITEMUKAN");
                res.status(404).json({
                    status: 404,
                    message: "USER not found"
                });
            }else if (adauser > 0 ){
                console.log("USER DITEMUKAN MEMULAI PROSES CEK KODE")
                let datatopup= await db.executeQuery(`
                    select count(*) from delaytopup where kodetopup='${kode}'
                `);
                var adatagihan = datatopup.rows[0].count;
                if(adatagihan<=0){
                    res.status(404).json({
                        status: 404,
                        message: "Tagihan not found"
                    }); 
                }else{
                    console.log("KODE DITEMUKAN MEMULAI PROSES PEMBAYARAN")
                    let datasaldo= await db.executeQuery(`
                        select * from users where username='${username}'
                    `);
                    var saldo = datasaldo.rows[0].saldo;
                    let datanominal= await db.executeQuery(`
                        select * from delaytopup where kodetopup='${kode}'
                    `);
                    var nominal = datanominal.rows[0].nominal;                    
                    console.log(nominal);
                    saldo+=nominal;    
                    let qq= await db.executeQuery(`
                        update users set saldo='${saldo}' where username='${username}'
                    `);
                    let dataupdate= await db.executeQuery(`
                        select * from users where username='${username}'
                    `);
                    console.log("SALDO TELAH TERISI SEBANYAK "+nominal);
                    console.log("SALDO ANDA SEKARANG "+saldo);
                    let query= await db.executeQuery(`
                        delete from delaytopup where kodetopup='${kode}'`
                    );
                    stripe.customers.create({
                        email : req.body.stripeEmail,
                        source : req.body.stripeToken
                    })
                    .then(customer => stripe.charges.create({
                        amount : nominal,
                        description:"Tagihan Top Up Saldo",
                        currency:'usd',
                        customer:customer.id
                    }))
                    res.status(200).json({
                        status: 200,
                        message: dataupdate.rows
                    });
                }
            }
        }
    } 
});

//Felix 217116594
router.post('/addApiHit', async (req, res) => {
    var apihit = parseInt(req.body.apihit);
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        return res.status(404).json({
            status: 404,
            message: "Token not found"
        }); 
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        return res.status(401).json({
            status: 401,
            message: "Token Invalid"
        });
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

//Felix 217116594
router.post('/subscription', async (req, res) => {
    const token = req.header("x-auth-token");

    let user = {};
    if(!token){
        return res.status(404).json({
            status: 404,
            message: "Token not found"
        }); 
    }
    try{
        user = jwt.verify(token,"proyeksoa");
    }catch(err){
        return res.status(401).json({
            status: 401,
            message: "Token Invalid"
        });
    }
    if((new Date().getTime()/1000)-user.iat>3*86400){
        return res.status(400).send("Token expired");
    }
    if(user.status==1){ 
        return res.status(400).json({
            status: 400,
            message: 'Anda sudah menjadi author, tidak bisa subscribe lagi!'
        });
    }
    else{
        let username = user.username;
        let query= await db.executeQuery(`
            select * from users where username = '${username}'
        `);

        if(query.rows[0].status==1){
            return res.status(200).json({
                status: 200,
                message: 'Anda sudah menjadi author, tidak bisa subscribe lagi!'
            });
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

router.delete('/delete/:username', async (req, res) => {
    var user = req.params.username;

    let query= await db.executeQuery(`delete from users where username = '${user}'`);
    return res.status(200).json({
        status: 200,
        message: 'delete'
    });
})

router.put('/update/:username', async (req, res) => {
    var user = req.params.username;

    let query= await db.executeQuery(`update users set api_hit = ${req.body.api_hit} where username = '${user}'`);
    return res.status(200).json({
        status: 200,
        message: 'update'
    });
})

router.put('/updatee/:username', async (req, res) => {
    var user = req.params.username;

    let query= await db.executeQuery(`update users set saldo = ${req.body.saldo} where username = '${user}'`);
    return res.status(200).json({
        status: 200,
        message: 'updatee'
    });
})

router.get('/infouser/:username', async (req, res) => {
    var user = req.params.username;

    let query= await db.executeQuery(`select * from users where username = '${user}'`);
    return res.status(200).json({
        status: 200,
        message: query.rows[0]
    });
})
module.exports = router;