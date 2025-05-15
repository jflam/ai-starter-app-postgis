#!/bin/sh
# wait-for-it.sh - Wait for a service to be available
# Usage: ./wait-for-it.sh host:port [-- command args]

TIMEOUT=60
QUIET=0

echoerr() {
  if [ "$QUIET" -ne 1 ]; then printf "%s\n" "$*" 1>&2; fi
}

usage() {
  exitcode="$1"
  cat << USAGE >&2
Usage:
  $0 host:port [-t timeout] [-- command args]
  -t TIMEOUT                Timeout in seconds, zero for no timeout
  -q                        Don't output any status messages
  -- COMMAND ARGS           Execute command with args after the test finishes
USAGE
  exit "$exitcode"
}

wait_for() {
  for i in $(seq $TIMEOUT) ; do
    nc -z "$HOST" "$PORT" > /dev/null 2>&1
    
    result=$?
    if [ $result -eq 0 ] ; then
      echoerr "$HOST:$PORT is available after $i seconds"
      return 0
    fi
    sleep 1
  done
  echoerr "Operation timed out" >&2
  exit 1
}

while [ $# -gt 0 ]
do
  case "$1" in
    *:* )
    HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
    PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
    shift 1
    ;;
    -t)
    TIMEOUT="$2"
    if [ "$TIMEOUT" = "" ]; then break; fi
    shift 2
    ;;
    -q)
    QUIET=1
    shift 1
    ;;
    --)
    shift
    break
    ;;
    --help)
    usage 0
    ;;
    *)
    echoerr "Unknown argument: $1"
    usage 1
    ;;
  esac
done

if [ "$HOST" = "" -o "$PORT" = "" ]; then
  echoerr "Error: you need to provide a host and port to test."
  usage 2
fi

wait_for
RESULT=$?
if [ $RESULT -ne 0 ]; then
  exit $RESULT
fi

if [ $# -gt 0 ]; then
  exec "$@"
fi

exit 0