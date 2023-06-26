import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import * as utils from "ethereum-cryptography/utils";
import * as keccak from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, senderPriv }) {
  console.log(senderPriv);
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const privateKey =
    "a3cd15765584bfe77d6258c1aac0ac012ded6bf0c52a78d116a0f90dd15b3a8f";

  const getpublicKey = (privKey) => secp256k1.getPublicKey(privKey);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = (message) => {
    const bytes = utils.utf8ToBytes(message);
    return keccak.keccak256(bytes);
  };

  const signMessage = async (message) => {
    const hashedMessage = utils.toHex(hashMessage(message));
    try {
      const sign = secp256k1.sign(hashedMessage, privateKey);
      return sign;
    } catch (e) {
      console.log(e);
    }
  };

  async function transfer(evt) {
    evt.preventDefault();
    const senderPubKey = getpublicKey(senderPriv);

    const message = address + "_" + sendAmount + "_" + recipient;

    let sign = await signMessage(message);

    const hashedMessage = utils.toHex(hashMessage(message));

    console.log(secp256k1.verify(sign, hashedMessage, senderPubKey));

    sign = JSON.stringify({
      ...sign,
      r: sign.r.toString(),
      s: sign.s.toString(),
    });

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        message,
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        sign,
        senderPubKey,
      });
      setBalance(balance);
    } catch (ex) {
      console.error(ex);
    }
  }
  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
