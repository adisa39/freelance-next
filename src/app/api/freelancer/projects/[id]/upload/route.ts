import { route, ok, bad, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { saveUpload } from '@/lib/upload';
import { Project } from '@/models/Marketplace';

const ALLOWED = ['zip', 'rar', 'pdf', 'doc', 'docx', 'xls', 'xlsx', '7z'];

/** multipart/form-data: project_file (required), comments. Moves project to buyer review. */
export const POST = route(async (req, ctx) => {
  const u = await requireUser('user');
  const { id } = await ctx.params;
  const project = await Project.findOne({ _id: id, user: u._id, status: { $in: [S.PROJECT.RUNNING, S.PROJECT.BUYER_REVIEW] } }).populate('job', 'title');
  if (!project) throw notFound('Project not found');
  const form = await req.formData();
  const file = form.get('project_file');
  if (!(file instanceof File) || !file.size) throw bad('The file is invalid or missing.');
  project.projectFile = await saveUpload(file, 'projects', ALLOWED, 50);
  project.comments = String(form.get('comments') ?? '');
  project.status = S.PROJECT.BUYER_REVIEW;
  project.uploadedAt = new Date();
  project.uploadCount = (project.uploadCount || 0) + 1;
  await project.save();
  await notify('buyer', project.buyer, 'Project delivered', `${u.firstname} uploaded work for "${project.job.title}"`, `/buyer/projects/${project._id}`);
  return ok();
});
