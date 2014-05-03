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

    var name = bin
    if (Array.isArray(bin)) {
      name = bin.join(' ')
      args = bin.concat(args)
      bin = args.shift()
    }

    var myOpts = opts
        ? Object.create(opts)
        : {}
    myOpts.stdio = ['ignore', 'pipe', 'pipe']

    var child = spawn(bin, args, opts)
      , resolved = false
      , errored = false

    read()

    var stream = child.stdout
    function read() {
      if (resolved) return
      var chunk = stream.read()
      if (!chunk) return stream.once('readable', read)

      stream.unshift(chunk)
      resolved = true
      resolve(stream)
    }

    child.on('error', error)
    function error(err) {
      if (errored) return
      errored = true
      if (resolved)
        stream.emit('error', err)
      else {
        resolved = true
        reject(err)
      }
    }

    var stderr = sprom(child.stderr)
    child.on('exit', function(code, signal) {
      if (errored) return
      if (code === 0 && !signal) return
      stderr.then(function(stderr) {
        var err = signal
          ? new Error('`' + name + '` killed by signal `' + signal + '`')
          : new Error('`' + name + '` exited with ' + code)

        err.name = 'ExitError'
        err.message += ': ' + stderr
        err.code = code
        err.signal = signal
        err.stderr = stderr

        error(err)
      })
    })
  })
}
