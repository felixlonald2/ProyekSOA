const testLoader= require('../util/testLoader');

//IMPORT TEST FILE DISNI
testLoader('/login', '../users/login');
testLoader('/topup', '../users/topup');
testLoader('/register', '../users/register');
testLoader('/addapihit', '../users/addapihit');
testLoader('/subscription', '../users/subscription');
testLoader('/pembayaran', '../users/pembayaran');