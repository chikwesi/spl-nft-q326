import type { Signer } from "@metaplex-foundation/umi";

export const NFT_NAME = "rug nft";
export const NFT_METADATA_NAME = "Rug";
export const NFT_DESCRIPTION = "Special rug";
export const NFT_IMAGE_CONTENT_TYPE = "image/png";

export function buildNftMetadata(image: string) {
  return {
    name: NFT_METADATA_NAME,
    description: NFT_DESCRIPTION,
    image,
    attributes: [{ trait_type: "Rarity", value: "Legendary" }],
    properties: {
      files: [
        {
          type: NFT_IMAGE_CONTENT_TYPE,
          uri: image,
        },
      ],
      category: "image",
    },
  };
}

export function buildNftCreateInput(input: {
  asset: Signer;
  metadataUri: string;
  name?: string;
}) {
  return {
    asset: input.asset,
    name: input.name ?? NFT_NAME,
    uri: input.metadataUri,
  };
}
