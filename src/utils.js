// import React, { useEffect, useState } from 'react';
// import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// import { Program, Provider, web3 } from '@project-serum/anchor';

// // SystemProgram is a reference to the Solana runtime!
// const { SystemProgram, Keypair } = web3;

// // Create a keypair for the account that will hold the GIF data.
// // let baseAccount = Keypair.generate();
// // As we want all users to talk to the same baseAccount we rather write it to a json file.
// const arr = Object.values(kp._keypair.secretKey)
// const secret = new Uint8Array(arr)
// const baseAccount = web3.Keypair.fromSecretKey(secret)
// console.log(baseAccount.publicKey.toString());

// // Get our program's id from the IDL file.
// const programID = new PublicKey(idl.metadata.address);

// // Set our network to devnet.
// const network = clusterApiUrl('devnet');

// // Controls how we want to acknowledge when a transaction is "done".
// const opts = {
//   preflightCommitment: "processed"
// }

// export async function getProvider() {
//     const connection = new Connection(network, opts.preflightCommitment);
//     const provider = new Provider(
//       connection, window.solana, opts.preflightCommitment,
//     );
//     return provider;
//   }

// export async function 

// export async function upvoteGif()