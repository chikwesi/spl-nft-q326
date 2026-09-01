import assert from "node:assert/strict";
import test from "node:test";
import { generateSigner, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
  buildNftCreateInput,
  buildNftMetadata,
  NFT_DESCRIPTION,
  NFT_IMAGE_CONTENT_TYPE,
  NFT_METADATA_NAME,
  NFT_NAME,
} from "../src/nft/nft_builders";

test("NFT metadata JSON points image fields at the uploaded image URI", () => {
  const imageUri =
    "https://gateway.irys.xyz/5kSJM7DHbLK77aJAoqbd2TrmdmHT3Q4YXjEreYhevCgg";

  const metadata = buildNftMetadata(imageUri);

  assert.equal(metadata.name, NFT_METADATA_NAME);
  assert.equal(metadata.description, NFT_DESCRIPTION);
  assert.equal(metadata.image, imageUri);
  assert.deepEqual(metadata.attributes, [
    { trait_type: "Rarity", value: "Legendary" },
  ]);
  assert.equal(metadata.properties.category, "image");
  assert.deepEqual(metadata.properties.files, [
    { type: NFT_IMAGE_CONTENT_TYPE, uri: imageUri },
  ]);
});

test("NFT create input uses the generated asset signer and metadata URI", () => {
  const umi = createUmi("https://api.devnet.solana.com").use(mplCore());
  const payer = generateSigner(umi);
  umi.use(signerIdentity(payer));

  const asset = generateSigner(umi);
  const metadataUri =
    "https://gateway.irys.xyz/AxUtYbF7GU8ahdPYkMX5dWVa3HgpPooGFagrwuiRfhPt";

  const createInput = buildNftCreateInput({ asset, metadataUri });
  const tx = create(umi, createInput);
  const [instruction] = tx.getInstructions();

  assert.equal(createInput.asset.publicKey, asset.publicKey);
  assert.equal(createInput.name, NFT_NAME);
  assert.equal(createInput.uri, metadataUri);
  assert.equal(instruction.programId, "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
  assert.equal(instruction.keys[0].pubkey, asset.publicKey);
  assert.equal(instruction.keys[0].isSigner, true);
  assert.equal(instruction.keys[0].isWritable, true);
});
