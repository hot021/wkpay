import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    let bodyData = {};
    try {
      if (typeof req.body === "string") bodyData = JSON.parse(req.body);
      else if (typeof req.body === "object") bodyData = req.body;
      else return res.status(400).json({ error: "Invalid request body" });
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { amount, order_no } = bodyData;
    if (!amount || !order_no) return res.status(400).json({ error: "Missing amount or order_no" });

    const merAccount = "26880083";
    const payType = "16002";
    const payKey = "45ff9b3f8d9e19861f5e6edf937db91c";

    const dataArr = {
      merchantId: merAccount,
      amount: amount,
      reference: order_no,
      customerName: "star_hot",
      customerEmail: "14234361@email.com",
      customerPhone: "6013888888888",
      currency: "MYR",
      payMethod: payType,
      eventType: "payin.order.create",
      notifyUrl: "https://shopify.com/97349927221/account/orders?locale=zh-CN&region_country=MY"
    };

    const signStr =
      `amount=${dataArr.amount}` +
      `&currency=${dataArr.currency}` +
      `&customerEmail=${dataArr.customerEmail}` +
      `&customerName=${dataArr.customerName}` +
      `&customerPhone=${dataArr.customerPhone}` +
      `&eventType=${dataArr.eventType}` +
      `&merchantId=${dataArr.merchantId}` +
      `&notifyUrl=${dataArr.notifyUrl}` +
      payKey;

    dataArr.sign = crypto.createHash("md5").update(signStr).digest("hex");
    try {
      const fetchRes = await fetch("https://kk888pay.com/api/v1/payment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataArr)
      });
      const result = await fetchRes.json();
      //const result = {signStr:signStr}
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}




