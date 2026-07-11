import { readFileSync, writeFileSync } from 'node:fs';

const filePath = process.argv[2];
if (!filePath?.endsWith('graphql.ts')) {
  process.exit(0);
}

const duplicateBlocks = [
  '\nexport type UpdateSearchRankingWeightsInput = {\n  averageRating?: number | null | undefined;\n  personalizationCap?: number | null | undefined;\n  prefixBoost?: number | null | undefined;\n  reviewCount?: number | null | undefined;\n  rrfK?: number | null | undefined;\n  soldCount?: number | null | undefined;\n  text?: number | null | undefined;\n  trigramFallbackThreshold?: number | null | undefined;\n  trigramMinSimilarity?: number | null | undefined;\n};\n',
  '\nexport type CreateSearchSynonymInput = {\n  expansion: string;\n  isActive?: boolean | null | undefined;\n  terms: Array<string>;\n};\n\n\nexport type UpdateSearchSynonymInput = {\n  expansion?: string | null | undefined;\n  isActive?: boolean | null | undefined;\n  terms?: Array<string> | null | undefined;\n};\n',
];

const schemaBlocks = [
  "export type UpdateSearchRankingWeightsInput = {\n  averageRating?: InputMaybe<Scalars['Float']['input']>;\n  personalizationCap?: InputMaybe<Scalars['Float']['input']>;\n  prefixBoost?: InputMaybe<Scalars['Float']['input']>;\n  reviewCount?: InputMaybe<Scalars['Float']['input']>;\n  rrfK?: InputMaybe<Scalars['Int']['input']>;\n  soldCount?: InputMaybe<Scalars['Float']['input']>;\n  text?: InputMaybe<Scalars['Float']['input']>;\n  trigramFallbackThreshold?: InputMaybe<Scalars['Int']['input']>;\n  trigramMinSimilarity?: InputMaybe<Scalars['Float']['input']>;\n};",
  "export type CreateSearchSynonymInput = {\n  expansion: Scalars['String']['input'];\n  isActive?: InputMaybe<Scalars['Boolean']['input']>;\n  terms: Array<Scalars['String']['input']>;\n};",
];

let content = readFileSync(filePath, 'utf8');

const taxonomyOperationsDuplicateBlock =
  /\nexport type CreateBrandInput = \{\n  name: string;\n\};\n\nexport type CreateCategoryInput[\s\S]*?export type UpdateSearchSynonymInput = \{\n  expansion\?: string \| null \| undefined;\n  isActive\?: boolean \| null \| undefined;\n  terms\?: Array<string> \| null \| undefined;\n\};\n/;

if (taxonomyOperationsDuplicateBlock.test(content)) {
  content = content.replace(taxonomyOperationsDuplicateBlock, '\n');
}

for (let index = 0; index < duplicateBlocks.length; index += 1) {
  const duplicateBlock = duplicateBlocks[index];
  const schemaBlock = schemaBlocks[index];

  if (content.includes(schemaBlock) && content.includes(duplicateBlock)) {
    content = content.replace(duplicateBlock, '\n');
  }
}

writeFileSync(filePath, content);
