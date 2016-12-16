const mongodb = require('mongodb');

var db;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function(error, database){
  if (error) throw error;
  console.log('Connected to MongoDB');
  db = database;
});

exports.create = function(query, callback) {
  // const user = { auth0_user_id, email };
  db.collection('users').insert(query, function(error, result) {
    if (error) throw error;
    callback(result.ops[0]);
  });
}

exports.get = function(query, callback) {
  db.collection('users').findOne(query, function(error, result){
    if (error) throw error;
    callback(result);
  });
}

exports.update = function(query, update, callback) {
  db.collection('users').findOneAndUpdate(
    query,
    update,
    { /*returnOriginal: false*/ },
    function(error, result){
      if (error) throw error;
      callback(result.value);
    }
  );
}
