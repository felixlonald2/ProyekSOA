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
            kodetopup: "TU001"
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
            kodetopup: "TU001"
        })
        .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(401);
            res.body.should.have.property('message').eql('Token Invalid');
        done();
        });
}).timeout(10000);

it('Field kosong!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            kodetopup: undefined
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('FIELD tidak boleh kosong!');
        done();
        });
}).timeout(10000);

it('Tagihan tidak ditemukan!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            kodetopup: "TU005"
        })
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('Tagihan not found');
        done();
        });
}).timeout(10000);

it('Berhasil Membayar!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            kodetopup: "TU002"
        })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message');
        done();
        });
}).timeout(10000);