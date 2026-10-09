import { defineModel, oid } from './_util';

export const Job = defineModel('Job', {
  buyer: oid('Buyer', true),
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: oid('Category', true),
  subcategory: oid('Subcategory', true),
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  customBudget: { type: Boolean, default: false }, // true => freelancers propose their own amount
  projectScope: Number,   // S.SCOPE
  jobLongevity: Number,   // S.LONGEVITY
  skillLevel: Number,     // S.SKILL_LEVEL
  deadline: { type: Date, required: true },
  questions: [String],
  skillIds: [oid('Skill')],
  status: { type: Number, default: 0 },      // S.JOB
  isApproved: { type: Number, default: 0 },  // S.JOB_APPROVAL
  interviews: { type: Number, default: 0 },
}, {}, (s) => { s.index({ status: 1, isApproved: 1, deadline: 1 }); s.index({ title: 'text' }); });

export const Bid = defineModel('Bid', {
  job: oid('Job', true),
  user: oid('User', true),
  buyer: oid('Buyer', true),
  bidAmount: { type: Number, required: true },
  estimatedTime: String,
  bidQuote: String,
  status: { type: Number, default: 0 },      // S.BID
  isShortlist: { type: Boolean, default: false },
  project: oid('Project'),
}, {}, (s) => s.index({ job: 1, user: 1 }, { unique: true })); // no duplicate bids

export const Project = defineModel('Project', {
  bid: oid('Bid', true),
  job: oid('Job', true),
  user: oid('User', true),
  buyer: oid('Buyer', true),
  status: { type: Number, default: 1 },      // S.PROJECT
  escrowAmount: { type: Number, default: 0 },
  projectFile: String,
  comments: String,
  reportReason: String,
  uploadedAt: Date,
  uploadCount: { type: Number, default: 0 },
});

export const Review = defineModel('Review', {          // buyer -> freelancer
  user: oid('User', true), buyer: oid('Buyer', true), project: oid('Project', true),
  rating: { type: Number, min: 1, max: 5 }, review: String,
}, {}, (s) => s.index({ project: 1 }, { unique: true }));

export const BuyerReview = defineModel('BuyerReview', { // freelancer -> buyer
  user: oid('User', true), buyer: oid('Buyer', true), project: oid('Project', true),
  rating: { type: Number, min: 1, max: 5 }, review: String,
}, {}, (s) => s.index({ project: 1, user: 1 }, { unique: true }));

export const Conversation = defineModel('Conversation', {
  buyer: oid('Buyer', true), user: oid('User', true), job: oid('Job'),
  blocked: { type: Boolean, default: false },
  lastMessageAt: { type: Date, default: Date.now },
}, {}, (s) => s.index({ buyer: 1, user: 1 }, { unique: true }));

export const Message = defineModel('Message', {
  conversation: oid('Conversation', true),
  senderRole: { type: String, enum: ['user', 'buyer', 'admin'], required: true },
  sender: { type: String, required: true },
  message: String,
  files: [String],
  buyerReadAt: Date,
  userReadAt: Date,
}, {}, (s) => s.index({ conversation: 1, createdAt: 1 }));
