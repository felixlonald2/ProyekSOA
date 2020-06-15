const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/users/addApiHit';

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

it('Token tidak ada', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            apihit: 50
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
            apihit: 50
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
            apihit: undefined
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Apihit tidak boleh kosong!');
        done();
        });
}).timeout(10000);

it('Saldo tidak cukup!', (done) => {
    chai.request("http://localhost:3000")
        .put('/api/users/updatee/lonald')
        .send({
            saldo: -1
        })
        .end(() => {
            chai.request("http://localhost:3000")
            .post(endpoint)
            .set("x-auth-token",token)
            .send({
                apihit: 50
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(400);
                res.body.should.have.property('message');

                chai.request("http://localhost:3000")
                .put('/api/users/updatee/lonald')
                .send({
                    saldo: 50000
                })
                .end(done);
            });
        });
}).timeout(10000);

it('Berhasil Add Api Hit!', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .set("x-auth-token",token)
        .send({
            apihit:50
        })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message');
        done();
        });
}).timeout(10000);

