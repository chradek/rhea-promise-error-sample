# Steps to run
1. Install dependencies
   
   `npm install`

2. Build the docker image.
   
   `docker build --pull --rm -f "Dockerfile" -t rheasample:latest "."`

3. Run docker in privileged mode so that you can run iptables commands.

   `docker run --privileged --rm -it rheasample:latest`

4. In docker container, run
```bash
DEBUG=* \
AMQP_HOST="HOST" \
AMQP_USERNAME="USERNAME" \
AMQP_PASSWORD="PASSWORD" \
RECEIVER_ADDRESS="ADDRESS" \
node index.js
```

## Findings
One of two things should happen after the iptables INPUT rule is removed.
1. After some time, an error (e.g. ECONNRESET) crashes the process.
2. Nothing happens, but the process doesn't exit even though all connections should be closed. (It's possible that waiting a long enough time _might_ cause something to happen).

If you're not seeing an error, you can play with the `DURATION`
environment variable to change how long the network is in a bad state.
Currently defaulted to 120000 ms (2 minutes).