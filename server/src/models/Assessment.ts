import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'

const assessmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    responses: {
      type: [
        {
          questionId: { type: String, default: '' },
          value: { type: Schema.Types.Mixed, default: null },
        },
      ],
      default: [],
    },
    answers: { type: Schema.Types.Mixed, default: {} },
    summary: { type: String, default: '' },
    safetyFlag: { type: Boolean, default: false },
    safetyNote: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type AssessmentSchema = InferSchemaType<typeof assessmentSchema>
export type AssessmentDocument = HydratedDocument<AssessmentSchema>

const Assessment = model('Assessment', assessmentSchema)
export default Assessment