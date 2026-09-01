import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    //change the image uri to your image uri obtained from nft_image.ts
    const image =
      "https://gateway.irys.xyz/5kSJM7DHbLK77aJAoqbd2TrmdmHT3Q4YXjEreYhevCgg";

    //json scheme : https://www.metaplex.com/docs/smart-contracts/core/json-schema
    const metadata = {
      name: "Rug",
      description: "Special rug",
      image,
      attributes: [{ trait_type: "Rarity", value: "Legendary" }],

      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
        category: "image",
      },
    };

    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri} `); //change the metadata
  } catch (error) {
    console.log("error", error);
  }
})();
