const mongodb = require('mongodb');

var db;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function(error, database){
  if (error) throw error;
  console.log('Connected to MongoDB');
  db = database;
});

exports.create = function(auth0_user_id, email, callback) {
  const user = { auth0_user_id, email };
  db.collection('users').insert(user, function(error, result) {
    if (error) throw error;
    callback(result.ops[0]);
  });
}

exports.getByUserId = function(auth0_user_id, callback) {
  db.collection('users').findOne({ auth0_user_id }, function(error, result){
    if (error) throw error;
    callback(result);
  });
}
