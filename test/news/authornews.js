const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/news/getAuthorNews';

let token;
let token2;
let token3;
let user;
before((done) => {
    chai.request("http://localhost:3000")
        .post('/api/users/loginUser')
        .send({
            username: 'budi',
            password: 'asd' 
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

before((done) => {
    chai.request("http://localhost:3000")
        .post('/api/users/loginUser')
        .send({
            username: 'albert',
            password: 'abe' 
        })
        .end((err, res) => {
            token3= res.text;
        done();
    });
});

it('Token tidak ada', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint)
        .end((err, res) => {
            res.should.have.status(404);
            res.text.should.eql('Token not found')
        done();
        });
}).timeout(10000);

it('Token salah', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint)
        .set("x-auth-token","kokokokoko")
        .end((err, res) => {
            res.should.have.status(401);
            res.text.should.eql('Token Invalid')
        done();
        });
}).timeout(10000);

it('Tidak punya berita!', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint)
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('Tidak mempunyai berita !');
        done();
        });
}).timeout(10000);

it('Bukan author!', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint)
        .set("x-auth-token",token2)
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Bukan Author!');
        done();
        });
}).timeout(10000);

it('Berhasil menampilkan berita yang telah dibuat', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint)
        .set("x-auth-token",token3)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('berita')
        done();
        });
}).timeout(10000);