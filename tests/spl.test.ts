import assert from "node:assert/strict";
import test from "node:test";
import { FailedTransactionMetadata, LiteSVM } from "litesvm";
import {
  appendTransactionMessageInstructions,
  createTransactionMessage,
  generateKeyPairSigner,
  lamports,
  setTransactionMessageFeePayerSigner,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { decodeMint, decodeToken } from "@solana-program/token";
import {
  buildCreateAssociatedTokenIdempotentInstruction,
  buildCreateAssociatedTokenInstruction,
  buildCreateMintAccountInstruction,
  buildInitializeMintInstruction,
  buildMintToInstruction,
  buildTransferCheckedInstruction,
  findAssociatedTokenAccount,
  SPL_ONE_TOKEN_BASE_UNITS,
  SPL_TOKEN_DECIMALS,
} from "../src/spl/spl_builders";

test("SPL token flow runs locally in LiteSVM", async () => {
  const svm = new LiteSVM();
  const payer = await generateKeyPairSigner();
  const mint = await generateKeyPairSigner();
  const recipient = await generateKeyPairSigner();

  svm.airdrop(payer.address, lamports(2_000_000_000n));

  const payerAta = await findAssociatedTokenAccount({
    mint: mint.address,
    owner: payer.address,
  });
  const recipientAta = await findAssociatedTokenAccount({
    mint: mint.address,
    owner: recipient.address,
  });

  const instructions = [
    buildCreateMintAccountInstruction({
      payer,
      mint,
      lamports: svm.minimumBalanceForRentExemption(82n),
    }),
    buildInitializeMintInstruction({
      mint: mint.address,
      mintAuthority: payer.address,
    }),
    await buildCreateAssociatedTokenInstruction({
      payer,
      owner: payer.address,
      mint: mint.address,
    }),
    buildMintToInstruction({
      mint: mint.address,
      token: payerAta,
      mintAuthority: payer,
      amount: SPL_ONE_TOKEN_BASE_UNITS * 2n,
    }),
    await buildCreateAssociatedTokenIdempotentInstruction({
      payer,
      owner: recipient.address,
      mint: mint.address,
    }),
    buildTransferCheckedInstruction({
      source: payerAta,
      mint: mint.address,
      destination: recipientAta,
      authority: payer,
    }),
  ];

  const transactionMessage = appendTransactionMessageInstructions(
    instructions,
    svm.setTransactionMessageLifetimeUsingLatestBlockhash(
      setTransactionMessageFeePayerSigner(
        payer,
        createTransactionMessage({ version: 0 }),
      ),
    ),
  );
  const transaction = await signTransactionMessageWithSigners(transactionMessage);
  const result = svm.sendTransaction(transaction);

  if (result instanceof FailedTransactionMetadata) {
    throw new Error(`LiteSVM transaction failed: ${result.err()}`);
  }

  const mintAccount = svm.getAccount(mint.address);
  const payerTokenAccount = svm.getAccount(payerAta);
  const recipientTokenAccount = svm.getAccount(recipientAta);

  assert(mintAccount.exists);
  assert(payerTokenAccount.exists);
  assert(recipientTokenAccount.exists);

  const decodedMint = decodeMint(mintAccount);
  const decodedPayerToken = decodeToken(payerTokenAccount);
  const decodedRecipientToken = decodeToken(recipientTokenAccount);

  assert.equal(decodedMint.data.decimals, SPL_TOKEN_DECIMALS);
  assert.equal(decodedMint.data.supply, SPL_ONE_TOKEN_BASE_UNITS * 2n);
  assert.equal(decodedMint.data.mintAuthority.__option, "Some");
  assert(decodedMint.data.mintAuthority.__option === "Some");
  assert.equal(decodedMint.data.mintAuthority.value, payer.address);

  assert.equal(decodedPayerToken.data.mint, mint.address);
  assert.equal(decodedPayerToken.data.owner, payer.address);
  assert.equal(decodedPayerToken.data.amount, SPL_ONE_TOKEN_BASE_UNITS);

  assert.equal(decodedRecipientToken.data.mint, mint.address);
  assert.equal(decodedRecipientToken.data.owner, recipient.address);
  assert.equal(decodedRecipientToken.data.amount, SPL_ONE_TOKEN_BASE_UNITS);
});
