import crypto from "crypto";
import fetch from "node-fetch";

export default async function handler(req, res) {
  // CORS 设置
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { amount, order_no } = req.body;

    // 商户信息（⚠️ 密钥只在这里，不放前端）
    const merAccount = "8892630";
    const payType = "16002";
    const payKey = "d1869ca8e2cde5eef18bae2b4994dbf3";

    // 拼接支付参数
    const dataArr = {
      mer_no: merAccount,
      order_amount: amount,
      order_no: order_no,
      payemail: "14234361@email.com",
      payphone: "13888888888",
      currency: "MYR",
      paytypecode: payType,
      method: "trade.create",
      payname: "star_hot",
      returnurl: "https://your-shopify-domain/notify" // 改成你自己的回调地址
    };

    // 生成签名
    const signStr =
      `currency=${dataArr.currency}` +
      `&mer_no=${dataArr.mer_no}` +
      `&method=${dataArr.method}` +
      `&order_amount=${dataArr.order_amount}` +
      `&order_no=${dataArr.order_no}` +
      `&payemail=${dataArr.payemail}` +
      `&payname=${dataArr.payname}` +
      `&payphone=${dataArr.payphone}` +
      `&paytypecode=${dataArr.paytypecode}` +
      `&returnurl=${dataArr.returnurl}` +
      payKey;

    dataArr.sign = crypto.createHash("md5").update(signStr).digest("hex");

    try {
      // 调用支付接口
      const fetchRes = await fetch("https://wkpluss.com/gateway/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataArr)
      });

      const result = await fetchRes.json();

      // 返回 JSON 给 Shopify 前端
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.toString() });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}