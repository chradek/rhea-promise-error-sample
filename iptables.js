const {execSync} = require("child_process");

function netstat() {
  const output = execSync("netstat -natd").toString();
  const matches = output.match(/tcp\s+\d+\s+\d+\s+[\d\.:]+\s+(?<address>[\d\.]+):5671\s+ESTABLISHED/i);
  if (matches && matches.groups) {
    return matches.groups.address;
  }
}

function iptablesDrop() {
  const foreignAddress = netstat();
  if (!foreignAddress) {
    console.log(`Run "iptables -A INPUT -s x.x.x.x -j DROP" (replace x.x.x.x with Foreign Address)`);
  } else {
    const command = `iptables -A INPUT -s ${foreignAddress} -j DROP`;
    console.log(`Running "${command}"`);
    execSync(command);
  }
}

function iptablesReset() {
  const command = "iptables -D INPUT 1";
  console.log(`Running "${command}"`);
  execSync(command);
}

module.exports = {
  iptablesDrop,
  iptablesReset
};