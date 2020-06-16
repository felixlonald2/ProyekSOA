const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/news/detailnews';

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
        .get(endpoint+"/12")
        .end((err, res) => {
            res.should.have.status(404);
            res.text.should.eql('Token not found')
        done();
        });
}).timeout(10000);

it('Token salah', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint+"/12")
        .set("x-auth-token","kokokokoko")
        .end((err, res) => {
            res.should.have.status(401);
            res.text.should.eql('Token Invalid')
        done();
        });
}).timeout(10000);

it('Berita yang dicari tidak ada', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint+"/125")
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(404);
            res.text.should.eql('Berita yang dicari tidak ditemukan')
        done();
        });
}).timeout(50000);

it('Berita berhasil dicari', (done) => {
    chai.request("http://localhost:3000")
        .get(endpoint+"/12")
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
        done();
        });
}).timeout(50000);

