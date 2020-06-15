const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);
// npm run test-users
const endpoint= '/api/users/registerUser';

let token;

it('Berhasil Register', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            username: "agustampan",
            password: "asd",
            nama: "agus"
        })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message').eql('Berhasil Register User');
        
            chai.request("http://localhost:3000") //CALLBACK REQUEST
            .delete('/api/users/delete/agustampan')
            .end(done);
        });
}).timeout(10000);

it('Field Kosong', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            username: "",
            password: "",
            nama: ""
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Field Tidak Boleh ada yang kosong');
        done();
        });
}).timeout(10000);

it('Username kembar', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            username: "lonald",
            password: "asd",
            nama: "felix"
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Username sudah terpakai!');
        done();
        });
}).timeout(10000);