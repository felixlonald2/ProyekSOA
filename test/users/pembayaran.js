const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/users/pembayaran';

let token;
let user;
before((done) => {
    chai.request("http://localhost:3000")
        .post('/api/users/loginUser')
        .send({
            username: 'lonald',
            password: 'asd' 
        })
        .end((err, res) => {
            token= res.text;
        done();
    });
});

before((done) => {
    chai.request("http://localhost:3000")
        .get('/api/users/infouser/lonald')
        .end((err, res) => {
            user= res.body.message;
        done();
        });
});

it('Token tidak ada', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            username: "lonald",
            password: "alaasd",
            nominal: 1
        })
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('Token not found');
        done();
        });
}).timeout(10000);

it('Token salah', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token","kokokokoko")
        .send({
            username: "lonald",
            password: "asd",
            nominal: 15000
        })
        .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(401);
            res.body.should.have.property('message').eql('TOKEN INVALID');
        done();
        });
}).timeout(10000);

it('Field kosong!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            username: "",
            password: "",
            kode: ""
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('FIELD TIDAK BOLEH KOSONG');
        done();
        });
}).timeout(10000);

it('Username tidak ditemukan!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            username: "lonal",
            password: "asd",
            kode: "TU001"
        })
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('USER TIDAK DITEMUKAN');
        done();
        });
}).timeout(10000);

it('API HIT tidak cukup!', (done) => {
    chai.request("http://localhost:3000")
        .put('/api/users/update/lonald')
        .send({
            api_hit: -1
        })
        .end(() => {
            chai.request("http://localhost:3000")
            .post(endpoint)
            .set("x-auth-token",token)
            .send({
                username: "lonald",
                password: "asd",
                kode: "TU001"
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(400);
                res.body.should.have.property('message').eql('API HIT TIDAK CUKUP');

                chai.request("http://localhost:3000")
                .put('/api/users/update/lonald')
                .send({
                    api_hit: 50
                })
                .end(done);
            });
        });
}).timeout(10000);

it('Tagihan tidak ditemukan!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            username: "albert",
            password: "abe",
            kode: "TU051"
        })
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('TAGIHAN TIDAK DITEMUKAN');
        done();
        });
}).timeout(10000);

it('Berhasil Membayar!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            username: "lonald",
            password: "asd",
            kodetopup: "TU001"
        })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('user');
        done();
        });
}).timeout(10000);

