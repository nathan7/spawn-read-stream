# spawn-read-stream

  spawn a subprocess for reading from.

## Installation

    npm i spawn-read-stream

## API
### spawnReadStream(command)
### spawnReadStream(command, opts)
### spawnReadStream(command, args)
### spawnReadStream(command, args, opts)

  Returns a promise for a stream.
  Uses `child_process.spawn` to spawn the process, and once its standard output becomes readable, hands it over.
  If the process fails before becoming readable, the promise is rejected with an error.
  If the process fails after becoming readable, an error is emitted on the stream.

  For clarity, command is allowed to be an array, for cases like `zfs send`, where `zfs` clearly isn't a very useful description of what command is being run.
  This only makes a difference for error reporting.

  The child `exit` event is re-emitted on the stream, *after* any error events.

#### ExitError

  * name: `ExitError`
  * stderr: stderr output of the process (Buffer)

  then, depending on how it exited:

  * signal: signal that killed the process (string)
  * message: ``'`' + command + '` killed by signal `' + err.signal + '`'``

  *or*

  * code: exit code (integer)
  * message: ``'`' command + '` exited with ' + err.code``

