const chai= require('chai');
const chaiHttp= require('chai-http');

chai.should(); //ASSERTION STYLE
chai.use(chaiHttp);

const endpoint= '/api/users/loginUser';

it('Username password tidak sesuai', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            username: "asdasdasda",
            password: "alalalla"
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Username/Password tidak sesuai!');
        done();
        });
}).timeout(10000);

it('Berhasil Login', (done) => {
    chai.request("http://localhost:3000")
        .post(endpoint)
        .send({
            username: "lonald",
            password: "asd"
        })
        .end((err, res) => {
            res.should.have.status(200);
            res.text.should.not.be.empty;
        done();
        });
}).timeout(10000);