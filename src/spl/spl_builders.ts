import type { Address, TransactionSigner } from "@solana/kit";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstructionAsync,
  getCreateAssociatedTokenInstructionAsync,
  getInitializeMintInstruction,
  getMintSize,
  getMintToInstruction,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

export const SPL_TOKEN_DECIMALS = 6;
export const SPL_ONE_TOKEN_BASE_UNITS = 1_000_000n;

export function buildCreateMintAccountInstruction(input: {
  payer: TransactionSigner;
  mint: TransactionSigner;
  lamports: bigint;
}) {
  return getCreateAccountInstruction({
    payer: input.payer,
    newAccount: input.mint,
    lamports: input.lamports,
    space: BigInt(getMintSize()),
    programAddress: TOKEN_PROGRAM_ADDRESS,
  });
}

export function buildInitializeMintInstruction(input: {
  mint: Address;
  mintAuthority: Address;
  decimals?: number;
}) {
  return getInitializeMintInstruction({
    mint: input.mint,
    mintAuthority: input.mintAuthority,
    decimals: input.decimals ?? SPL_TOKEN_DECIMALS,
  });
}

export async function findAssociatedTokenAccount(input: {
  mint: Address;
  owner: Address;
}) {
  const [ata] = await findAssociatedTokenPda({
    mint: input.mint,
    owner: input.owner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return ata;
}

export async function buildCreateAssociatedTokenInstruction(input: {
  payer: TransactionSigner;
  owner: Address;
  mint: Address;
}) {
  return getCreateAssociatedTokenInstructionAsync({
    payer: input.payer,
    owner: input.owner,
    mint: input.mint,
  });
}

export async function buildCreateAssociatedTokenIdempotentInstruction(input: {
  payer: TransactionSigner;
  owner: Address;
  mint: Address;
}) {
  return getCreateAssociatedTokenIdempotentInstructionAsync({
    payer: input.payer,
    owner: input.owner,
    mint: input.mint,
  });
}

export function buildMintToInstruction(input: {
  mint: Address;
  token: Address;
  mintAuthority: TransactionSigner;
  amount?: bigint;
}) {
  return getMintToInstruction({
    mint: input.mint,
    token: input.token,
    mintAuthority: input.mintAuthority,
    amount: input.amount ?? SPL_ONE_TOKEN_BASE_UNITS,
  });
}

export function buildTransferCheckedInstruction(input: {
  source: Address;
  mint: Address;
  destination: Address;
  authority: TransactionSigner;
  amount?: bigint;
  decimals?: number;
}) {
  return getTransferCheckedInstruction({
    source: input.source,
    mint: input.mint,
    destination: input.destination,
    authority: input.authority,
    amount: input.amount ?? SPL_ONE_TOKEN_BASE_UNITS,
    decimals: input.decimals ?? SPL_TOKEN_DECIMALS,
  });
}
