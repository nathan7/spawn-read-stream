'use strict';
var Promise = require('promise')
  , spawn = require('child_process').spawn
  , sprom = require('sprom')

module.exports =
function spawnReadStream(bin, args, opts) {
  return new Promise(function(resolve, reject) {
    if (!Array.isArray(args)) {
      opts = args
      args = []
    }

    var myOpts = opts
        ? Object.create(opts)
        : {}
    myOpts.stdio = ['ignore', 'pipe', 'pipe']

    var child = spawn(bin, args, opts)
      , stream = child.stdout
      , stderr = sprom.buf(child.stderr)
      , resolved = false
      , errored = false

    stream.once('readable', function() {
      resolved = true
      resolve(stream)
    })

    child.on('error', function(err) {
      errored = true
      stream.emit('error', err)
    })

    child.on('exit', function(code, signal) {
      if (errored) return
      if (code !== 0 || signal) stderr.then(function(stderr) {
        var err = signal
          ? new Error(bin + ' killed by signal `' + signal + '`')
          : new Error(bin + ' exited with ' + code)

        err.name = 'ExitError'
        err.message += '\n' + stderr
        err.code = code
        err.signal = signal
        err.stderr = stderr

        if (resolved)
          stream.emit('error', err)
        else
          reject(err)
      })
    })
  })
}
