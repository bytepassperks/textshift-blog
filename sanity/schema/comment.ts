export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'text',
      title: 'Comment',
      type: 'text',
      rows: 4,
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'parentComment',
      title: 'Parent Comment (Reply To)',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'If this is a reply, reference the parent comment',
    },
    {
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false,
      description: 'Comments must be approved before they appear on the blog',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    },
  ],
  orderings: [
    {
      title: 'Created (Newest)',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      name: 'name',
      text: 'text',
      postTitle: 'post.title',
      approved: 'approved',
    },
    prepare(selection: { name: string; text: string; postTitle: string; approved: boolean }) {
      const status = selection.approved ? 'Approved' : 'Pending'
      return {
        title: `${selection.name} - [${status}]`,
        subtitle: `on "${selection.postTitle || 'Unknown Post'}" - ${(selection.text || '').substring(0, 80)}...`,
      }
    },
  },
}
