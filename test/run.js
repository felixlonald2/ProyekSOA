const testLoader= require('./util/testLoader');

//RUN ALL TEST RESOURCE
testLoader('/api/users', '../users/test');
testLoader('/api/news', '../news/test');