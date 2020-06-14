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
let tampungancomment={}
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

        let query= await db.executeQuery(`
                select * from berita
        `);

        var berita = query.rows;
        var articles = [];

        request(options, function(error,response){
            if(error) throw new Error(error);
            var tmp = JSON.parse(response.body);
            
            articles = tmp.articles;

            articles.forEach(element => {
                berita.push(element)
            });
    
            res.status(200).send(berita);
        });
        

        
    }
});
//farrell
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

app.get('/api/getcomment/:id_title', async (req, res) => {
    var idtitle = req.params.id_title;
    const token = req.header("x-auth-token");
    let tampungan;
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
        if(idtitle==""){
            return res.status(400).json({
                status: 400,
                message: "FIELD TIDAK BOLEH KOSONG"
            }); 
        }else{
            let query= await db.executeQuery(`
                select count(*) from title where id='${idtitle}'`
            );
            var jumlah = query.rows[0].count;
            console.log("CHECKING TITLE....")
            if(jumlah <= 0){
                console.log("TITLE TIDAK DITEMUKAN")
                return res.status(404).json({
                    status: 404,
                    message: "TITLE BERITA TIDAK DITEMUKAN"
                }); 
            }else{
                console.log("TITLE DITEMUKAN")
                console.log("MENAMPILKAN COMMENT....")
                let qq= await db.executeQuery(`
                    select * from comment where id_title='${idtitle}'`
                );
                res.status(200).json({
                    status: 200,
                    berita  : tampungancomment,
                    comment  : qq.rows
                });
                console.log("COMMENT TELAH DITAMPILKAN DI POSTMAN")
            }
            
        }   
    }
});
//andika
app.post('/api/comment/:titleberita', async (req, res) => {
    var title = req.params.titleberita;
    var komen = req.body.comment;
    const token = req.header("x-auth-token");
    var apihit;
    let isikomentar={};
    let tampunganberita={};
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
        var username = user.username;
        if(komen==""||title==""){
            return res.status(400).json({
                status: 400,
                message: "FIELD TIDAK BOLEH KOSONG"
            }); 
        }else{                     
            let query= await db.executeQuery(`
                select count(*) from title where title='${title}'`
            );
            var jumlah = query.rows[0].count;
            if(jumlah <= 0){
                return res.status(404).json({
                    status: 404,
                    message: "TITLE BERITA NOT FOUND",
                    WARNING1: "COBALAH MENGGUNAKAN TITLE LENGKAP",
                    WARNING2 : "TITLE LENGKAP YANG DIGUNAKAN ADALAH ROWS PERTAMA DARI ENDPOINT searchnews by keyword",
                    saran : "Jika anda tidak mengetahui title lengkap suatu berita silahkan gunakan endpoint searchnews by keyword"
                })
            }else{
                let quetitle= await db.executeQuery(`
                    select * from title where title='${title}'`
                ); 
                idtitleberita = quetitle.rows[0].id;
                try{                                   
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
                        let qq= await db.executeQuery(`
                            insert into comment values('${idtitleberita}','${komen}','${username}')
                        `);
                        let quecoment= await db.executeQuery(`
                            select * from comment where id_title='${idtitleberita}'`
                        );
                        isikomentar=quecoment.rows;
                        var options ={
                            'method' : 'GET',
                            'url' : 'https://newsapi.org/v2/top-headlines?q='+title+'&apiKey=dc49dba7bedd4a40afdad7b3638dc843'
                        };
                        request(options, function(error,response){
                            if(error) throw new Error(error);
                            var tmp = JSON.parse(response.body);            
                            tampunganberita=tmp.articles;
                            console.log(tampunganberita);
                        });             
                        return res.status(200).json({
                            status: 200,
                            message : "COMMENT BERHASIL",
                            berita : tampunganberita[0],
                            comment : isikomentar
                            
                        }); 
                    }                    
                }catch(err){
                    return res.status(401).json({
                        status: 401,
                        message: "COMMENT GAGAL"
                    })
                }             
            }
            
        }   
    }
});
//albert
app.post('/api/insertNews', uploads.single("gambar"), async (req, res) => {
    var judul = req.body.judul;
    var deskripsi = req.body.deskripsi;
    var isi = req.body.isi;
    var tanggal = new Date().toISOString();
    var id_negara = req.body.id_negara;
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
        let query= await db.executeQuery(`select * from berita where judul= '${judul}'`);
        let query1= await db.executeQuery(`select id from berita order by 1 desc`);
        let author = user.username;
        if(query.rows.length <= 0){
            if(author != "" && judul != "" && deskripsi != "" && isi != "" && id_negara != ""){
                var id_news = query1.rows[0].id +1
                let query= await db.executeQuery(`insert into berita values('${id_news}','${author}','${judul}','${deskripsi}','${isi}','${tanggal}','public/uploads/${req.file.filename}','${id_negara}')`);
                return res.status(200).json({
                    status: 200,
                    message: 'Berhasil Insert Berita'
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
                message: 'Berita sudah ada!'
            });
        }
    }
    else{
        return res.status(404).json({
            status: 400,
            message: 'Bukan Author!'
        });
    }
    
});
//albert
app.get('/api/getAuthorNews', async (req, res) => {
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

    let author = user.username;
    if(user.status==1){ 
        let query= await db.executeQuery(`select * from berita where author= '${author}'`);
        if(query.rows.length<=0){
            return res.status(404).json({
                status: 400,
                message: 'Tidak mempunyai berita !'
            });
        }
        else{
            return res.status(200).json({
                status: 200,
                berita: query.rows
            });
        }
    }
    else{
        return res.status(404).json({
            status: 400,
            message: 'Bukan Author!'
        });
    }
});
//albert
app.delete('/api/deleteNews', async (req, res) => {
    var id_news = req.body.id_news;
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

    let author = user.username;
    if(id_news != ""){
        if(user.status==1){ 
            let query= await db.executeQuery(`select * from berita where author='${author}' and id=${id_news}`);
            if(query.rows.length<=0){
                return res.status(404).json({
                    status: 404,
                    message: 'Berita tidak ditemukan !'
                });
            }
            else{
                let query1= await db.executeQuery(`delete from berita where author='${author}' and id=${id_news}`);
                return res.status(200).json({
                    status: 200,
                    message: 'Berhasil delete berita !'
                });
            }
        }
        else{
            return res.status(404).json({
                status: 400,
                message: 'Bukan Author!'
            });
        }
    }
    else{
        return res.status(404).json({
            status: 400,
            message: 'Field tidak boleh kosong!'
        });
    }
    
});
//albert
app.put('/api/updateNews', uploads.single("gambar"), async (req, res) => {
    var id_news = req.body.id_news;
    var judul = req.body.judul;
    var deskripsi = req.body.deskripsi;
    var isi = req.body.isi;
    var tanggal = Date.now();
    var id_negara = req.body.id_negara;
    
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

    let author = user.username;
    if(id_news != "" && author != "" && judul != "" && deskripsi != "" && isi != "" && id_negara != ""){
        if(user.status==1){ 
            let query= await db.executeQuery(`select * from berita where author= '${author}' and id=${id_news}`);
            if(query.rows.length<=0){
                return res.status(404).json({
                    status: 404,
                    message: 'Berita tidak ditemukan !'
                });
            }
            else{
                let query1= await db.executeQuery(`update berita set author='${author}',judul='${judul}',deskripsi='${deskripsi}',isi='${isi}',tanggal=to_timestamp(${Date.now()} / 1000.0),foto='public/uploads/${req.file.filename}',id_negara='${id_negara}' where id=${id_news}`);
                return res.status(200).json({
                    status: 200,
                    message: 'Berhasil update berita !'
                });
            }
        }
        else{
            return res.status(404).json({
                status: 400,
                message: 'Bukan Author!'
            });
        }
    }
    else{
        return res.status(404).json({
            status: 400,
            message: 'Field tidak boleh kosong!'
        });
    }
});
//felix
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
            var articles = tmp.articles;
            res.status(200).send(articles);
        });
    }
});
//felix
app.get('/api/searchnews/:keyword',async (req,res)=>{
    var keyword = req.params.keyword;
    const token = req.header("x-auth-token");
    let tampunganberita = {};
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
            'url' : 'https://newsapi.org/v2/top-headlines?q='+keyword+'&apiKey=dc49dba7bedd4a40afdad7b3638dc843'
        };
        request(options, function(error,response){
            if(error) throw new Error(error);
            var tmp = JSON.parse(response.body);            
            tampunganberita=tmp.articles;
            console.log(tmp.articles);
        });
        let q1= await db.executeQuery(`
            select count(*) from title
        `);
        var jumcode=q1.rows[0].count;
        jumcode++;
        let cek= await db.executeQuery(`
            select count(*) from title where title='${tampunganberita[0].title}'`
        );
        var jumlah = cek.rows[0].count;
        var consolog=tampunganberita[0].title;
        var iduntukcomment = jumcode;
        if(jumlah <= 0){
            let q2= await db.executeQuery(`
                insert into title values ('${jumcode}','${tampunganberita[0].title}')
            `); 
            console.log("DATABASE DENGAN TITLE '"+consolog+"' DIMASUKKAN KEDALAM DATABASE!!")
            console.log("JIKA INGIN COMMENT GUNAKAN ENDPOINT COMMENT & MASUKKAN IDTITLE = '"+jumcode+"' TERSEBUT")
            tampungancomment=tampunganberita[0];
        }else{
            let qtit= await db.executeQuery(`
                select * from title where title='${consolog}'
            `);
            iduntukcomment=qtit.rows[0].id;
            tampungancomment=tampunganberita[0];
            console.log("DATABASE DENGAN ID_TITLE '"+iduntukcomment+"' SUDAH ADA TINGGAL COMMENT SAJA")
        }        
        return res.status(200).json({
            status: 200,
            id_title_untuk_comment:iduntukcomment,
            berita: tampunganberita
        })
    }
});
//felix
app.get('/api/getNews', async (req, res) => {
    let query= await db.executeQuery(`
        select * from berita
    `);
    return res.status(200).json({
        status: 200,
        berita: query.rows
    });
});


app.listen(process.env.PORT,function(){
    console.log("Listening to port "+process.env.PORT);
});