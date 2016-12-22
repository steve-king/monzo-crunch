'use strict';
const mongodb = require('mongodb');
const flat = require('flat');

class User {
  constructor() {
    mongodb.MongoClient.connect(
      process.env.MONGODB_URI,
      (error, database) => {
        if (error) throw error;
        console.log('Connected to MongoDB');
        this.collection = database.collection('users');
      }
    );
  }

  get(query, callback) {
    this.collection.findOne(query, (error, result) => {
      if (error) throw error;
      callback(result);
    })
  }

  getByMonzoAccountId(account_id) {
    return new Promise((resolve, reject) => {
      this.collection.findOne({ 'monzo.accounts.0.id': account_id }, (error, result) => {
        if (error) reject(error);
        resolve(result);
      })
    })
  }

  create(query, callback) {
    this.collection.insert(query, (error, result) => {
      if (error) throw error;
      callback(result.ops[0]);
    })
  }

  set(id, data) {
    var update = flat(data, { safe: true });

    return new Promise((resolve, reject) => {
      this.collection.findOneAndUpdate(
        { id },
        { $set: update },
        { returnOriginal: false },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.value);
          }
        }
      )
    });
  }

  unset(id, keyToDelete) {
    return new Promise((resolve, reject) => {
      this.collection.findOneAndUpdate(
        { id },
        { $unset: { [keyToDelete] : 1 } },
        (error, result) => {
          (error) ? reject(error) : resolve(result);
        }
      )
    })
  }
}

module.exports = new User();
