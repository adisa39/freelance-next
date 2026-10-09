import mongoose, { Schema, type SchemaDefinition, type SchemaOptions, type Model, type Types } from 'mongoose';

export const oid = (ref: string, required = false) => ({ type: Schema.Types.ObjectId, ref, required });

/** Loose document shape: fields are validated by the schema; TS only needs _id + index access. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Doc = { _id: Types.ObjectId; [k: string]: any };

/** Define-or-reuse a model (hot-reload safe). Timestamps are on by default. */
export function defineModel(name: string, def: SchemaDefinition, opts: SchemaOptions = {}, extra?: (s: Schema) => void): Model<Doc> {
  if (mongoose.models[name]) return mongoose.models[name] as Model<Doc>;
  const schema = new Schema(def, { timestamps: true, ...opts });
  extra?.(schema);
  return mongoose.model<Doc>(name, schema);
}
