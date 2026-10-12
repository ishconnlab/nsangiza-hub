import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'

const auditLogSchema = new Schema(
  {
    actor: { type: String, default: 'system' },
    action: { type: String, required: true },
    resource: { type: String, default: '' },
    resourceId: { type: String, default: '' },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

export type AuditLogSchema = InferSchemaType<typeof auditLogSchema>
export type AuditLogDocument = HydratedDocument<AuditLogSchema>

const AuditLog = model('AuditLog', auditLogSchema)
export default AuditLog