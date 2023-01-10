import { 
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js"
import fs from "mz/fs"
import path from "path"
const PROGRAM_KEY_PAIR = path.join(
    "./blockchain1/target/deploy",
    "blockchain1-keypair.json"
);

async function main() {
    console.log("Launching client . . .");

    let connection = new Connection("http://127.0.0.1:8899", "confirmed");

    const secreet_key_string = await fs.readFile(PROGRAM_KEY_PAIR, {encoding: 'utf8'});
    const secreet_key = Uint8Array.from(JSON.parse(secreet_key_string));
    const programKeyPair = Keypair.fromSecretKey(secreet_key);
    let program_id: PublicKey = programKeyPair.publicKey

    /**
     * Generate an account (keypair)
     */
    const trigger_keypair = Keypair.generate();
    const airdrop_request = await connection.requestAirdrop(
        trigger_keypair.publicKey,
        LAMPORTS_PER_SOL
    )

    await connection.confirmTransaction(airdrop_request)


    console.log("--Pinging Program", program_id.toBase58());

    const instruction = new TransactionInstruction({
        keys: [{pubkey: trigger_keypair.publicKey, isSigner: false, isWritable: true}],
        programId: program_id,
        data: Buffer.alloc(0)
    })

    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [trigger_keypair]
    )

}

main()