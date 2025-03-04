import {
  createMint,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMint2Instruction
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

export function TokenLaunchpad() {
  const wallet = useWallet();
  const { connection } = useConnection();

  async function createToken() {
    if (!wallet.publicKey) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const name = document.getElementById("name").value;
      const symbol = document.getElementById("symbol").value;
      const imageUrl = document.getElementById("imageUrl").value;
      const initialSupply = document.getElementById("initialSupply").value;

      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const keypair = Keypair.generate();

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          keypair.publicKey,
          6, // Decimals
          wallet.publicKey,
          wallet.publicKey
        )
      );

      const recentBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = recentBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;

      transaction.partialSign(keypair);
      const signature = await wallet.sendTransaction(transaction, connection);
      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error creating token:", error);
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h1>Solana Token Launchpad</h1>
      <input id="name" className='inputText' type='text' placeholder='Name' /><br />
      <input id="symbol" className='inputText' type='text' placeholder='Symbol' /><br />
      <input id="imageUrl" className='inputText' type='text' placeholder='Image URL' /><br />
      <input id="initialSupply" className='inputText' type='text' placeholder='Initial Supply' /><br />
      <button className='btn' onClick={createToken}>Create your token</button>
    </div>
  );
}
