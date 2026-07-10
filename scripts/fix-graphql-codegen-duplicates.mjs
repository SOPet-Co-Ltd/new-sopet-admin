import { readFileSync, writeFileSync } from 'node:fs';

const filePath = process.argv[2];
if (!filePath?.endsWith('graphql.ts')) {
  process.exit(0);
}

const duplicateBlocks = [
  '\nexport type UpdateSearchRankingWeightsInput = {\n  averageRating?: number | null | undefined;\n  personalizationCap?: number | null | undefined;\n  prefixBoost?: number | null | undefined;\n  reviewCount?: number | null | undefined;\n  rrfK?: number | null | undefined;\n  soldCount?: number | null | undefined;\n  text?: number | null | undefined;\n  trigramFallbackThreshold?: number | null | undefined;\n  trigramMinSimilarity?: number | null | undefined;\n};\n',
];

const schemaBlocks = [
  "export type UpdateSearchRankingWeightsInput = {\n  averageRating?: InputMaybe<Scalars['Float']['input']>;\n  personalizationCap?: InputMaybe<Scalars['Float']['input']>;\n  prefixBoost?: InputMaybe<Scalars['Float']['input']>;\n  reviewCount?: InputMaybe<Scalars['Float']['input']>;\n  rrfK?: InputMaybe<Scalars['Int']['input']>;\n  soldCount?: InputMaybe<Scalars['Float']['input']>;\n  text?: InputMaybe<Scalars['Float']['input']>;\n  trigramFallbackThreshold?: InputMaybe<Scalars['Int']['input']>;\n  trigramMinSimilarity?: InputMaybe<Scalars['Float']['input']>;\n};",
];

let content = readFileSync(filePath, 'utf8');

for (let index = 0; index < duplicateBlocks.length; index += 1) {
  const duplicateBlock = duplicateBlocks[index];
  const schemaBlock = schemaBlocks[index];

  if (content.includes(schemaBlock) && content.includes(duplicateBlock)) {
    content = content.replace(duplicateBlock, '\n');
  }
}

writeFileSync(filePath, content);
