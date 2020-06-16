const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/news/comment/';

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
        .post(endpoint+"14")
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
        .post(endpoint+"14")
        .set("x-auth-token","kokokokoko")
        .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(401);
            res.body.should.have.property('message').eql('TOKEN INVALID');
        done();
        });
}).timeout(10000);

// it('Field kosong!', (done) => {
//     chai.request("http://localhost:3000")
//         .post(endpoint+"")
//         .set("x-auth-token",token)
//         .send({
//             komen: ""
//         })
//         .end((err, res) => {
//             res.should.have.status(400);
//             res.body.should.be.a('object');
//             res.body.should.have.property('status').eql(400);
//             res.body.should.have.property('message').eql('FIELD TIDAK BOLEH KOSONG');
//         done();
//         });
// }).timeout(10000);

it('Title berita tidak ditemukan', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint+55)
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('TITLE BERITA NOT FOUND');
        done();
        });
}).timeout(10000);

// it('API HIT tidak cukup!', (done) => {
//     chai.request("http://localhost:3000")
//         .put('/api/users/update/lonald')
//         .send({
//             api_hit: -1
//         })
//         .end(() => {
//             chai.request("http://localhost:3000")
//             .post(endpoint)
//             .set("x-auth-token",token)
//             .send({
//                 username: "lonald",
//                 password: "asd",
//                 kode: "TU001"
//             })
//             .end((err, res) => {
//                 res.should.have.status(400);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('status').eql(400);
//                 res.body.should.have.property('message').eql('API HIT TIDAK CUKUP');

//                 chai.request("http://localhost:3000")
//                 .put('/api/users/update/lonald')
//                 .send({
//                     api_hit: 50
//                 })
//                 .end(done);
//             });
//         });
// }).timeout(10000);

it('Berhasil menambahkan komen', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint+"Coronavirus Australia live blog: Ludicrous virus note your boss may ask for")
        .send({
            komen: "mantap"
        })
        .set("x-auth-token",token)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message').eql('COMMENT BERHASIL')
        done();
        });
}).timeout(10000);