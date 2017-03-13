// Generated using Sourcery 0.5.8 — https://github.com/krzysztofzablocki/Sourcery
// DO NOT EDIT





/**
Packs a JavaScript object conforming to the LogType protocol defined in Swift

@parameter {object} obj The object to pack
*/
function packLogType(obj) {
  return {
      text1: packTextContaining(obj.text1)
      ,
      text2: packTextContaining(obj.text2)
  };
}


/**
Packs a JavaScript object conforming to the TextContaining protocol defined in Swift

@parameter {object} obj The object to pack
*/
function packTextContaining(obj) {
  return {
      text: obj.text
  };
}


var s = null;

/// All promises waiting for an answer are here
var messagePromises = {};
var nextMessageId = 0;
var buffer = Buffer.from([]);

/**
@returns {Promise}
*/
function swiftMessage(msg) {
  if (s == null) {
    s = require('net').Socket();
    s.connect(8403, 'localhost');

    s.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);

      let byteCount = buffer.length;
      if (byteCount < 4) return;

      let messageLength = buffer.readInt32LE(0);
      if (byteCount < 4+messageLength) return;

      let messageJSON = buffer.slice(4, 4+messageLength).toString();
      let message = JSON.parse(messageJSON);

      // truncate buffer
      buffer = buffer.slice(4+messageLength, byteCount-1);

      // handle message
      if (typeof messagePromises[message.id] == "object") {
        messagePromises[message.id].resolve(message);
      }
    });
  }

  // assign a new message id, for tracking the response
  msg.id = nextMessageId;
  nextMessageId++;

  var promiseObject = {};
  messagePromises[msg.id] = promiseObject;

  promiseObject.promise = new Promise((resolve, reject) => {
    promiseObject.resolve = resolve;
    promiseObject.reject = reject;

    let json = JSON.stringify(msg);

    let lenbuf = Buffer.allocUnsafe(4);
    lenbuf.writeInt32LE(json.length, 0);

    s.write(lenbuf);
    s.write(json);
  });

  // Remove the promise when finished.
  let cleanup = () => {
    messagePromises[msg.id] = undefined;
  };
  promiseObject.promise.then(cleanup, cleanup);

  return promiseObject.promise;
}


module.exports.SwiftLogger = {
    testFunc: function(
    ) {
      return swiftMessage({a: "callStatic", t: "SwiftLogger", m: "testFunc",
      })
    },
    testFuncWithArgument: function(
        text
    ) {
      return swiftMessage({a: "callStatic", t: "SwiftLogger", m: "testFuncWithArgument",
        args: {
            text
        }
      })
    },
    logTextContaining: function(
        containing
    ) {
      return swiftMessage({a: "callStatic", t: "SwiftLogger", m: "logTextContaining",
        args: {
            containing: packTextContaining(containing)
        }
      })
    },
    logUsingRecursiveProtocol: function(
        object
    ) {
      return swiftMessage({a: "callStatic", t: "SwiftLogger", m: "logUsingRecursiveProtocol",
        args: {
            object: packLogType(object)
        }
      })
    },
};
