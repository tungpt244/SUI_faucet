const axios = require("axios");
require("dotenv").config();

const sendMessage = async (text) => {
  const bot_token = process.env.TELEGRAM_BOT_TOKEN;
  const chat_id = process.env.TELEGRAM_CHAT_ID;

  const baseUrl = `https://api.telegram.org/bot${bot_token}/sendMessage`;
  await axios.post(baseUrl, {
    chat_id,
    text,
  });
};

const getIPAddress = async () => {
  const { data } = await axios.get("https://api.ipify.org?format=json");
  return data.ip;
};

const getCurrentSUI = async (address) => {
  const headers = {
    "Content-Type": "application/json",
    "client-sdk-type": "typescript",
    "client-target-api-version": "1.40.0",
    "client-request-method": "suix_getAllBalances",
  };
  const { data } = await axios.post(
    "https://wallet-rpc.testnet.sui.io/",
    {
      jsonrpc: "2.0",
      id: "2",
      method: "suix_getAllBalances",
      params: [address],
    },
    {
      headers,
    }
  );
  const _res = data.result.find((a) => a.coinType.match("0x2::"));
  const res = Number(_res.totalBalance / 1000000000).toFixed(2);

  return res;
};

const address_list = [
  "0xf381b14c813dc5896395e9a34bba77fe6d9262d921be09d0fe9bf05425c4faba",
];

const faucet = async (address, count) => {
  const ip = await getIPAddress();
  const totalSUI = await getCurrentSUI(address);

  try {
    await axios.post(
      "https://faucet.testnet.sui.io/v1/gas",
      JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      })
    );

    const success_message = `✅ [${address}] - from ${ip} - ${new Date().toLocaleString()} - SUI: ${totalSUI}`;
    await sendMessage(success_message);
    console.log(success_message);
    return;
  } catch (error) {
    if (count <= 0) {
      await sendMessage(`🔥 ${address}] - from ${ip} - failed.`);
      return;
    }

    const error_message = `❗ [${address}] - from ${ip} - ${new Date().toLocaleString()} - SUI: ${totalSUI}`;
    await sendMessage(error_message);
    console.error(error_message);

    await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
    return faucet(address, count - 1);
  }
};

const execute = async () => {
  await Promise.all(address_list.map((a) => faucet(a, 3)));
};

execute();

setInterval(() => execute(), 1000 * 60 * 35);
