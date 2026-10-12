import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { RISK_LEVELS, SAFEGUARDING_STATUS } from '../constants'

const safeguardingCaseSchema = new Schema(
  {
    caseId: { type: String, required: true, unique: true },
    riskLevel: { type: String, enum: RISK_LEVELS, default: 'low' },
    status: { type: String, enum: SAFEGUARDING_STATUS, default: 'New' },
    summary: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    assignedReviewer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    assignedReviewerName: { type: String, default: '' },
    actions: {
      type: [
        {
          note: { type: String, default: '' },
          by: { type: String, default: '' },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

// Sensitive clinical details are deliberately NOT stored in a browsable field.
// Case detail bodies require elevated permissions and are fetched separately.

export type SafeguardingCaseSchema = InferSchemaType<typeof safeguardingCaseSchema>
export type SafeguardingCaseDocument = HydratedDocument<SafeguardingCaseSchema>

const SafeguardingCase = model('SafeguardingCase', safeguardingCaseSchema)
export default SafeguardingCase