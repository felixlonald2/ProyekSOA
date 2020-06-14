const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);

const endpoint= '/api/users/topup';

let token;

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
            res.body.should.have.property('message').eql('TOKEN NOT FOUND');
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
            nominal: ""
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('FIELD TIDAK BOLEH KOSONG');
        done();
        });
}).timeout(10000);