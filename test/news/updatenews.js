const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/news/updateNews';

let token;
let token2;
before((done) => {
    chai.request("http://localhost:3000")
        .post('/api/users/loginUser')
        .send({
            username: 'albert',
            password: 'abe' 
        })
        .end((err, res) => {
            token= res.text;
        done();
    });
});

before((done) => {
    chai.request("http://localhost:3000")
        .post('/api/users/loginUser')
        .send({
            username: 'lonald',
            password: 'asd' 
        })
        .end((err, res) => {
            token2= res.text;
        done();
    });
});

it('Token tidak ada', (done) => {
    chai.request("http://localhost:3000")
        .put(endpoint)
        .send({
            id_news : 1,
            judul : "asd",
            deskripsi : "asd",
            isi : "asd",
            id_negara : "id",
            kategori : "health"
        })
        .end((err, res) => {
            res.should.have.status(404);
            res.text.should.eql('Token not found')
        done();
        });
}).timeout(10000);

it('Token salah', (done) => {
    chai.request("http://localhost:3000")
        .put(endpoint)
        .set("x-auth-token","kokokokoko")
        .send({
            id_news : 1,
            judul : "asd",
            deskripsi : "asd",
            isi : "asd",
            id_negara : "id",
            kategori : "health"
        })
        .end((err, res) => {
            res.should.have.status(401);
            res.text.should.eql('Token Invalid')
        done();
        });
}).timeout(10000);

it('Berita yang akan diupdate tidak ditemukan!', (done) => {
    chai.request("http://localhost:3000")
        .put(endpoint)
        .set("x-auth-token",token)
        .send({
            id_news : 50,
            judul : "asd",
            deskripsi : "asd",
            isi : "asd",
            id_negara : "id",
            kategori : "health"
        })
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('Berita tidak ditemukan !');
        done();
        });
}).timeout(10000);

it('Bukan author!', (done) => {
    chai.request("http://localhost:3000")
        .put(endpoint)
        .set("x-auth-token",token2)
        .send({
            id_news : 1,
            judul : "asd",
            deskripsi : "asd",
            isi : "asd",
            id_negara : "id",
            kategori : "health"
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Bukan Author!');
        done();
        });
}).timeout(10000);

it('Field Kosong!', (done) => {
    chai.request("http://localhost:3000")
        .put(endpoint)
        .set("x-auth-token",token)
        .send({
            id_news : "",
            judul : "",
            deskripsi : "",
            isi : "",
            id_negara : "",
            kategori : ""
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Field tidak boleh kosong!');
        done();
        });
}).timeout(10000);

it('Berhasil update berita', (done) => {
    chai.request("http://localhost:3000")
        .put(endpoint)
        .set("x-auth-token",token)
        .send({
            id_news : 2,
            judul : "asd",
            deskripsi : "asd",
            isi : "asd",
            id_negara : "id",
            kategori : "health"
        })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message').eql('Berhasil update berita !');
        done();
        });
}).timeout(10000);