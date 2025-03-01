import type { JsonObject, RequireExactlyOne } from 'type-fest';

/**
 * All metadata must extend a JSON object.
 * @see https://www.pinecone.io/docs/metadata-filtering/#supported-metadata-types
 */
export type RootMetadata = JsonObject;

/**
 * The possible leaf values for filter objects.
 * @note Null values aren't supported in metadata for filters, but are allowed here and automatically removed for convenience.
 */
type FilterValue = string | number | boolean | null | string[] | number[];
type FilterOperator =
  | '$eq'
  | '$ne'
  | '$gt'
  | '$gte'
  | '$lt'
  | '$lte'
  | '$in'
  | '$nin';

/**
 * An object of metadata filters.
 * @see https://www.pinecone.io/docs/metadata-filtering/
 */
export type Filter<Metadata extends RootMetadata> = {
  [key in keyof Metadata | FilterOperator]?:
    | FilterValue
    | {
        [key in keyof Metadata | FilterOperator]?: FilterValue;
      };
};

/**
 * Sparse vector data. Represented as a list of indices and a list of corresponded values, which must be the same length.
 */
export type SparseValues = {
  indices: number[];
  values: number[];
};

/**
 * The base vector object with strongly typed metadata.
 */
export type Vector<Metadata extends RootMetadata> = {
  id: string;
  values: number[];
  sparseValues?: SparseValues;
  metadata?: Metadata;
};

/**
 * The parameters for a vector query.
 */
export type QueryParams<Metadata extends RootMetadata> = RequireExactlyOne<
  {
    topK: number;
    minScore?: number;
    filter?: Filter<Metadata>;
    includeMetadata?: boolean;
    includeValues?: boolean;
    vector?: number[];
    sparseVector?: SparseValues;
    hybridAlpha?: number;
    id?: string;
  },
  // Queries must have either a vector or an id and cannot have both.
  'vector' | 'id'
>;

type ScoredVector = {
  id: string;
  score: number;
};

/**
 * Query results without metadata or vector values.
 */
export type QueryResultsBase = {
  namespace: string;
  matches: ScoredVector[];
};

/**
 * Query results with vector values and no metadata.
 */
export type QueryResultsValues = {
  namespace: string;
  matches: Prettify<
    ScoredVector & { values: number[]; sparseValues?: SparseValues }
  >[];
};

/**
 * Query results with metadata and no vector values.
 */
export type QueryResultsMetadata<Metadata extends RootMetadata> = {
  namespace: string;
  matches: Prettify<ScoredVector & { metadata: Metadata }>[];
};

/**
 * Query results with metadata and vector values.
 */
export type QueryResultsAll<Metadata extends RootMetadata> = {
  namespace: string;
  matches: Prettify<
    ScoredVector & {
      metadata: Metadata;
      values: number[];
      sparseValues?: SparseValues;
    }
  >[];
};

/**
 * Query results with metadata and vector values narrowed by the query parameters.
 */
export type QueryResults<
  Metadata extends RootMetadata,
  Params extends { includeMetadata?: boolean; includeValues?: boolean }
> = Params extends { includeValues: true; includeMetadata: true }
  ? QueryResultsAll<Metadata>
  : Params extends { includeValues: true }
  ? QueryResultsValues
  : Params extends { includeMetadata: true }
  ? QueryResultsMetadata<Metadata>
  : QueryResultsBase;

/**
 * The parameters that need null values removed.
 */
export type NoNullParams<Metadata extends RootMetadata> = {
  filter?: Filter<Metadata>;
  metadata?: Metadata;
  setMetadata?: Metadata;
};

/** Helper type to expand complex types into simple previews. */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
