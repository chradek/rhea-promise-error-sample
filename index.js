const {
  Connection,
  ConnectionEvents,
  ReceiverEvents,
  types
} = require('rhea-promise');
const {iptablesDrop, iptablesReset} = require("./iptables");

const host = process.env.AMQP_HOST;
const username = process.env.AMQP_USERNAME;
const address = process.env.RECEIVER_ADDRESS;
const password = process.env.AMQP_PASSWORD;
const badNetworkDurationInMs = process.env.DURATION || 120000;

async function run() {
  const connectionOptions = {
    transport: "tls",
    host,
    hostname: host,
    username,
    port: 5671,
    reconnect: false,
    password,
    idle_time_out: 10000
  };

  const connection = new Connection(connectionOptions);

  for (const type of Object.keys(ConnectionEvents)) {
    connection.on(type, (...args) => {
      console.log(`Connection event ${type} triggered with`, ...args);
    });
  }

  const receiverName = `receiver=${Date.now()}`;
  const filterClause = `amqp.annotation.x-opt-enqueued-time > '${Date.now() - 3600 * 1000}'`;

  const receiverOptions = {
    name: receiverName,
    source: {
      address,
      filter: {
        "apache.org:selector-filter:string": types.wrap_described(filterClause, 0x468C00000004)
      }
    },
    onSettled: (context) => {
      console.log(`settled`);
    },
    onSessionError: (context) => {
      console.log('session error');
    },
    onClose: (context) => {
      console.log(`receiver close`);
    },
    onSessionClose: (context) => {
      console.log(`session_close`);
    }
  };

  await connection.open();

  const receiver = await connection.createReceiver(receiverOptions);

  receiver.on(ReceiverEvents.message, (context) => {
    console.log('message received', context.message.body.content.toString());
  });
  receiver.on(ReceiverEvents.receiverError, (context) => {
    const error = context.receiver && context.receiver.error;
    console.log('receiver error');
    if (error) {
      console.log(error);
    }
  });

}

run();

// Simulate a temporary bad network state.
setTimeout(() => {
  iptablesDrop();
  setTimeout(() => {
    iptablesReset();
  }, badNetworkDurationInMs);
}, 1000);