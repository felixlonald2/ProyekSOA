const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/news/getcomment';

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
        .get(endpoint+"?id_title=14")
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
        .get(endpoint+"?id_title=14")
        .set("x-auth-token","kokokokoko")
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
        .get(endpoint)
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('FIELD TIDAK BOLEH KOSONG');
        done();
        });
}).timeout(10000);

it('Title berita tidak ditemukan', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint+"?id_title=60")
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('TITLE BERITA TIDAK DITEMUKAN');
        done();
        });
}).timeout(10000);

it('Berhasil menampilkan komen pada ID Title yang dimasukkan', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint+"?id_title=14")
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('berita')
        done();
        });
}).timeout(10000);