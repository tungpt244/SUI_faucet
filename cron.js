const sendMessage = async (text) => {
  const bot_token = "7566091250:AAGeldt1IavD19R7VU9cZBPXevnoBq4kfhY";
  const chat_id = "-1002462650527";

  const baseUrl = `https://api.telegram.org/bot${bot_token}/sendMessage`;
  await fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify({
      chat_id,
      text,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const getIPAddress = async () => {
  let current_ip = "";
  await fetch("https://api.ipify.org?format=json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((v) => v.json())
    .then((data) => {
      current_ip = data.ip;
    });
  return current_ip;
};

const getCurrentSUI = async (address) => {
  let res = "";
  await fetch("https://wallet-rpc.testnet.sui.io/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "client-sdk-type": "typescript",
      "client-target-api-version": "1.40.0",
      "client-request-method": "suix_getAllBalances",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "2",
      method: "suix_getAllBalances",
      params: [address],
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      const _res = result.result.find((a) => a.coinType.match("0x2::"));
      res = Number(_res.totalBalance / 1000000000).toFixed(2);
    });
  return res;
};

const address_list = [
  "0xf381b14c813dc5896395e9a34bba77fe6d9262d921be09d0fe9bf05425c4faba",
  // "0xc0d2e3902dfea07cad49590316f049fc08601d3d756c935aa3ab5e370c46d80b",
];

let count = [];

const faucet = async (address) => {
  try {
    const ip = await getIPAddress();

    const totalSUI = await getCurrentSUI(address);

    const response = await fetch("https://faucet.testnet.sui.io/v1/gas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });

    if (response.status !== 429) {
      const success_message = `✅ [${address}] - from ${ip} - ${new Date().toLocaleString()} - SUI: ${totalSUI}`;
      await sendMessage(success_message);
      console.log(success_message);
      count[address] = 0;
      return;
    }

    const error_message = `❗ [${address}] - from ${ip} - ${new Date().toLocaleString()} - SUI: ${totalSUI}`;
    await sendMessage(error_message);
    console.error(error_message);

    count[address] = (count[address] || 0) + 1;
    if (count[address] < 3) {
      setTimeout(() => {
        faucet(address);
      }, 1000 * 60);
    }
  } catch (error) {
    console.error("Error occurred while processing faucet:", error);
  }
};

const execute = async () => {
  await Promise.all(address_list.map((a) => faucet(a)));
};

execute();

setInterval(() => execute(), 1000 * 60 * 35);
