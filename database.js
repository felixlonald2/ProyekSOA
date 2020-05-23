const pg= require('pg');
const pool= new pg.Pool({ 
    connectionString: "postgres:anlzsnlufhkyyt:f0cc56bedd706d14c1f36b44e0c7d1736ee2f99d9eacedcbdec46c5426066d5d@ec2-18-233-32-61.compute-1.amazonaws.com:5432/d8dereekfc17eo",
    ssl: { rejectUnauthorized: false }
});

const executeQuery= (query) => {
    try {
        return new Promise((resolve, reject) => {
            pool.query(query, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports= {
    'executeQuery': executeQuery
};